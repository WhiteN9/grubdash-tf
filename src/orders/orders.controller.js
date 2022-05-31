const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: orders });
};

const create = (req, res) => {};

const read = (req, res) => {
  res.json({ data: res.locals.order });
};

const update = (req, res) => {};

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
const a = (req, res, next) => {};
const b = (req, res, next) => {};
const c = (req, res, next) => {};
module.exports = {
  list,
  create,
  read: [orderExists, read],
  update: [orderExists, update],
  delete: [destroy],
};
