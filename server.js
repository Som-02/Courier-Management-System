// server.js
const express = require('express');
const pool = require('./db');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve frontend files from 'public' folder

const PORT = process.env.PORT || 3000;

/**
 * Helper: findOrCreateCustomer({FullName, PhoneNumber, Address})
 * returns customerID
 */
async function findOrCreateCustomer({ FullName, PhoneNumber, Address }) {
  const conn = await pool.getConnection();
  try {
    // try find
    const [rows] = await conn.execute(
      `SELECT CustomerID FROM Customers WHERE FullName = ? AND PhoneNumber = ? LIMIT 1`,
      [FullName, PhoneNumber]
    );
    if (rows.length) return rows[0].CustomerID;

    // create
    const [res] = await conn.execute(
      `INSERT INTO Customers (FullName, PhoneNumber, Address) VALUES (?, ?, ?)`,
      [FullName, PhoneNumber, Address]
    );
    return res.insertId;
  } finally {
    conn.release();
  }
}

/**
 * Generate a simple tracking number (UUID short)
 */
function generateTrackingNumber() {
  return 'TRK-' + uuidv4().split('-')[0].toUpperCase();
}

/* ----------------- API Endpoints ------------------ */

/**
 * Create new courier (with sender & receiver)
 * Expects JSON:
 * {
 *   sender: {FullName, PhoneNumber, Address},
 *   receiver: {FullName, PhoneNumber, Address},
 *   weight,
 *   dispatchDate, // YYYY-MM-DD optional
 *   remarks
 * }
 */

app.post('/api/couriers', async (req, res) => {
  const payload = req.body;
  if (!payload.sender || !payload.receiver) {
    return res.status(400).json({ error: 'sender and receiver required' });
  }

  const conn = await pool.getConnection();
  try {
    const senderID = await findOrCreateCustomer(payload.sender);
    const receiverID = await findOrCreateCustomer(payload.receiver);

    const trackingNumber = generateTrackingNumber();
    const weight = payload.weight || 0.0;
    const dispatchDate = payload.dispatchDate || null;
    const remarks = payload.remarks || null;

    const [result] = await conn.execute(
      `INSERT INTO Couriers
       (TrackingNumber, SenderID, ReceiverID, Weight, DispatchDate, Remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [trackingNumber, senderID, receiverID, weight, dispatchDate, remarks]
    );

    const [createdRows] = await conn.execute(
      `SELECT c.*, s.FullName AS SenderName, r.FullName AS ReceiverName
       FROM Couriers c
       LEFT JOIN Customers s ON c.SenderID = s.CustomerID
       LEFT JOIN Customers r ON c.ReceiverID = r.CustomerID
       WHERE c.CourierID = ? LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json(createdRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  } finally {
    conn.release();
  }
});

/**
 * Get all couriers (with optional search query ?q=)
 * Also supports filter by status ?status=Delivered
 */
/**
 * Get all couriers (with optional search and filter)
 */
app.get('/api/couriers', async (req, res) => {
  const q = req.query.q || '';
  const status = req.query.status || '';

  const params = [];
  let sql = `
    SELECT c.CourierID, c.TrackingNumber, c.Weight, c.Status, c.DispatchDate, c.DeliveryDate,
           s.FullName AS SenderName, s.PhoneNumber AS SenderPhone,
           r.FullName AS ReceiverName, r.PhoneNumber AS ReceiverPhone,
           c.Remarks
    FROM Couriers c
    LEFT JOIN Customers s ON c.SenderID = s.CustomerID
    LEFT JOIN Customers r ON c.ReceiverID = r.CustomerID
    WHERE 1=1
  `;

  if (q) {
    sql += ` AND (c.TrackingNumber LIKE ? OR s.FullName LIKE ? OR r.FullName LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  if (status) {
    sql += ` AND c.Status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY c.CourierID DESC`;

  try {
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});


/**
 * Get a single courier by ID or by tracking number
 */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/user.html');
});



/**
 * Update courier (edit fields)
 * Accepts JSON with any of: weight, status, deliveryDate, remarks
 */
app.put('/api/couriers/:id', async (req, res) => {
  const id = req.params.id;
  let { status, deliveryDate, dispatchDate } = req.body;

  // Convert empty strings to null
  if (dispatchDate === '') dispatchDate = null;
  if (deliveryDate === '') deliveryDate = null;

  const updates = [];
  const params = [];

  if (status) { updates.push('Status = ?'); params.push(status); }
  if (deliveryDate !== undefined) { updates.push('DeliveryDate = ?'); params.push(deliveryDate); }
  if (dispatchDate !== undefined) { updates.push('DispatchDate = ?'); params.push(dispatchDate); }

  if (!updates.length) {
    return res.status(400).json({ error: 'No fields provided' });
  }

  const sql = `UPDATE Couriers SET ${updates.join(', ')} WHERE CourierID = ?`;
  params.push(id);

  try {
    const [result] = await pool.execute(sql, params);
    if (result.affectedRows > 0) {
      res.json({ message: 'Updated successfully', affected: result.affectedRows });
    } else {
      res.status(404).json({ error: 'Courier not found' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Database update error' });
  }
});



/**
 * Delete courier
 */
app.delete('/api/couriers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.execute(`DELETE FROM Couriers WHERE CourierID = ?`, [id]);
    res.json({ deletedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/* Simple health check */
app.get('/api/ping', (req, res) => res.json({ ok: true }));

/* Serve the app */
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
