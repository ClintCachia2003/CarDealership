require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const { getDb } = require('./schema');

async function seed() {
  const db = getDb();

  const email = process.env.ADMIN_EMAIL || 'admin@dealership.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';

  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(email, hash);
  console.log(`Admin seeded: ${email}`);
  console.log('Remember to change the password!');
}

seed().catch(console.error);
