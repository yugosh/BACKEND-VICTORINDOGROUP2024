const db = require("../models/index");
const jwt = require('jsonwebtoken');
const user_account = db.user_account;
require('dotenv').config();

const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET_TOKEN);
        // const dataUser = await user_account.findOne({ username: decoded.username });
        const dataUser = await user_account.findOne({ username: decoded.username, token: decoded.token });

        console.log("dataUser", dataUser);
        console.log("decoded", decoded);

        if (!dataUser) {
            throw new Error('User not found');
        }

        req.dataUser = dataUser;
        next();
    } catch (error) {
        console.log("error", error);
        res.status(401).json({ statusCode: 0, message: 'Please authenticate.' });
    }
};

module.exports = auth;