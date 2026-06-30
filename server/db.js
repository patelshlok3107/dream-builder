const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_STORE = (process.env.DATA_STORE || 'file').toLowerCase();
const usePostgres = DATA_STORE === 'postgres';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const pool = usePostgres
    ? new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vex_db',
    })
    : null;

const emptyStore = () => ({
    nextIds: { users: 1, projects: 1, pipeline_steps: 1, user_activity: 1 },
    users: [],
    projects: [],
    pipeline_steps: [],
    user_activity: [],
});

function now() {
    return new Date().toISOString();
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function ensureFileStore() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(emptyStore(), null, 2));
    }
}

function readStore() {
    ensureFileStore();
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
        console.error('Could not read local data store, resetting:', err);
        const store = emptyStore();
        writeStore(store);
        return store;
    }
}

function writeStore(store) {
    ensureFileStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function nextId(store, table) {
    const id = store.nextIds[table] || 1;
    store.nextIds[table] = id + 1;
    return id;
}

function recalcProject(store, projectId) {
    const project = store.projects.find((p) => p.id === Number(projectId));
    if (!project) return null;

    const steps = store.pipeline_steps.filter((s) => s.project_id === project.id);
    const done = steps.filter((s) => s.status === 'done').length;
    project.progress = steps.length ? Math.round((done / steps.length) * 100) : 0;
    project.stage = done === steps.length && steps.length > 0
        ? 'Complete'
        : steps.some((s) => s.status === 'working' || s.status === 'done')
            ? 'Building'
            : 'Idea';
    project.updated_at = now();
    return project;
}

function withCounts(store, project) {
    const steps = store.pipeline_steps.filter((s) => s.project_id === project.id);
    return {
        ...clone(project),
        steps_done: steps.filter((s) => s.status === 'done').length,
        steps_total: steps.length,
    };
}

async function query(text, params = []) {
    if (!pool) {
        throw new Error('Raw SQL is unavailable when DATA_STORE=file');
    }
    const result = await pool.query(text, params);
    return result.rows;
}

async function one(text, params = []) {
    const rows = await query(text, params);
    return rows[0] || null;
}

async function createUser({ email, password_hash, name = '' }) {
    if (pool) {
        return one(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
            [email, password_hash, name]
        );
    }

    const store = readStore();
    const user = {
        id: nextId(store, 'users'),
        email,
        password_hash,
        name,
        created_at: now(),
    };
    store.users.push(user);
    writeStore(store);
    const { password_hash: _hash, ...safeUser } = user;
    return clone(safeUser);
}

async function findUserByEmail(email) {
    if (pool) {
        return one('SELECT * FROM users WHERE email = $1', [email]);
    }

    const store = readStore();
    const user = store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    return user ? clone(user) : null;
}

async function logActivity(userId, action, details = {}) {
    if (pool) {
        return query(
            'INSERT INTO user_activity (user_id, action, details) VALUES ($1, $2, $3)',
            [userId, action, details]
        );
    }

    const store = readStore();
    store.user_activity.push({
        id: nextId(store, 'user_activity'),
        user_id: Number(userId),
        action,
        details,
        created_at: now(),
    });
    writeStore(store);
}

async function listProjects(userId) {
    if (pool) {
        return query(
            `SELECT p.*,
                (SELECT COUNT(*) FILTER (WHERE status = 'done') FROM pipeline_steps WHERE project_id = p.id) AS steps_done,
                (SELECT COUNT(*) FROM pipeline_steps WHERE project_id = p.id) AS steps_total
             FROM projects p
             WHERE p.user_id = $1
             ORDER BY p.updated_at DESC`,
            [userId]
        );
    }

    const store = readStore();
    return store.projects
        .filter((p) => p.user_id === Number(userId))
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .map((p) => withCounts(store, p));
}

async function getProject(userId, projectId) {
    if (pool) {
        return one('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
    }

    const store = readStore();
    const project = store.projects.find((p) => p.id === Number(projectId) && p.user_id === Number(userId));
    return project ? clone(project) : null;
}

async function getProjectWithSteps(userId, projectId) {
    if (pool) {
        const project = await getProject(userId, projectId);
        if (!project) return null;
        const steps = await query(
            'SELECT * FROM pipeline_steps WHERE project_id = $1 ORDER BY step_order',
            [projectId]
        );
        return { ...project, steps };
    }

    const store = readStore();
    const project = store.projects.find((p) => p.id === Number(projectId) && p.user_id === Number(userId));
    if (!project) return null;
    const steps = store.pipeline_steps
        .filter((s) => s.project_id === Number(projectId))
        .sort((a, b) => a.step_order - b.step_order);
    return { ...clone(project), steps: clone(steps) };
}

async function createProject(userId, payload, stepNames) {
    const { name, description = '', category = 'SaaS', tagline = '' } = payload;

    if (pool) {
        const project = await one(
            `INSERT INTO projects (user_id, name, description, category, tagline)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, name, description, category, tagline]
        );

        for (let i = 0; i < stepNames.length; i++) {
            await query(
                `INSERT INTO pipeline_steps (project_id, step_name, step_order, status)
                 VALUES ($1, $2, $3, 'pending')`,
                [project.id, stepNames[i], i + 1]
            );
        }

        await query(
            `UPDATE pipeline_steps SET status = 'working', started_at = NOW()
             WHERE project_id = $1 AND step_order = 1`,
            [project.id]
        );
        await logActivity(userId, 'create_project', { project_id: project.id, project_name: name });
        return one('SELECT * FROM projects WHERE id = $1', [project.id]);
    }

    const store = readStore();
    const project = {
        id: nextId(store, 'projects'),
        user_id: Number(userId),
        name,
        description,
        category,
        tagline,
        stage: 'Idea',
        progress: 0,
        brand_colors: {},
        logo_url: '',
        website_url: '',
        created_at: now(),
        updated_at: now(),
    };
    store.projects.push(project);

    stepNames.forEach((stepName, index) => {
        store.pipeline_steps.push({
            id: nextId(store, 'pipeline_steps'),
            project_id: project.id,
            step_name: stepName,
            step_order: index + 1,
            status: index === 0 ? 'working' : 'pending',
            started_at: index === 0 ? now() : null,
            completed_at: null,
            notes: {},
        });
    });

    recalcProject(store, project.id);
    store.user_activity.push({
        id: nextId(store, 'user_activity'),
        user_id: Number(userId),
        action: 'create_project',
        details: { project_id: project.id, project_name: name },
        created_at: now(),
    });
    writeStore(store);
    return clone(project);
}

async function deleteProject(userId, projectId) {
    if (pool) {
        const project = await getProject(userId, projectId);
        if (!project) return null;
        await query('DELETE FROM projects WHERE id = $1', [projectId]);
        await logActivity(userId, 'delete_project', {
            project_id: Number(projectId),
            project_name: project.name,
        });
        return project;
    }

    const store = readStore();
    const index = store.projects.findIndex((p) => p.id === Number(projectId) && p.user_id === Number(userId));
    if (index === -1) return null;
    const [project] = store.projects.splice(index, 1);
    store.pipeline_steps = store.pipeline_steps.filter((s) => s.project_id !== Number(projectId));
    store.user_activity.push({
        id: nextId(store, 'user_activity'),
        user_id: Number(userId),
        action: 'delete_project',
        details: { project_id: Number(projectId), project_name: project.name },
        created_at: now(),
    });
    writeStore(store);
    return clone(project);
}

async function getPipelineSteps(userId, projectId) {
    const project = await getProject(userId, projectId);
    if (!project) return null;

    if (pool) {
        return query(
            'SELECT * FROM pipeline_steps WHERE project_id = $1 ORDER BY step_order',
            [projectId]
        );
    }

    const store = readStore();
    return clone(
        store.pipeline_steps
            .filter((s) => s.project_id === Number(projectId))
            .sort((a, b) => a.step_order - b.step_order)
    );
}

async function updatePipelineStep(userId, projectId, stepId, { status, notes }) {
    if (pool) {
        const step = await one(
            `SELECT ps.*, p.user_id
             FROM pipeline_steps ps
             JOIN projects p ON p.id = ps.project_id
             WHERE ps.id = $1 AND ps.project_id = $2 AND p.user_id = $3`,
            [stepId, projectId, userId]
        );
        if (!step) return null;

        const sets = [];
        const values = [];
        let paramIdx = 1;

        if (status) {
            sets.push(`status = $${paramIdx++}`);
            values.push(status);
        }
        if (status === 'working' && !step.started_at) sets.push('started_at = NOW()');
        if (status === 'done') sets.push('completed_at = NOW()');
        if (notes) {
            sets.push(`notes = $${paramIdx++}`);
            values.push(JSON.stringify(notes));
        }
        if (sets.length === 0) return step;

        values.push(stepId);
        const updated = await one(
            `UPDATE pipeline_steps SET ${sets.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
            values
        );

        if (status === 'done') {
            const nextStep = await one(
                `SELECT * FROM pipeline_steps
                 WHERE project_id = $1 AND step_order = $2 AND status = 'pending'
                 ORDER BY step_order LIMIT 1`,
                [projectId, step.step_order + 1]
            );
            if (nextStep) {
                await query('UPDATE pipeline_steps SET status = \'working\', started_at = NOW() WHERE id = $1', [nextStep.id]);
            }
            await logActivity(userId, 'complete_step', {
                project_id: Number(projectId),
                step_name: step.step_name,
                step_order: step.step_order,
            });
        }

        return updated;
    }

    const store = readStore();
    const project = store.projects.find((p) => p.id === Number(projectId) && p.user_id === Number(userId));
    const step = store.pipeline_steps.find((s) => s.id === Number(stepId) && s.project_id === Number(projectId));
    if (!project || !step) return null;

    if (status) step.status = status;
    if (status === 'working' && !step.started_at) step.started_at = now();
    if (status === 'done') step.completed_at = now();
    if (notes) step.notes = notes;

    if (status === 'done') {
        const nextStep = store.pipeline_steps.find(
            (s) => s.project_id === Number(projectId) && s.step_order === step.step_order + 1 && s.status === 'pending'
        );
        if (nextStep) {
            nextStep.status = 'working';
            nextStep.started_at = now();
        }
        store.user_activity.push({
            id: nextId(store, 'user_activity'),
            user_id: Number(userId),
            action: 'complete_step',
            details: {
                project_id: Number(projectId),
                step_name: step.step_name,
                step_order: step.step_order,
            },
            created_at: now(),
        });
    }

    recalcProject(store, projectId);
    writeStore(store);
    return clone(step);
}

async function applyStartupKit(userId, projectId, kit) {
    if (pool) {
        const project = await getProject(userId, projectId);
        if (!project) return null;

        const brandColors = kit.brand?.palette || {};
        await query(
            `UPDATE projects SET tagline = $1, brand_colors = $2, logo_url = $3, website_url = $4, updated_at = NOW()
             WHERE id = $5 AND user_id = $6`,
            [
                kit.brand?.tagline || project.tagline,
                JSON.stringify(brandColors),
                kit.brand?.logoDataUrl || '',
                kit.website?.urlPath || '',
                projectId,
                userId,
            ]
        );

        const steps = await query('SELECT * FROM pipeline_steps WHERE project_id = $1 ORDER BY step_order', [projectId]);
        for (const step of steps) {
            await query(
                `UPDATE pipeline_steps
                 SET status = 'done', started_at = COALESCE(started_at, NOW()), completed_at = NOW(), notes = $1
                 WHERE id = $2`,
                [JSON.stringify(stepNotes(kit, step.step_name)), step.id]
            );
        }

        await logActivity(userId, 'ai_build_complete', { project_id: Number(projectId), source: kit.source || 'unknown' });
        return getProjectWithSteps(userId, projectId);
    }

    const store = readStore();
    const project = store.projects.find((p) => p.id === Number(projectId) && p.user_id === Number(userId));
    if (!project) return null;

    project.tagline = kit.brand?.tagline || project.tagline;
    project.brand_colors = kit.brand?.palette || {};
    project.logo_url = kit.brand?.logoDataUrl || '';
    project.website_url = kit.website?.urlPath || '';

    store.pipeline_steps
        .filter((s) => s.project_id === Number(projectId))
        .forEach((step) => {
            step.status = 'done';
            step.started_at = step.started_at || now();
            step.completed_at = now();
            step.notes = stepNotes(kit, step.step_name);
        });

    store.user_activity.push({
        id: nextId(store, 'user_activity'),
        user_id: Number(userId),
        action: 'ai_build_complete',
        details: { project_id: Number(projectId), source: kit.source || 'unknown' },
        created_at: now(),
    });

    recalcProject(store, projectId);
    writeStore(store);
    return getProjectWithSteps(userId, projectId);
}

function stepNotes(kit, stepName) {
    const key = String(stepName || '').toLowerCase();
    const notes = {
        source: kit.source || 'local',
        summary: kit.steps?.[stepName] || kit.steps?.[key] || '',
    };

    if (key === 'understand') return { ...notes, brief: kit.brief };
    if (key === 'research') return { ...notes, research: kit.research };
    if (key === 'analysis') return { ...notes, analysis: kit.analysis };
    if (key === 'identity') return { ...notes, brand: kit.brand };
    if (key === 'logo') return { ...notes, logo: kit.brand?.logo, logoDataUrl: kit.brand?.logoDataUrl, palette: kit.brand?.palette };
    if (key === 'website') return { ...notes, website: kit.website };
    if (key === 'products') return { ...notes, products: kit.products };
    if (key === 'marketing') return { ...notes, marketing: kit.marketing };
    if (key === 'seo') return { ...notes, seo: kit.seo };
    if (key === 'launch') return { ...notes, launch: kit.launch };
    if (key === 'scale') return { ...notes, scale: kit.scale };
    return notes;
}

async function getAnalytics(userId) {
    if (pool) {
        const stats = await one(
            `SELECT
                (SELECT COUNT(*) FROM projects WHERE user_id = $1) AS total_projects,
                (SELECT COUNT(*) FILTER (WHERE stage = 'Building') FROM projects WHERE user_id = $1) AS active_projects,
                (SELECT COUNT(*) FILTER (WHERE stage = 'Complete') FROM projects WHERE user_id = $1) AS completed_projects,
                (SELECT COUNT(*) FROM user_activity WHERE user_id = $1) AS total_actions,
                (SELECT COUNT(*) FILTER (WHERE action = 'login') FROM user_activity WHERE user_id = $1) AS total_logins,
                (SELECT COUNT(*) FROM pipeline_steps ps
                    JOIN projects p ON p.id = ps.project_id
                    WHERE p.user_id = $1 AND ps.status = 'done') AS steps_completed,
                (SELECT COUNT(*) FROM pipeline_steps ps
                    JOIN projects p ON p.id = ps.project_id
                    WHERE p.user_id = $1) AS steps_total`,
            [userId]
        );
        const activity = await query('SELECT * FROM user_activity WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId]);
        const dailyActivity = await query(
            `SELECT DATE(created_at) AS date,
                    COUNT(*) AS count,
                    COUNT(*) FILTER (WHERE action = 'login') AS logins,
                    COUNT(*) FILTER (WHERE action = 'create_project') AS projects,
                    COUNT(*) FILTER (WHERE action = 'complete_step') AS steps
             FROM user_activity
             WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
             GROUP BY DATE(created_at)
             ORDER BY date`,
            [userId]
        );
        const projectBreakdown = await query(
            `SELECT p.id, p.name, p.stage, p.progress, p.created_at,
                    (SELECT COUNT(*) FILTER (WHERE status = 'done') FROM pipeline_steps WHERE project_id = p.id) AS steps_done,
                    (SELECT COUNT(*) FROM pipeline_steps WHERE project_id = p.id) AS steps_total,
                    (SELECT MAX(ps.completed_at) FROM pipeline_steps ps WHERE ps.project_id = p.id) AS last_step_at
             FROM projects p
             WHERE p.user_id = $1
             ORDER BY p.updated_at DESC`,
            [userId]
        );
        const actionDist = await query(
            `SELECT action, COUNT(*) AS count
             FROM user_activity
             WHERE user_id = $1
             GROUP BY action
             ORDER BY count DESC`,
            [userId]
        );
        return { stats, activity, dailyActivity, projectBreakdown, actionDist };
    }

    const store = readStore();
    const projects = store.projects.filter((p) => p.user_id === Number(userId));
    const projectIds = new Set(projects.map((p) => p.id));
    const steps = store.pipeline_steps.filter((s) => projectIds.has(s.project_id));
    const activity = store.user_activity
        .filter((a) => a.user_id === Number(userId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const stats = {
        total_projects: projects.length,
        active_projects: projects.filter((p) => p.stage === 'Building').length,
        completed_projects: projects.filter((p) => p.stage === 'Complete').length,
        total_actions: activity.length,
        total_logins: activity.filter((a) => a.action === 'login').length,
        steps_completed: steps.filter((s) => s.status === 'done').length,
        steps_total: steps.length,
    };

    const byDate = new Map();
    activity.forEach((entry) => {
        const date = entry.created_at.slice(0, 10);
        const current = byDate.get(date) || { date, count: 0, logins: 0, projects: 0, steps: 0 };
        current.count += 1;
        if (entry.action === 'login') current.logins += 1;
        if (entry.action === 'create_project') current.projects += 1;
        if (entry.action === 'complete_step') current.steps += 1;
        byDate.set(date, current);
    });

    const actionCounts = new Map();
    activity.forEach((entry) => actionCounts.set(entry.action, (actionCounts.get(entry.action) || 0) + 1));

    return {
        stats,
        activity: clone(activity.slice(0, 50)),
        dailyActivity: Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)),
        projectBreakdown: projects
            .slice()
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .map((project) => {
                const projectSteps = steps.filter((s) => s.project_id === project.id);
                const completed = projectSteps.filter((s) => s.status === 'done');
                return {
                    id: project.id,
                    name: project.name,
                    stage: project.stage,
                    progress: project.progress,
                    created_at: project.created_at,
                    steps_done: completed.length,
                    steps_total: projectSteps.length,
                    last_step_at: completed
                        .map((s) => s.completed_at)
                        .filter(Boolean)
                        .sort()
                        .at(-1) || null,
                };
            }),
        actionDist: Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count),
    };
}

module.exports = {
    query,
    one,
    pool,
    dataStore: DATA_STORE,
    createUser,
    findUserByEmail,
    logActivity,
    listProjects,
    getProject,
    getProjectWithSteps,
    createProject,
    deleteProject,
    getPipelineSteps,
    updatePipelineStep,
    applyStartupKit,
    getAnalytics,
};
