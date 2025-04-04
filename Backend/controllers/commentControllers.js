const pool = require("../config/db");

// Yangi kommentariya yaratish
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Kommentariya matni kiritilmagan" });
    }

    // Post mavjudligini tekshirish
    const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    // Yangi kommentariya qo'shish
    const newComment = await pool.query(
      `INSERT INTO comments (user_id, post_id, text) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
      [userId, postId, text]
    );

    // Kommentariya ma'lumotlarini to'liq qaytarish
    const comment = await pool.query(
      `SELECT c.*, 
             (SELECT json_agg(cl.user_id) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes,
             (SELECT json_build_object(
                'id', u.id,
                'name', u.name,
                'username', u.username,
                'profile_picture', u.profile_picture
             ) FROM users u WHERE u.id = c.user_id) as user
             FROM comments c
             WHERE c.id = $1`,
      [newComment.rows[0].id]
    );

    res.status(201).json(comment.rows[0]);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Post uchun barcha kommentariyalarni olish
exports.getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Post mavjudligini tekshirish
    const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    // Postga tegishli kommentariyalarni olish
    const comments = await pool.query(
      `SELECT c.*, 
             (SELECT json_agg(cl.user_id) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes,
             (SELECT json_build_object(
                'id', u.id,
                'name', u.name,
                'username', u.username,
                'profile_picture', u.profile_picture
             ) FROM users u WHERE u.id = c.user_id) as user
             FROM comments c
             WHERE c.post_id = $1
             ORDER BY c.created_at DESC`,
      [postId]
    );

    res.status(200).json(comments.rows);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Kommentariyani o'chirish
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Kommentariya mavjudligini va foydalanuvchiga tegishli ekanligini tekshirish
    const commentCheck = await pool.query(
      "SELECT * FROM comments WHERE id = $1 AND user_id = $2",
      [commentId, userId]
    );

    if (commentCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Kommentariya topilmadi yoki sizga tegishli emas" });
    }

    // Kommentariyani o'chirish
    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    res.status(200).json({ message: "Kommentariya muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};
