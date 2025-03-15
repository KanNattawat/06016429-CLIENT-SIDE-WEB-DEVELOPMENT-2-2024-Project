const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy; 
const FacebookStrategy = require("passport-facebook").Strategy;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const pg = require("pg");
const dotenv = require("dotenv");
const router = express.Router();

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

// Google OAuth API
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("User profile:", profile, "\n--------------------");
      return done(null, profile);
    }
  )
);

// Facebook OAuth API
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Facebook User profile:", profile, "\n--------------------");
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
  let user = req.user;
  let split = user.displayName.trim().split(" ");
  req.session.user = {
    picture: user.photos[0].value,
    formatName: split.length > 1 ? `${split[0]} ${split[split.length - 1][0] + "."}` : user.displayName,
    email: user.emails[0].value,
  };
  console.log("Session:", req.session.user, "\n--------------------")
  res.redirect("http://localhost:5173");
});

// Route to initiate Facebook OAuth
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/" }), (req, res) => {
    let user = req.user;
    let split = user.displayName.trim().split(" ");
    req.session.user = {
      picture: user.photos[0].value,
      formatName: split.length > 1 ? `${split[0]} ${split[split.length - 1][0] + "."}` : user.displayName,
      email: user.emails ? user.emails[0].value : "No email provided",
    };
    console.log("Session:", req.session.user);
    res.redirect("http://localhost:5173");
  }
);

// Fetch user's data
app.get("/auth/user", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized", user: null });
  }
  res.json({ user: req.session.user });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Logout failed" });
      }

      res.clearCookie("connect.sid", { path: "/" });
      console.log("User logged out successfully");
      res.json({ message: "Logged out successfully" });
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

// Create database tables if not exist
async function initializeDatabase() {
  const createImagesTableQuery = `
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      name TEXT,
      description TEXT,
      category TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      owner_email TEXT,
      visibility TEXT DEFAULT 'Public'
    );
  `;
  await pool.query(createImagesTableQuery);

  const createCategoriesTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `;
  await pool.query(createCategoriesTableQuery);

  const createFavTableQuery = `
  CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_email TEXT,
    image_id INTEGER REFERENCES images(id) ON DELETE CASCADE
  );
`;

  await pool.query(createFavTableQuery);

  const createCommentsTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      image_id INT REFERENCES images(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createCommentsTableQuery);
}
initializeDatabase();

// API endpoint to create a category
app.post("/category", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const insertQuery = "INSERT INTO categories (name) VALUES ($1) RETURNING *";
    const result = await pool.query(insertQuery, [name]);

    res.status(201).json({ message: "Category created successfully", category: result.rows[0] });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get all categories
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.status(200).json({ categories: result.rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// API endpoint to upload images with categories
app.post(
  "/upload",
  upload.fields([{ name: "images", maxCount: 10 }, { name: "filename" }, { name: "description" }, { name: "category" }, { name: "owner_email"}, { name: "visibility"}]),
  async (req, res) => {
    console.log("Received files:", req.files);
    console.log("Received body:", req.body);

    try {
      const files = req.files["images"];
      const fileNames = req.body.filename;
      const descrip = req.body.description;
      const categoryId = req.body.category;
      const ownerId = req.body.owner_email;
      const visibility = req.body.visibility;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const nameArray = Array.isArray(fileNames) ? fileNames : [fileNames];
      const desArray = Array.isArray(descrip) ? descrip : [descrip];
      const cateArray = Array.isArray(categoryId) ? categoryId : [categoryId];
      const ownArray = Array.isArray(ownerId) ? ownerId : [ownerId];
      const visArray = Array.isArray(visibility) ? visibility : [visibility];

      const fileRecords = files.map((file, index) => ({
        filename: file.filename,
        filepath: `/uploads/${file.filename}`,
        name: nameArray[index] || file.originalname,
        description: desArray[index] || "",
        category: cateArray[index] || "Uncategorized",
        owner_email: ownArray[index] || "Anonymous",
        visibility: visArray[index] || "Public",
      }));

      const insertQuery =
        "INSERT INTO images (filename, filepath, name, description, category, owner_email, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";

      const uploadedFiles = [];
      for (const file of fileRecords) {
        const result = await pool.query(insertQuery, [
          file.filename,
          file.filepath,
          file.name,
          file.description,
          file.category,
          file.owner_email,
          file.visibility,
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

// API endpoint to update image category
app.put("/image/:id/category", async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Check if the category exists
    const categoryResult = await pool.query("SELECT * FROM categories WHERE id = $1", [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the image's category
    const updateQuery = "UPDATE images SET category_id = $1 WHERE id = $2 RETURNING *";
    const result = await pool.query(updateQuery, [category_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.status(200).json({ message: "Image category updated successfully", image: result.rows[0] });
  } catch (error) {
    console.error("Error updating image category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get images by category
app.get("/images/category/:category_id", async (req, res) => {
  try {
    const { category_id } = req.params;
    
    const result = await pool.query("SELECT * FROM images WHERE category_id = $1 ORDER BY uploaded_at DESC", [category_id]);
    
    res.status(200).json({ images: result.rows });
  } catch (error) {
    console.error("Error fetching images by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get all images
app.get("/files", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHERE visibility = 'Public' ORDER BY uploaded_at DESC");
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// API endpoint to get images in the "Nature" category
app.get("/nature", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHERE visibility = 'Public' AND category = 'Nature' ORDER BY uploaded_at DESC");
    
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching Nature category images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/animals", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHERE visibility = 'Public' AND category = 'Animals' ORDER BY uploaded_at DESC");
    
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching Nature category images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/technology", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHERE visibility = 'Public' AND category = 'Technology' ORDER BY uploaded_at DESC");
    
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching Nature category images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/architecture", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHERE visibility = 'Public' AND category = 'Architecture' ORDER BY uploaded_at DESC");
    
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching Nature category images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/food", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images WHEREvisibility = 'Public' AND category = 'Food' ORDER BY uploaded_at DESC");
    
    res.status(200).json({ files: result.rows });
  } catch (error) {
    console.error("Error fetching Nature category images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// API endpoint to add a comment to an image
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.delete("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the image details from the database
    const result = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = result.rows[0];
    const filePath = path.join(__dirname, "../myapp/static", image.filepath);

    // Delete the file from the filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the image record from the database
    await pool.query("DELETE FROM images WHERE id = $1", [id]);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    // Check if the image exists
    const imageResult = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Update query
    const updateQuery = `
      UPDATE images 
      SET name = $1, description = $2, category = $3
      WHERE id = $4
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [name, description, category, id]);

    res.status(200).json({ message: "Image updated successfully", image: result.rows[0] });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a favorite
app.post("/favorite", async (req, res) => {
  try {
    const { user_email, image_id } = req.body;
    const result = await pool.query(
      "INSERT INTO favorites (user_email, image_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [user_email, image_id]
    );
    res.json({ success: true, favorite: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a favorite
app.delete("/favorite", async (req, res) => {
  try {
    const { user_email, image_id } = req.body;
    await pool.query(
      "DELETE FROM favorites WHERE user_email = $1 AND image_id = $2",
      [user_email, image_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's favorite images
app.get("/favorites/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      "SELECT images.* FROM images JOIN favorites ON images.id = favorites.image_id WHERE favorites.user_email = $1",
      [email]
    );
    res.json({ favorites: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's favorite images
app.get("/myuploads/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      "SELECT * FROM images WHERE owner_email = $1 ORDER BY uploaded_at DESC",
      [email]
    );
    res.json({ files: result.rows });  // Changed from 'favorites' to 'files'
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


