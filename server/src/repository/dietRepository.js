const DietPlan = require('../model/DietPlan');

const createDiet = async (doc) => {
  const d = new DietPlan(doc);
  return d.save();
};

const findAll = async (filter = {}) => {
  return DietPlan.find(filter).sort({ createdAt: -1 }).lean();
};

module.exports = {
  createDiet,
  findAll,
};
