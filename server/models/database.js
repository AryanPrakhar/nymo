const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.DATABASE_PATH || './data/nymo.db';
      const dbDir = path.dirname(dbPath);
      
      // Ensure data directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.isConnected = true;
          resolve();
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
          this.isConnected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async initialize() {
    try {
      // Create posts table
      await this.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL CHECK(length(content) >= 1 AND length(content) <= 2000),
          post_type TEXT NOT NULL CHECK(post_type IN ('event', 'recommendation', 'alert', 'question', 'random')),
          latitude REAL NOT NULL CHECK(latitude >= -90 AND latitude <= 90),
          longitude REAL NOT NULL CHECK(longitude >= -180 AND longitude <= 180),
          location_hash TEXT NOT NULL,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          rank_score REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create votes table
      await this.run(`
        CREATE TABLE IF NOT EXISTS votes (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL,
          session_hash TEXT NOT NULL,
          vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 0, 1)),
          ip_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
          UNIQUE(post_id, session_hash)
        )
      `);

      // Create views table
      await this.run(`
        CREATE TABLE IF NOT EXISTS views (
          post_id TEXT NOT NULL,
          session_hash TEXT NOT NULL,
          viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (post_id, session_hash),
          FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
        )
      `);

      // Create indexes for performance
      await this.run('CREATE INDEX IF NOT EXISTS idx_posts_location ON posts (latitude, longitude)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_posts_rank ON posts (rank_score DESC, created_at DESC)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_posts_type_location ON posts (post_type, location_hash)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_votes_post_session ON votes (post_id, session_hash)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)');

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

module.exports = new Database();
