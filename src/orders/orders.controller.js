const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: orders });
};

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    deliverTo,
    mobileNumber,
    status,
    dishes,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const read = (req, res) => {
  res.json({ data: res.locals.order });
};

const update = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = res.locals.order;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dish;

  res.json({ data: order });
};

const destroy = (req, res) => {};

const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;
  const orderFound = orders.find((order) => orderId === order.id);
  if (orderFound) {
    res.locals.order = orderFound;
    return next();
  } else {
    return next({
      status: 400,
      message: `The order id ${orderId} was not found`,
    });
  }
};

const updateOrderIdIsValid = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  const order = res.locals.order;
  if (id === null || id === undefined || !id || id === order) {
    return next();
  } else {
    return next({
      status: 400,
      message: `The requested id ${id} does not match with the current order id${order.id}`,
    });
  }
};

const orderHasProperty = (propertyName) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    } else {
      return next({
        status: 400,
        message: `Must include a ${propertyName}`,
      });
    }
  };
};
const orderHasDeliverTo = (req, res, next) => {};
const orderHasMobileNumber = (req, res, next) => {};
const orderHasDishes = (req, res, next) => {};
const orderHasADish = (req, res, next) => {};
module.exports = {
  list,
  create: [
    orderHasProperty("deliverTo"),
    orderHasProperty("mobileNumber"),
    orderHasProperty("status"),
    orderHasProperty("dishes"),
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    orderHasProperty("deliverTo"),
    orderHasProperty("mobileNumber"),
    orderHasProperty("status"),
    orderHasProperty("dishes"),
    updateOrderIdIsValid,
    update,
  ],
  delete: [destroy],
};
