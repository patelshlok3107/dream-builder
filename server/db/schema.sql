-- VEX Database Schema
-- Run: psql -U postgres -d vex_db -f server/db/schema.sql
-- Or create DB first: createdb -U postgres vex_db

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          VARCHAR(255) DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projects (per-user startups) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    description   TEXT DEFAULT '',
    category      VARCHAR(100) DEFAULT 'SaaS',
    tagline       VARCHAR(500) DEFAULT '',
    stage         VARCHAR(50)  DEFAULT 'Idea',
    progress      INT DEFAULT 0,            -- 0-100 computed from pipeline steps
    brand_colors  JSONB DEFAULT '{}',      -- { primary: '#xxx', secondary: '#xxx', accent: '#xxx' }
    logo_url      TEXT DEFAULT '',
    website_url   TEXT DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ── Pipeline Steps (per-project, 11 steps) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_steps (
    id            SERIAL PRIMARY KEY,
    project_id    INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_name     VARCHAR(100) NOT NULL,
    step_order    INT NOT NULL,
    status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','working','done')),
    started_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    notes         JSONB DEFAULT '{}'           -- generated assets, output, etc.
);

CREATE INDEX idx_pipeline_project_id ON pipeline_steps(project_id);

-- ── User Activity (analytics log) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action        VARCHAR(100) NOT NULL,       -- login, create_project, complete_step, etc.
    details       JSONB DEFAULT '{}',           -- { project_id, step_name, ... }
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_activity_created ON user_activity(created_at);

-- ── Function: auto-update project progress from pipeline steps ────────────
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects SET
        progress = (
            SELECT COALESCE(
                ROUND(
                    COUNT(*) FILTER (WHERE status = 'done')::numeric
                    / NULLIF(COUNT(*), 0) * 100
                ), 0
            )
            FROM pipeline_steps WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        updated_at = NOW(),
        stage = CASE
            WHEN (SELECT COUNT(*) FILTER (WHERE status = 'done') FROM pipeline_steps WHERE project_id = COALESCE(NEW.project_id, OLD.project_id))
                 = (SELECT COUNT(*) FROM pipeline_steps WHERE project_id = COALESCE(NEW.project_id, OLD.project_id))
            THEN 'Complete'
            WHEN (SELECT COUNT(*) FILTER (WHERE status IN ('working','done')) FROM pipeline_steps WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)) > 0
            THEN 'Building'
            ELSE 'Idea'
        END
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pipeline_progress ON pipeline_steps;
CREATE TRIGGER trg_pipeline_progress
    AFTER INSERT OR UPDATE OF status ON pipeline_steps
    FOR EACH ROW EXECUTE FUNCTION update_project_progress();
