const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

module.exports = pool;
