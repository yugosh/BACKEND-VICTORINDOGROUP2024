// middlewares/role.js
const role = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.dataUser.role)) {
            return res.status(403).json({ statusCode: 0, message: 'Access denied.' });
        }
        next();
    };
};

module.exports = role;