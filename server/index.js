/**
 * VEX API Server — Express + PostgreSQL
 *
 * Entry point: mounts all route handlers and starts listening.
 *   POST /api/auth/register        create account
 *   POST /api/auth/login           sign in
 *   GET  /api/projects             list user's projects
 *   POST /api/projects             create a project (+ 11 pipeline steps)
 *   GET  /api/projects/:id         project + pipeline steps
 *   DELETE /api/projects/:id       remove a project
 *   GET  /api/pipeline/:projectId  list pipeline steps
 *   PUT  /api/pipeline/:projectId/:stepId   advance a step
 *   GET  /api/analytics            user activity + project stats
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const pipelineRoutes = require('./routes/pipeline');
const analyticsRoutes = require('./routes/analytics');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

// ── Health check ──
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── 404 handler ──
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ── Error handler ──
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`\n  VEX API server running on http://localhost:${PORT}`);
    console.log(`  Data store: ${db.dataStore}`);
    console.log(`  AI model: ${process.env.OPENROUTER_MODEL || 'anthropic/claude-opus-4.8'}`);
    console.log(`  AI key: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured, using local fallback'}\n`);
});
