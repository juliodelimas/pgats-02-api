const express = require('express');
const router = express.Router();
const transferService = require('../service/transferService');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, (req, res) => {
  const { from, to, value } = req.body;
  if (!from || !to || typeof value !== 'number') return res.status(400).json({ error: 'Campos obrigatórios: from, to, value' });
  try {
    const transfer = transferService.transfer({ from, to, value });
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authenticateToken, (req, res) => {
  res.json(transferService.listTransfers());
});

module.exports = router;
