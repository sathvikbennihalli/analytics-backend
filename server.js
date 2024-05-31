import dotenv from "dotenv";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import multer from "multer";
import { createPool } from "mysql2/promise";
import rootRouter from "./routes/api/root.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:3000",
  "https://bda6639a.analytics-frontend-1eg.pages.dev",
  "https://analytics-frontend-1eg.pages.dev",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

app.use("/", express.static(join(__dirname, "public")));
app.use("/", rootRouter);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "your_database_name",
});

const createTable = async (tableName, columns) => {
  try {
    const columnDefinitions = columns
      .map((column) => {
        // Check if the column name contains a space, if so, enclose it in backticks
        return column.includes(" ")
          ? `\`${column}\` VARCHAR(255)`
          : `${column} VARCHAR(255)`;
      })
      .join(", ");
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
    await pool.query(createTableQuery);
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

const generateTableName = () => {
  const timestamp = Date.now();
  return `data_${timestamp}`;
};

const generateInsertQuery = (tableName, columns) => {
  const placeholders = columns.map(() => "?").join(", ");
  const columnNames = columns
    .map((column) => {
      // Check if the column name contains a space, if so, enclose it in backticks
      return column.includes(" ") ? `\`${column}\`` : column;
    })
    .join(", ");

  return `INSERT INTO ${tableName} (${columnNames}) VALUES ?`;
};

app.post("/uploadData", async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: "Missing data" });
  }

  const tableName = generateTableName();

  try {
    const columns = Object.keys(data[0]);
    await createTable(tableName, columns);

    const query = generateInsertQuery(tableName, columns);

    const values = data.map((row) => Object.values(row));
    await pool.query(query, [values]);

    res.status(200).json({ message: "Data uploaded successfully", tableName });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Failed to upload data" });
  }
});

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
