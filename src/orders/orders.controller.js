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
  order.dishes = dishes;

  res.json({ data: order });
};

const destroy = (req, res) => {
  const orderIndex = orders.findIndex(
    (order) => req.params.orderId === order.id
  );
  orders.splice(orderIndex, 1);
  res.sendStatus(204);
};

const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;
  const orderFound = orders.find((order) => orderId === order.id);
  if (orderFound) {
    res.locals.order = orderFound;
    return next();
  } else {
    return next({
      status: 404,
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
  if (status === "delivered") {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  } else if (
    status === "pending" ||
    status === "preparing" ||
    status === "out-for-delivery"
  ) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
};
const orderHasDishes = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length > 0 && Array.isArray(dishes)) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Dishes must be an array and contain more than one dish`,
    });
  }
};
const dishValidation = (req, res, next) => {
  const {
    data: { dishes },
  } = req.body;

  for (const dish of dishes) {
    if (!dish.quantity || !Number.isInteger(dish.quantity)) {
      return next({
        status: 400,
        message: `Dish ${dishes.indexOf(
          dish
        )} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();

  // trying to refactor this please don't count me down for it
  //   let dish;
  //   const dishValidate = dishes.some((dish) => {
  //     dish = dish;
  //     return !dish.quantity || Number.isInteger(dish.quantity);
  //   });
  //   console.log(dish);
  //   if (dishValidate) {
  //     return next({
  //       status: 400,
  //       message: `Dish ${dish}`,
  //     });
  //   }
  //   return next();
};

const updateOrderIdIsValid = (req, res, next) => {
  const { data: { id } = {} } = req.body;
  const order = res.locals.order;
  console.log(id);
  if (id === null || id === undefined || !id || id === order.id) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${order.id}, Route: ${id}.`,
    });
  }
};
const deleteRequestIsValid = (req, res, next) => {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: `Cannot remove order that is not in pending.`,
    });
  } else {
    return next();
  }
};
module.exports = {
  list,
  create: [
    orderHasProperty("deliverTo"),
    orderHasProperty("mobileNumber"),
    orderHasProperty("dishes"),
    orderHasDishes,
    dishValidation,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    orderHasProperty("deliverTo"),
    orderHasProperty("mobileNumber"),
    orderHasProperty("dishes"),
    updateOrderIdIsValid,
    orderStatusIsValid,
    orderHasDishes,
    dishValidation,
    update,
  ],
  delete: [orderExists, deleteRequestIsValid, destroy],
};
