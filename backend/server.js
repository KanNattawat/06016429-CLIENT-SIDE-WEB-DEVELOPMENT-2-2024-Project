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
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      name TEXT,
      description TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
}
initializeDatabase();

app.post(
  "/upload",
  upload.fields([{ name: "images", maxCount: 10 }, { name: "filename" }, { name: "description" }]),
  async (req, res) => {
    console.log("Received files:", req.files);
    console.log("Received body:", req.body);
    // Log body parameters (filename, description).
    try {
      const files = req.files["images"]; // Extract files
      const fileNames = req.body.filename; // Extract names from body
      const descrip = req.body.description;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Ensure fileNames is an array (it can be a single string if only one file is uploaded)
      const nameArray = Array.isArray(fileNames) ? fileNames : [fileNames];
      const desArray = Array.isArray(descrip) ? descrip : [descrip];

      const fileRecords = files.map((file, index) => ({
        filename: file.filename,
        filepath: `/uploads/${file.filename}`,
        name: nameArray[index] || file.originalname, // Use user input or fallback to original filename
        description: desArray[index] || ""
      }));

      const insertQuery =
        "INSERT INTO images (filename, filepath, name, description) VALUES ($1, $2, $3, $4) RETURNING *";

      const uploadedFiles = [];
      for (const file of fileRecords) {
        const result = await pool.query(insertQuery, [
          file.filename,
          file.filepath,
          file.name,
          file.description,
        ]);
        uploadedFiles.push(result.rows[0]);
      }

      res.json({ message: "Files uploaded successfully", files: uploadedFiles });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get list of uploaded files from PostgreSQL
app.get("/files", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images ORDER BY uploaded_at DESC");
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
    const result = await pool.query("SELECT * FROM images WHERE id = $1", [id]);

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
    await pool.query("DELETE FROM images WHERE id = $1", [id]);

    res.json({ message: "File deleted successfully", id });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create database table for comments if not exists
async function initializeCommentsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      image_id INT REFERENCES images(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
}
initializeCommentsTable();

// API endpoint to upload a comment for an image
app.post("/comment", async (req, res) => {
  try {
    const { image_id, comment } = req.body;
    
    if (!image_id || !comment) {
      return res.status(400).json({ message: "Image ID and comment are required" });
    }
    
    const insertQuery = "INSERT INTO comments (image_id, comment) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(insertQuery, [image_id, comment]);
    
    res.status(201).json({ message: "Comment added successfully", comment: result.rows[0] });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get comments for a specific image
app.get("/comments/:image_id", async (req, res) => {
  try {
    const { image_id } = req.params;
    
    const result = await pool.query("SELECT * FROM comments WHERE image_id = $1 ORDER BY created_at DESC", [image_id]);
    
    res.status(200).json({ comments: result.rows });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});