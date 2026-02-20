const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.post('/generate', dietController.generatePlan);
router.get('/', dietController.getPlans);

module.exports = router;
