import { dirname, join } from "path";
import express from "express";
import { fileURLToPath } from "url";

import rootRouter from "./routes/api/root.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3001;

app.use("/", express.static(join(__dirname, "public")));

app.use("/", rootRouter);

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
