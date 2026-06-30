const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vex-dev-secret-change-me';

/**
 * Middleware: verify JWT from Authorization header.
 * Sets req.userId if valid; returns 401 otherwise.
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const payload = jwt.verify(header.split(' ')[1], JWT_SECRET);
        req.userId = payload.userId;
        req.userEmail = payload.email;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { requireAuth, JWT_SECRET };
