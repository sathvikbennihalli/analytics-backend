const path = require("path");

const express = require("express");

const app = express();

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Hello!!");
});

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
