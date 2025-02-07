const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up the express app
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../myapp/static/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Upload to Svelte static folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
  }
});

const upload = multer({ storage: storage });

// Serve static files from the Svelte static folder
app.use('/uploads', express.static(uploadDir));

// Handle the file upload route
app.post('/upload', upload.array('images', 10), (req, res) => {
  console.log(req.files); // Log uploaded files
  res.json({ message: 'Files uploaded successfully', files: req.files });
});

// Get the list of uploaded files
app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading files', error: err });
        }

        // Generate public URLs for the files
        const fileUrls = files.map(file => `/uploads/${file}`);
        res.status(200).json({ files: fileUrls });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});