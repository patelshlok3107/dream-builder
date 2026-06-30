const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { generateStartupKit } = require('../ai');

const PIPELINE_STEPS = [
    'Understand', 'Research', 'Analysis', 'Identity',
    'Logo', 'Website', 'Products', 'Marketing',
    'SEO', 'Launch', 'Scale',
];

function isImageDataUrl(value) {
    return typeof value === 'string' && /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(value);
}

function normalizeUserAssets(input = {}) {
    const logoDataUrl = isImageDataUrl(input.logoDataUrl) ? input.logoDataUrl : '';
    const productImages = Array.isArray(input.productImages)
        ? input.productImages
            .filter((item) => isImageDataUrl(item?.dataUrl))
            .slice(0, 5)
            .map((item) => ({
                name: String(item.name || 'Uploaded product image').slice(0, 120),
                dataUrl: item.dataUrl,
            }))
        : [];
    return { logoDataUrl, productImages };
}

function userAssetsFromProject(project) {
    const identityBrand = project.steps
        ?.find((step) => step.step_name === 'Identity')
        ?.notes?.brand || {};
    const products = project.steps
        ?.find((step) => step.step_name === 'Products')
        ?.notes?.products || [];

    return normalizeUserAssets({
        logoDataUrl: identityBrand.uploadedLogoDataUrl || (identityBrand.logoSource === 'uploaded' ? identityBrand.logoDataUrl : ''),
        productImages: Array.isArray(products)
            ? products
                .filter((product) => product.imageSource === 'uploaded')
                .map((product) => ({
                    name: product.uploadedImageName || product.name,
                    dataUrl: product.imageDataUrl,
                }))
            : [],
    });
}

router.get('/', requireAuth, async (req, res) => {
    try {
        const projects = await db.listProjects(req.userId);
        res.json(projects);
    } catch (err) {
        console.error('List projects error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, description, category, tagline, userAssets } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const project = await db.createProject(req.userId, {
            name,
            description: description || '',
            category: category || 'SaaS',
            tagline: tagline || '',
        }, PIPELINE_STEPS);

        const kit = await generateStartupKit({
            ...project,
            userAssets: normalizeUserAssets(userAssets),
        });
        const builtProject = await db.applyStartupKit(req.userId, project.id, kit);

        res.status(201).json(builtProject || project);
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
            userAssets: userAssetsFromProject(project),
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
