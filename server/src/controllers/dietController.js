const dietService = require('../services/dietService');
const apiResponse = require('../utils/apiResponse');

const generatePlan = async (req, res, next) => {
  try {
    const userData = req.body;
    const plan = await dietService.generateAndSavePlan(userData);
    return res.status(201).json(apiResponse.success(plan));
  } catch (err) {
    next(err);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const plans = await dietService.listPlans();
    return res.json(apiResponse.success(plans));
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePlan, getPlans };
