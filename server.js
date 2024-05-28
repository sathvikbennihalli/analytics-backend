import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import multer from "multer";

import rootRouter from "./routes/api/root.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3001;

// Configure CORS to allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
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

// Configure multer for file uploads
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

// Serve static files
app.use("/", express.static(join(__dirname, "public")));

// Use root router
app.use("/", rootRouter);

// Handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  // File uploaded successfully
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// Handle 404 errors
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
