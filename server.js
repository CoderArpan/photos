const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Configure CORS to allow only the frontend domain
app.use(
  cors({
    origin: "https://coderarpan.github.io", // Replace this with your frontend URL
    methods: ["GET", "POST"], // Allow GET and POST methods
    allowedHeaders: ["Content-Type"], // Allow Content-Type header
  })
);

// Middleware to handle file uploads
app.use(fileUpload({ useTempFiles: true }));

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Test API endpoint
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Cloudinary Photo App Backend!");
});

// Upload endpoint (admin functionality)
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.photos || req.files.photos.length === 0) {
      return res.status(400).json({ error: "No photos uploaded" });
    }

    // Loop through each uploaded file and upload it to Cloudinary
    const uploadPromises = req.files.photos.map((file) => {
      return cloudinary.uploader.upload(file.tempFilePath, {
        folder: "photos_app", // Optional: Specify a folder in Cloudinary
      });
    });

    // Wait for all files to upload
    const uploadResults = await Promise.all(uploadPromises);

    // Get URLs of all uploaded files
    const uploadedUrls = uploadResults.map((result) => result.secure_url);

    res.status(200).json({
      message: "Photos uploaded successfully!",
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("Error during photo upload:", error);
    res.status(500).json({ error: "Failed to upload photos" });
  }
});

// Fetch all uploaded photos endpoint
app.get("/photos", async (req, res) => {
  try {
    // Fetch photos from Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "photos_app", // Fetch photos from the 'photos_app' folder
    });

    const photos = result.resources.map((photo) => ({
      url: photo.secure_url,
      public_id: photo.public_id,
    }));

    res.status(200).json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
