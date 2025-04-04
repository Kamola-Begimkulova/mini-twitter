const pool = require("../config/db");

// Post-ga like qo'yish yoki olib tashlash
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Post mavjudligini tekshirish
    const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    // Like mavjudligini tekshirish
    const likeCheck = await pool.query(
      "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    // Like mavjud bo'lsa - o'chirish, aks holda - qo'shish
    if (likeCheck.rows.length > 0) {
      // Like mavjud, o'chiramiz
      await pool.query(
        "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );
    } else {
      // Like mavjud emas, qo'shamiz
      await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [
        userId,
        postId,
      ]);
    }

    // Yangilangan post ma'lumotlarini qaytarish
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
      [postId]
    );

    res.status(200).json(post.rows[0]);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Kommentariyaga like qo'yish yoki olib tashlash
exports.likeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Kommentariya mavjudligini tekshirish
    const commentCheck = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: "Kommentariya topilmadi" });
    }

    // Like mavjudligini tekshirish
    const likeCheck = await pool.query(
      "SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
      [userId, commentId]
    );

    // Like mavjud bo'lsa - o'chirish, aks holda - qo'shish
    if (likeCheck.rows.length > 0) {
      // Like mavjud, o'chiramiz
      await pool.query(
        "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
        [userId, commentId]
      );
    } else {
      // Like mavjud emas, qo'shamiz
      await pool.query(
        "INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)",
        [userId, commentId]
      );
    }

    // Yangilangan kommentariya ma'lumotlarini qaytarish
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
      [commentId]
    );

    res.status(200).json(comment.rows[0]);
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};

// Mening like qo'ygan kommentariyalarim
exports.getMyLikedComments = async (req, res) => {
  try {
    const userId = req.user.id;

    const likedComments = await pool.query(
      `SELECT c.*, 
             (SELECT json_agg(cl.user_id) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes,
             (SELECT json_build_object(
                'id', u.id,
                'name', u.name,
                'username', u.username,
                'profile_picture', u.profile_picture
             ) FROM users u WHERE u.id = c.user_id) as user
             FROM comments c
             JOIN comment_likes cl ON c.id = cl.comment_id
             WHERE cl.user_id = $1
             ORDER BY cl.created_at DESC`,
      [userId]
    );

    res.status(200).json(likedComments.rows);
  } catch (error) {
    console.error("Get my liked comments error:", error);
    res.status(500).json({ error: "Server xatoligi" });
  }
};
