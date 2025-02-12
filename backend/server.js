const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// PostgreSQL database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "../myapp/static/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Serve static files
app.use("/uploads", express.static(uploadDir));
app.use(cors());
app.use(express.json());

// Create database table if not exists
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
}
initializeDatabase();

// Handle file upload and store metadata in PostgreSQL
app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const fileRecords = files.map((file) => ({
      filename: file.filename,
      filepath: `/uploads/${file.filename}`,
    }));

    const insertQuery =
      "INSERT INTO uploads (filename, filepath) VALUES ($1, $2) RETURNING *";

    const uploadedFiles = [];
    for (const file of fileRecords) {
      const result = await pool.query(insertQuery, [file.filename, file.filepath]);
      uploadedFiles.push(result.rows[0]);
    }

    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get list of uploaded files from PostgreSQL
app.get("/files", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM uploads ORDER BY uploaded_at DESC");
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file in the database
    const result = await pool.query("SELECT * FROM uploads WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = path.join(__dirname, "../myapp/static", result.rows[0].filepath);

    // Delete the file from the uploads folder
    await fs.promises.unlink(filePath).catch((err) => {
      console.error("Error deleting file:", err);
      throw new Error("File deletion failed");
    });

    // Remove the record from PostgreSQL
    await pool.query("DELETE FROM uploads WHERE id = $1", [id]);

    res.json({ message: "File deleted successfully", id });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
