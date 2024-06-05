import {
  createTable,
  generateInsertQuery,
  insertData,
} from "../models/dataModel.js";

const generateTableName = () => `data_${Date.now()}`;

export const uploadData = async (req, res) => {
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
    await insertData(query, values);

    res.status(200).json({ message: "Data uploaded successfully", tableName });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Failed to upload data" });
  }
};
