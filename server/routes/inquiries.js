const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/schema');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  [
    body('carId').optional({ nullable: true }).isInt(),
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional({ nullable: true }).trim().isLength({ max: 30 }),
    body('message').trim().notEmpty().isLength({ max: 2000 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { carId, name, email, phone, message } = req.body;
    const db = getDb();
    const result = db
      .prepare(
        'INSERT INTO inquiries (car_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)'
      )
      .run(carId || null, name, email, phone || null, message);

    console.log(`[Inquiry] id=${result.lastInsertRowid} from=${email} carId=${carId || 'general'}`);
    res.status(201).json({ success: true });
  }
);

router.get('/', requireAuth, (_req, res) => {
  const db = getDb();
  const inquiries = db
    .prepare(
      `SELECT i.*, c.make, c.model, c.year
       FROM inquiries i LEFT JOIN cars c ON i.car_id = c.id
       ORDER BY i.created_at DESC`
    )
    .all();
  res.json(inquiries);
});

module.exports = router;
