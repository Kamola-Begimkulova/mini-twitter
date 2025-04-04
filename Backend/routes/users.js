// const express = require('express');
// const { getUsers, editUser, getUserById, deleteUser } = require('../controllers/userController');
// const router = express.Router();

// router.get("/", getUsers)
// router.get("/:id", getUserById)
// router.put("/:id", editUser)
// router.delete("/:id", deleteUser)

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getUsers,
  editUser,
  getUserById,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", editUser);
router.delete("/:id", deleteUser);

module.exports = router;
