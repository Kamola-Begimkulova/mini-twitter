const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getMyPosts,
  deletePost,
  upload,
} = require("../controllers/postController");
const authenticateToken = require("../middleware/user");

// Post yaratish (rasm bilan)
router.post("/", authenticateToken, upload.single("image"), createPost);

// Barcha postlarni olish
router.get("/all", authenticateToken, getAllPosts);

// Foydalanuvchining o'z postlarini olish
router.get("/my", authenticateToken, getMyPosts);

// Postni o'chirish
router.delete("/:id", authenticateToken, deletePost);

module.exports = router;
