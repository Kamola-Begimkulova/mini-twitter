const express = require("express");
const router = express.Router();
const {
  likePost,
  likeComment,
  getMyLikedComments,
} = require("../controllers/likeControllers");
const authenticateToken = require("../middleware/user");

// Post-ga like qo'yish/olib tashlash
router.post("/post/:id", authenticateToken, likePost);

// Kommentariyaga like qo'yish/olib tashlash
router.post("/comment/:id", authenticateToken, likeComment);

// Mening like qo'ygan kommentariyalarim
router.get("/comments/my", authenticateToken, getMyLikedComments);

module.exports = router;
