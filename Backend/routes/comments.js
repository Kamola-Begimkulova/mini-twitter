const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsForPost,
  deleteComment,
} = require("../controllers/commentControllers");
const authenticateToken = require("../middleware/user");

// Kommentariya yaratish
router.post("/:id", authenticateToken, createComment);

// Post uchun kommentariyalarni olish
router.get("/:id", authenticateToken, getCommentsForPost);

// Kommentariyani o'chirish
router.delete("/:id", authenticateToken, deleteComment);

module.exports = router;
