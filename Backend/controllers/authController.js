const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// Uploads papkasini tekshirish va yaratish
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Ma'lumotlar to'liq kiritilmagan!" });
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (!result.rows[0]) {
      return res
        .status(401)
        .json({ error: "Foydalanuvchi nomi yoki parol noto'g'ri!" });
    }
    const validPassword = await bcrypt.compare(
      password,
      result.rows[0].password_hash
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ error: "Foydalanuvchi nomi yoki parol noto'g'ri!" });
    }
    const userData = result.rows[0];
    const user = {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      profile_picture: userData.profile_picture,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET || "JWT_SECRET", {
      expiresIn: "1h",
    });

    return res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server xatoligi" });
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ error: "Ma'lumotlar to'liq kiritilmagan!" });
    }

    // Foydalanuvchi nomi mavjudligini tekshirish
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Bu foydalanuvchi nomi allaqachon mavjud!" });
    }

    const profile_picture = req.file ? req.file.filename : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, username, password_hash, profile_picture) VALUES ($1, $2, $3, $4) RETURNING id, name, username, profile_picture",
      [name, username, hashedPassword, profile_picture]
    );

    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Server xatoligi" });
  }
};

module.exports = { loginUser, signupUser };
