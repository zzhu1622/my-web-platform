const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Login function
exports.login = async (req, res) => {
    try {
        // Get email/uid and password from request body
        const { identifier, password } = req.body;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/UID and password'
            });
        }

        // Try to get database connection
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Query to find user by email OR UID
            const query = `
        SELECT UID, name, email, password 
        FROM User 
        WHERE email = ? OR UID = ?
      `;

            const [rows] = await connection.execute(query, [identifier, identifier]);

            // Check if user exists
            if (rows.length === 0) {
                connection.release();
                return res.status(401).json({
                    success: false,
                    message: 'Incorrect input of UID, email address or password'
                });
            }

            // Get user data
            const user = rows[0];

            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                connection.release();
                return res.status(401).json({
                    success: false,
                    message: 'Incorrect input of UID, email address or password'
                });
            }

            // Login successful
            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    UID: user.UID,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};