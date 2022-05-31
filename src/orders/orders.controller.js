const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: orders });
};

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes, id } = {} } =
    req.body;
  const newOrder = {
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
    id: id ? id : nextId(),
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

const orderStatusIsValid = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  const order = res.locals.order;
  if (status === "delivered" && status === order.status) {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  } else if (
    status === "pending" ||
    status === "preparing" ||
    status === "out-for-delivery" ||
    status === "delivered"
  ) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
};
const orderHasADish = (req, res, next) => {};

const updateOrderIdIsValid = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  const order = res.locals.order;
  if (id === null || id === undefined || !id || id === order.id) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${order.id}, Route: ${id}.`,
    });
  }
};
module.exports = {
  list,
  create: [
    orderHasProperty("deliverTo"),
    orderHasProperty("mobileNumber"),
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
    orderStatusIsValid,
    update,
  ],
  delete: [destroy],
};
