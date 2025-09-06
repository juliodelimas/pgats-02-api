const express = require('express');
const userController = require('../controller/userController');
const transferController = require('../controller/transferController');

const router = express.Router();

router.use('/users', userController);
router.use('/transfers', transferController);

module.exports = router;
