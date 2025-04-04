const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Uploads papkasini tekshirish va yaratish
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server xatoligi yuz berdi" });
});

// Start server
const PORT =  8080;
app.listen(PORT, () => {
  console.log(`Server ishlayapti: http://localhost:${PORT}`);
  // console.log(`Uploads papkasi: ${uploadsDir}`);
});
