const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/schema');
const { requireAuth } = require('../middleware/auth');
const { upload, UPLOADS_DIR } = require('../middleware/upload');

const router = express.Router();

// ── helpers ─────────────────────────────────────────────────────────────────

function attachImages(db, cars) {
  const ids = cars.map((c) => c.id);
  if (!ids.length) return cars;
  const placeholders = ids.map(() => '?').join(',');
  const images = db
    .prepare(
      `SELECT car_id, filename FROM car_images WHERE car_id IN (${placeholders}) ORDER BY sort_order`
    )
    .all(...ids);
  const map = {};
  images.forEach((img) => {
    if (!map[img.car_id]) map[img.car_id] = [];
    map[img.car_id].push(img.filename);
  });
  return cars.map((c) => ({ ...c, images: map[c.id] || [] }));
}

// ── public routes ────────────────────────────────────────────────────────────

// GET /api/cars  — public inventory
router.get('/', (req, res) => {
  const db = getDb();
  const conditions = ["status = 'available'"];
  const params = [];

  if (req.query.make) {
    conditions.push('LOWER(make) = LOWER(?)');
    params.push(req.query.make);
  }
  if (req.query.minPrice) {
    conditions.push('price >= ?');
    params.push(Number(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    conditions.push('price <= ?');
    params.push(Number(req.query.maxPrice));
  }
  if (req.query.minYear) {
    conditions.push('year >= ?');
    params.push(Number(req.query.minYear));
  }
  if (req.query.maxYear) {
    conditions.push('year <= ?');
    params.push(Number(req.query.maxYear));
  }
  if (req.query.maxMileage) {
    conditions.push('mileage <= ?');
    params.push(Number(req.query.maxMileage));
  }

  const sortMap = {
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    year_desc: 'year DESC',
    year_asc: 'year ASC',
    mileage_asc: 'mileage ASC',
    newest: 'created_at DESC',
  };
  const sort = sortMap[req.query.sort] || 'created_at DESC';

  const cars = db
    .prepare(`SELECT * FROM cars WHERE ${conditions.join(' AND ')} ORDER BY ${sort}`)
    .all(...params);

  res.json(attachImages(db, cars));
});

// GET /api/cars/makes — distinct makes for filter UI
router.get('/makes', (_req, res) => {
  const db = getDb();
  const makes = db
    .prepare("SELECT DISTINCT make FROM cars WHERE status = 'available' ORDER BY make")
    .all()
    .map((r) => r.make);
  res.json(makes);
});

// GET /api/cars/:id — public single car
router.get('/:id', param('id').isInt(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid id' });

  const db = getDb();
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });

  const images = db
    .prepare('SELECT filename FROM car_images WHERE car_id = ? ORDER BY sort_order')
    .all(car.id)
    .map((r) => r.filename);

  res.json({ ...car, images });
});

// ── admin routes ─────────────────────────────────────────────────────────────

const carValidation = [
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 2 }),
  body('price').isFloat({ min: 0 }),
  body('mileage').isInt({ min: 0 }),
  body('vin').optional({ nullable: true }).trim(),
  body('color').optional({ nullable: true }).trim(),
  body('description').optional({ nullable: true }).trim(),
  body('fuelType').optional({ nullable: true }).trim(),
  body('transmission').optional({ nullable: true }).trim(),
];

// GET /api/cars/admin/all — all cars including sold
router.get('/admin/all', requireAuth, (_req, res) => {
  const db = getDb();
  const cars = db.prepare('SELECT * FROM cars ORDER BY created_at DESC').all();
  res.json(attachImages(db, cars));
});

// POST /api/cars — create
router.post(
  '/',
  requireAuth,
  upload.array('images', 10),
  carValidation,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) req.files.forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(400).json({ errors: errors.array() });
    }

    const { make, model, year, price, mileage, vin, color, description, fuelType, transmission } =
      req.body;
    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO cars (make, model, year, price, mileage, vin, color, description, fuel_type, transmission)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(make, model, year, price, mileage, vin || null, color || null, description || null, fuelType || null, transmission || null);

    const carId = result.lastInsertRowid;

    if (req.files && req.files.length) {
      const insertImg = db.prepare('INSERT INTO car_images (car_id, filename, sort_order) VALUES (?, ?, ?)');
      req.files.forEach((f, i) => insertImg.run(carId, f.filename, i));
    }

    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(carId);
    const images = db
      .prepare('SELECT filename FROM car_images WHERE car_id = ? ORDER BY sort_order')
      .all(carId)
      .map((r) => r.filename);

    res.status(201).json({ ...car, images });
  }
);

// PUT /api/cars/:id — update
router.put(
  '/:id',
  requireAuth,
  upload.array('images', 10),
  param('id').isInt(),
  carValidation,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) req.files.forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
    if (!car) return res.status(404).json({ error: 'Not found' });

    const { make, model, year, price, mileage, vin, color, description, fuelType, transmission, status } = req.body;

    db.prepare(
      `UPDATE cars SET make=?, model=?, year=?, price=?, mileage=?, vin=?, color=?, description=?,
       fuel_type=?, transmission=?, status=?, updated_at=datetime('now') WHERE id=?`
    ).run(make, model, year, price, mileage, vin || null, color || null, description || null, fuelType || null, transmission || null, status || car.status, car.id);

    // If new images uploaded, append them
    if (req.files && req.files.length) {
      const maxOrder = db
        .prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM car_images WHERE car_id = ?')
        .get(car.id).m;
      const insertImg = db.prepare('INSERT INTO car_images (car_id, filename, sort_order) VALUES (?, ?, ?)');
      req.files.forEach((f, i) => insertImg.run(car.id, f.filename, maxOrder + 1 + i));
    }

    // Handle deleted images
    if (req.body.deleteImages) {
      const toDelete = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : [req.body.deleteImages];
      toDelete.forEach((filename) => {
        db.prepare('DELETE FROM car_images WHERE car_id = ? AND filename = ?').run(car.id, filename);
        fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
      });
    }

    const updated = db.prepare('SELECT * FROM cars WHERE id = ?').get(car.id);
    const images = db
      .prepare('SELECT filename FROM car_images WHERE car_id = ? ORDER BY sort_order')
      .all(car.id)
      .map((r) => r.filename);

    res.json({ ...updated, images });
  }
);

// PATCH /api/cars/:id/status — mark sold/available
router.patch('/:id/status', requireAuth, param('id').isInt(), (req, res) => {
  const db = getDb();
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });

  const status = req.body.status === 'sold' ? 'sold' : 'available';
  db.prepare("UPDATE cars SET status=?, updated_at=datetime('now') WHERE id=?").run(status, car.id);
  res.json({ id: car.id, status });
});

// DELETE /api/cars/:id
router.delete('/:id', requireAuth, param('id').isInt(), (req, res) => {
  const db = getDb();
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ error: 'Not found' });

  const images = db.prepare('SELECT filename FROM car_images WHERE car_id = ?').all(car.id);
  images.forEach((img) => fs.unlink(path.join(UPLOADS_DIR, img.filename), () => {}));

  db.prepare('DELETE FROM cars WHERE id = ?').run(car.id);
  res.json({ success: true });
});

module.exports = router;
