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

const update = (req, res) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const dish = res.locals.dish;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
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

const dishBodyDataHas = (propertyName) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      next();
      return;
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
};

const priceIsMoreThanZero = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `The price needs to be more than 0 and an integer`,
    });
  }
  next();
};
const dishHasAName = (req, res, next) => {
  const { data: { name } = {} } = req.body;
  if (name) {
    next();
    return;
  }
  return next({
    status: 400,
    message: `A name is required for the dish`,
  });
};

module.exports = {
  list,
  create: [
    dishBodyDataHas("name"),
    dishBodyDataHas("description"),
    dishBodyDataHas("image_url"),
    dishBodyDataHas("price"),
    priceIsMoreThanZero,
    dishHasAName,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    dishBodyDataHas("name"),
    dishBodyDataHas("description"),
    dishBodyDataHas("image_url"),
    dishBodyDataHas("price"),
    priceIsMoreThanZero,
    dishHasAName,
    update,
  ],
};
