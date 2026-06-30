const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        res.json(await db.getAnalytics(req.userId));
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
