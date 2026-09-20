import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      input_type TEXT NOT NULL,
      original_input TEXT NOT NULL DEFAULT '',
      current_stage TEXT NOT NULL DEFAULT 'new',
      brief TEXT NOT NULL DEFAULT '',
      data JSON NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS project_events (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      payload JSON NOT NULL DEFAULT '{}',
      metadata JSON,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    CREATE INDEX IF NOT EXISTS idx_events_project ON project_events(project_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON project_events(type);
    
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      requirement TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      confidence REAL NOT NULL DEFAULT 0.5,
      design_impact TEXT NOT NULL DEFAULT '',
      technical_impact TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      parent_id TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      subject TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      artifact_type TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      approved_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      tags JSON NOT NULL DEFAULT '[]',
      access TEXT NOT NULL DEFAULT 'public',
      adapter TEXT NOT NULL,
      capabilities JSON NOT NULL DEFAULT '{}',
      auth_required INTEGER NOT NULL DEFAULT 0,
      license_notes TEXT NOT NULL DEFAULT '',
      priority REAL NOT NULL DEFAULT 0.5,
      freshness_policy TEXT NOT NULL DEFAULT 'monthly',
      last_verified TEXT
    );
    
    CREATE TABLE IF NOT EXISTS source_snapshots (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      content_hash TEXT,
      metadata JSON,
      FOREIGN KEY (source_id) REFERENCES sources(id)
    );
    
    CREATE TABLE IF NOT EXISTS references_table (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      source_id TEXT,
      url TEXT NOT NULL,
      title TEXT,
      design_dna_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS reference_assets (
      id TEXT PRIMARY KEY,
      reference_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      path TEXT NOT NULL,
      content_hash TEXT,
      mime_type TEXT,
      bytes INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (reference_id) REFERENCES references_table(id)
    );
    
    CREATE TABLE IF NOT EXISTS design_dna (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      source_id TEXT,
      reference_url TEXT,
      data JSON NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.5,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL,
      uri TEXT NOT NULL,
      source TEXT,
      content_hash TEXT,
      metadata JSON,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS exact_cache (
      cache_key TEXT PRIMARY KEY,
      operation TEXT NOT NULL,
      params_hash TEXT NOT NULL,
      result JSON NOT NULL,
      source_version TEXT,
      project_version TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );
    
    CREATE TABLE IF NOT EXISTS semantic_cache (
      id TEXT PRIMARY KEY,
      intent TEXT NOT NULL,
      vector JSON NOT NULL,
      project_scope TEXT,
      result JSON NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.9,
      source_versions JSON,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );
    
    CREATE TABLE IF NOT EXISTS text_embeddings (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      vector JSON NOT NULL,
      content_hash TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_text_emb_entity ON text_embeddings(entity_type, entity_id);
    
    CREATE TABLE IF NOT EXISTS visual_embeddings (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      vector JSON NOT NULL,
      perceptual_hash TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vis_emb_entity ON visual_embeddings(entity_type, entity_id);
    
    CREATE TABLE IF NOT EXISTS research_runs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      query TEXT NOT NULL,
      sources_queried JSON NOT NULL DEFAULT '[]',
      results JSON NOT NULL DEFAULT '[]',
      cache_hits INTEGER NOT NULL DEFAULT 0,
      browser_calls INTEGER NOT NULL DEFAULT 0,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS moodboards (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Moodboard',
      status TEXT NOT NULL DEFAULT 'draft',
      approved_at TEXT,
      data JSON NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS moodboard_items (
      id TEXT PRIMARY KEY,
      moodboard_id TEXT NOT NULL,
      category TEXT NOT NULL,
      source_url TEXT,
      preview_path TEXT,
      reason_selected TEXT,
      design_dna_id TEXT,
      intended_use TEXT,
      status TEXT NOT NULL DEFAULT 'keep',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (moodboard_id) REFERENCES moodboards(id)
    );
    
    CREATE TABLE IF NOT EXISTS storyboards (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Storyboard',
      status TEXT NOT NULL DEFAULT 'draft',
      approved_at TEXT,
      data JSON NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS storyboard_scenes (
      id TEXT PRIMARY KEY,
      storyboard_id TEXT NOT NULL,
      scene_number INTEGER NOT NULL,
      purpose TEXT NOT NULL,
      content TEXT,
      copy TEXT,
      hierarchy TEXT,
      layout TEXT,
      motion JSON,
      interaction JSON,
      responsive JSON,
      implementation_notes TEXT,
      data JSON NOT NULL DEFAULT '{}',
      FOREIGN KEY (storyboard_id) REFERENCES storyboards(id)
    );
    
    CREATE TABLE IF NOT EXISTS brand_systems (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      data JSON NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS design_tokens (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      brand_system_id TEXT,
      format TEXT NOT NULL DEFAULT 'json',
      tokens JSON NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS qa_runs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      findings JSON NOT NULL DEFAULT '[]',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS qa_findings (
      id TEXT PRIMARY KEY,
      qa_run_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      screen TEXT,
      component TEXT,
      issue TEXT NOT NULL,
      evidence TEXT,
      recommendation TEXT,
      resolved INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (qa_run_id) REFERENCES qa_runs(id)
    );
    
    CREATE TABLE IF NOT EXISTS critique_runs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS critique_findings (
      id TEXT PRIMARY KEY,
      critique_run_id TEXT NOT NULL,
      reviewer TEXT NOT NULL,
      severity TEXT NOT NULL,
      screen TEXT,
      component TEXT,
      issue TEXT NOT NULL,
      evidence TEXT,
      recommendation TEXT,
      confidence REAL NOT NULL DEFAULT 0.5,
      FOREIGN KEY (critique_run_id) REFERENCES critique_runs(id)
    );
    
    CREATE TABLE IF NOT EXISTS production_assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      path TEXT NOT NULL,
      content_hash TEXT,
      mime_type TEXT,
      metadata JSON,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS plugin_snapshots (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      plugin_id TEXT NOT NULL,
      plugin_version TEXT NOT NULL,
      manifest JSON NOT NULL,
      inputs JSON,
      hashes JSON,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS design_lineage (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      from_type TEXT NOT NULL,
      from_id TEXT NOT NULL,
      to_type TEXT NOT NULL,
      to_id TEXT NOT NULL,
      relationship TEXT NOT NULL DEFAULT 'derived_from',
      metadata JSON,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    CREATE INDEX IF NOT EXISTS idx_lineage_from ON design_lineage(from_type, from_id);
    CREATE INDEX IF NOT EXISTS idx_lineage_to ON design_lineage(to_type, to_id);
    
    CREATE TABLE IF NOT EXISTS token_metrics (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      tokens_before INTEGER NOT NULL DEFAULT 0,
      tokens_after INTEGER NOT NULL DEFAULT 0,
      tokens_saved INTEGER NOT NULL DEFAULT 0,
      compression_ratio REAL,
      semantic_cache_hits INTEGER NOT NULL DEFAULT 0,
      exact_cache_hits INTEGER NOT NULL DEFAULT 0,
      browser_calls_avoided INTEGER NOT NULL DEFAULT 0,
      model_calls_avoided INTEGER NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- FTS5 for vault full-text search
    CREATE VIRTUAL TABLE IF NOT EXISTS vault_fts USING fts5(
      entry_id,
      title,
      content,
      tags,
      category
    );
    
    -- Library assets
    CREATE TABLE IF NOT EXISTS library_assets (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      storage_mode TEXT NOT NULL DEFAULT 'owned',
      content_hash TEXT,
      title TEXT NOT NULL,
      description TEXT,
      mime_type TEXT,
      bytes INTEGER,
      source_type TEXT,
      source_url TEXT,
      origin_project_id TEXT,
      origin_path TEXT,
      license TEXT,
      tags JSON NOT NULL DEFAULT '[]',
      design_dna_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_library_kind ON library_assets(kind);
    CREATE INDEX IF NOT EXISTS idx_library_hash ON library_assets(content_hash);
  `);
}
