const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { generateStartupKit } = require('../ai');

const PIPELINE_STEPS = [
    'Understand', 'Research', 'Analysis', 'Identity',
    'Logo', 'Website', 'Products', 'Marketing',
    'SEO', 'Launch', 'Scale',
];

// ── List user's projects ──────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const projects = await db.listProjects(req.userId);
        res.json(projects);
    } catch (err) {
        console.error('List projects error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get single project with pipeline steps ─────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const project = await db.getProjectWithSteps(req.userId, req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Create project ─────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, description, category, tagline } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const project = await db.createProject(req.userId, {
            name,
            description: description || '',
            category: category || 'SaaS',
            tagline: tagline || '',
        }, PIPELINE_STEPS);

        const kit = await generateStartupKit(project);
        const builtProject = await db.applyStartupKit(req.userId, project.id, kit);

        res.status(201).json(builtProject || project);
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Delete project ──────────────────────────────────────────────────────────
router.post('/:id/regenerate', requireAuth, async (req, res) => {
    try {
        const project = await db.getProjectWithSteps(req.userId, req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const previousTemplateKey = project.steps
            ?.find((step) => step.step_name === 'Identity')
            ?.notes?.brand?.websiteTemplate?.key || '';

        const kit = await generateStartupKit({
            ...project,
            avoidTemplateKey: previousTemplateKey,
            regenerate: true,
            regenerateAt: new Date().toISOString(),
        });
        const builtProject = await db.applyStartupKit(req.userId, project.id, kit);

        res.json(builtProject || project);
    } catch (err) {
        console.error('Regenerate project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const project = await db.deleteProject(req.userId, req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
