const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "MiniTwitter",
  password: "12345abcd",
  port: 5432,
});

module.exports = pool;
