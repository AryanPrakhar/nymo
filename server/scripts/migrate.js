require('dotenv').config();
const database = require('../models/database');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    await database.connect();
    await database.initialize();
    
    console.log('Database migration completed successfully');
    await database.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
