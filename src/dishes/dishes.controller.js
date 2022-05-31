const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: dishes });
};

const read = (req, res) => {
  res.json({ data: res.locals.dish });
};

const dishExists = (req, res, next) => {
  const dishId = req.params.dishId;
  const dishFound = dishes.find((dish) => dish.id === dishId);
  if (dishFound) {
    res.locals.dish = dishFound;
    next();
    return;
  }
  return next({
    status: 404,
    message: `Dish ID not found: ${dishId}`,
  });
};
module.exports = {
  list,
  read: [dishExists, read],
};
