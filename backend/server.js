const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy; 
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// Cors Middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

// Express middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" },
  })
);

// Init passport
app.use(passport.initialize());
app.use(passport.session());

// OAuth API
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("User profile:", profile);
      return done(null, profile);
    }
  )
);

// Serialize user info into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route to initiate Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  req.session.user = {
    picture: req.user.photos[0].value,
    name: req.user.displayName,
    email: req.user.emails[0].value,
  };
  res.redirect("http://localhost:5173");
});

// Fetch user's data
app.get("/auth/user", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized", user: null });
  }
  res.json({ user: req.session.user });
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173/");
  });
});

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
app.use(express.json());

// Create images table with a category column
async function initializeDatabase() {
  const createImagesTableQuery = `
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      name TEXT,
      description TEXT,
      category TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createImagesTableQuery);
}
initializeDatabase();

// API endpoint to upload images with categories
app.post(
  "/upload",
  upload.fields([{ name: "images", maxCount: 10 }, { name: "filename" }, { name: "description" }, { name: "category" }]),
  async (req, res) => {
    console.log("Received files:", req.files);
    console.log("Received body:", req.body);

    try {
      const files = req.files["images"];
      const fileNames = req.body.filename;
      const descrip = req.body.description;
      const category = req.body.category;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const nameArray = Array.isArray(fileNames) ? fileNames : [fileNames];
      const desArray = Array.isArray(descrip) ? descrip : [descrip];

      const fileRecords = files.map((file, index) => ({
        filename: file.filename,
        filepath: `/uploads/${file.filename}`,
        name: nameArray[index] || file.originalname,
        description: desArray[index] || "",
        category: category || null,
      }));

      const insertQuery =
        "INSERT INTO images (filename, filepath, name, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING *";

      const uploadedFiles = [];
      for (const file of fileRecords) {
        const result = await pool.query(insertQuery, [
          file.filename,
          file.filepath,
          file.name,
          file.description,
          file.category,
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

// API endpoint to get images by category
app.get("/images/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    
    const result = await pool.query("SELECT * FROM images WHERE category = $1 ORDER BY uploaded_at DESC", [category]);
    
    res.status(200).json({ images: result.rows });
  } catch (error) {
    console.error("Error fetching images by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get all images
app.get("/files", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM images ORDER BY uploaded_at DESC"
    );
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
