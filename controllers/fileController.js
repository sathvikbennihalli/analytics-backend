export const uploadFile = (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
};
