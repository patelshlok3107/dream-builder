const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// ── Get pipeline steps for a project ───────────────────────────────────────
router.get('/:projectId', requireAuth, async (req, res) => {
    try {
        const steps = await db.getPipelineSteps(req.userId, req.params.projectId);
        if (!steps) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(steps);
    } catch (err) {
        console.error('Get pipeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Update a pipeline step (advance status) ────────────────────────────────
router.put('/:projectId/:stepId', requireAuth, async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status && !notes) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updated = await db.updatePipelineStep(req.userId, req.params.projectId, req.params.stepId, {
            status,
            notes,
        });
        if (!updated) {
            return res.status(404).json({ error: 'Step not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Update pipeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
