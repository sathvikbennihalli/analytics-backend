import express from "express";
import upload from "../config/multer.js";
import { uploadData } from "../controllers/dataController.js";
import { uploadFile } from "../controllers/fileController.js";
import rootRouter from "./root.js"; // Import the root router

const router = express.Router();

router.use("/", rootRouter); // Use the root router
router.post("/upload", upload.single("file"), uploadFile);
router.post("/uploadData", uploadData);

export default router;
