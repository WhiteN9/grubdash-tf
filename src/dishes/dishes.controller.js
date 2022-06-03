const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

/* CRUD functions */
//lists all the current dishes in the data file
function list(req, res) {
  res.json({ data: dishes });
}

//creates a new dish
//and assigns the dish with a passed in id or a randomized id
function create(req, res) {
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  const newDish = {
    name,
    description,
    price,
    image_url,
    id: id ? id : nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//reads a dish information
function read(req, res) {
  res.json({ data: res.locals.dish });
}

//updates an existing dish
function update(req, res, next) {
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  const dish = res.locals.dish;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

/* Middlewares */
//checks if the dish exists in the data file
function dishExists(req, res, next) {
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
}

//checks if the dish contains name
function dishHasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (!name) {
    return next({
      status: 400,
      message: `The dish must include a name`,
    });
  }
  next();
}
//checks if the dish contains description
function dishHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (!description) {
    return next({
      status: 400,
      message: `The dish must include a description`,
    });
  }
  next();
}
//checks if the dish contains image url
function dishHasImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (!image_url) {
    return next({
      status: 400,
      message: `The dish must include a image_url`,
    });
  }
  next();
}
//checks if the dish price is more than 0 and it is a valid number
function priceIsMoreThanZero(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `The price needs to be more than 0 and an integer`,
    });
  }
  next();
}

//checks if the request to update dish is valid
//if there is an id in the request, checks if it matches with the dish id
function updateDishIdIsValid(req, res, next) {
  const { data: { id } = {} } = req.body;
  const dish = res.locals.dish;
  if (!id || id === dish.id) {
    return next();
  } else {
    return next({
      status: 400,
      message: `The current dish id '${dish.id}' does not match with new dish id '${id}'`,
    });
  }
}
module.exports = {
  list,
  create: [
    dishHasName,
    dishHasDescription,
    dishHasImageUrl,
    priceIsMoreThanZero,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    dishHasName,
    dishHasDescription,
    dishHasImageUrl,
    priceIsMoreThanZero,
    updateDishIdIsValid,
    update,
  ],
};
