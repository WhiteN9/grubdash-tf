const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: dishes });
};

const create = (req, res) => {
  console.log(nextId);
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    name,
    description,
    price,
    image_url,
    id: nextId(),
  };
  dish.push(newDish);
  res.status(201).json({ data: newDish });
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
  create: [create],
  read: [dishExists, read],
};
