const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Uploads papkasini tekshirish va yaratish
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllarini yuklash mumkin!"));
    }
  },
});

// Yangi post yaratish
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Post matni kiritilmagan" });
    }

    const image = req.file ? req.file.filename : null;

    // Yangi post qo'shish
    const newPost = await pool.query(
      `INSERT INTO posts (user_id, text, image) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, text, image]
    );

    // Post ma'lumotlarini to'liq qaytarish
    const post = await pool.query(
      `SELECT p.*, 
       (SELECT json_agg(l.user_id) FROM likes l WHERE l.post_id = p.id) as likes,
       (SELECT json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'profile_picture', u.profile_picture
       ) FROM users u WHERE u.id = p.user_id) as user
       FROM posts p
       WHERE p.id = $1`,
      [newPost.rows[0].id]
    );

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Barcha postlarni olish
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await pool.query(
      `SELECT p.*, 
       (SELECT json_agg(l.user_id) FROM likes l WHERE l.post_id = p.id) as likes,
       (SELECT json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'profile_picture', u.profile_picture
       ) FROM users u WHERE u.id = p.user_id) as user
       FROM posts p
       ORDER BY p.created_at DESC`
    );

    res.status(200).json(posts.rows);
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Foydalanuvchining o'z postlarini olish
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await pool.query(
      `SELECT p.*, 
       (SELECT json_agg(l.user_id) FROM likes l WHERE l.post_id = p.id) as likes,
       (SELECT json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'profile_picture', u.profile_picture
       ) FROM users u WHERE u.id = p.user_id) as user
       FROM posts p
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json(posts.rows);
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Postni o'chirish
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Post mavjudligini va foydalanuvchiga tegishli ekanligini tekshirish
    const postCheck = await pool.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );

    if (postCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Post topilmadi yoki sizga tegishli emas" });
    }

    // Postni o'chirish
    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);

    res.status(200).json({ message: "Post muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};
