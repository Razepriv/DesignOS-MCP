import type { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import { loadConfig, type DesignOSConfig } from './config.js';
import { ensureDesignOSHome } from './paths.js';
import { EventBus } from './event-bus.js';
import { ProjectManager } from './project-manager.js';
import { Logger } from './logger.js';

export class DesignOS {
  readonly config: DesignOSConfig;
  readonly db: Database;
  readonly events: EventBus;
  readonly projects: ProjectManager;
  readonly logger: Logger;
  
  private constructor(config: DesignOSConfig, db: Database) {
    this.config = config;
    this.db = db;
    this.events = new EventBus(this.db);
    this.projects = new ProjectManager(this.db);
    this.logger = new Logger('DesignOS');
  }
  
  static async initialize(overrides?: Partial<DesignOSConfig>): Promise<DesignOS> {
    const config = loadConfig(overrides);
    await ensureDesignOSHome(config.home);
    const db = new DatabaseConstructor(config.dbPath);
    const instance = new DesignOS(config, db);
    instance.logger.info('DesignOS initialized', { home: config.home });
    return instance;
  }
  
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DesignOS');
    this.db.close();
  }
}
