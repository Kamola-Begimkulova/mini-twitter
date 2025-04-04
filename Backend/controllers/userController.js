const pool = require("../config/db");
const getUsers = async (req, res) => {
    try {
        const users = await pool.query('SELECT id, name, username, profile_picture FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const editUser = async (req, res) => {
    try {
        const { id, name, username, profile_picture } = req.body;

        const result = await pool.query(
            'UPDATE users SET name = $1, username = $2, profile_picture = $3 WHERE id = $4 RETURNING *',
            [name, username, profile_picture, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getUserById = async (req, res) => {
    try {
        const users = await pool.query('SELECT id, name, username, profile_picture FROM users WHERE id = $1',
        [req.params.id] );
        res.json(users.rows);
        console.log(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}


module.exports = { getUsers, editUser, getUserById, deleteUser };