const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS Configuration to allow multiple origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow localhost for development and production frontend URL
      if (
        origin === "http://localhost:5500" || // Local development
        origin === "https://coderarpan.github.io" || // Production frontend
        origin === "https://photos-wqb3.onrender.com" // Allow the backend itself
      ) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request from other origins
      }
    },
    methods: ["GET", "POST"], // Allow only GET and POST methods
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
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    const file = req.files.photo;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "photos_app", // Optional: Specify a folder in Cloudinary
    });

    res.status(200).json({
      message: "Photo uploaded successfully!",
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Error during photo upload:", error);
    res.status(500).json({ error: "Failed to upload photo" });
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
