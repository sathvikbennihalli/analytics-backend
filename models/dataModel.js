import pool from "../config/database.js";

export const createTable = async (tableName, columns) => {
  const columnDefinitions = columns
    .map((column) =>
      column.includes(" ")
        ? `\`${column}\` VARCHAR(255)`
        : `${column} VARCHAR(255)`
    )
    .join(", ");
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
  await pool.query(createTableQuery);
};

export const generateInsertQuery = (tableName, columns) => {
  const placeholders = columns.map(() => "?").join(", ");
  const columnNames = columns
    .map((column) => (column.includes(" ") ? `\`${column}\`` : column))
    .join(", ");
  return `INSERT INTO ${tableName} (${columnNames}) VALUES ?`;
};

export const insertData = async (query, values) => {
  await pool.query(query, [values]);
};
