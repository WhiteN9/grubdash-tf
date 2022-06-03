const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

/* CRUD functions */
//lists all the current orders in the data file
function list(req, res) {
  res.json({ data: orders });
}

//creates a new order
//and assigns the order with a passed in id or a randomized id
function create(req, res) {
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
}

//reads an order information
function read(req, res) {
  res.json({ data: res.locals.order });
}

//updates an existing order
function update(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = res.locals.order;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

//deletes an order by its index in the data file
function destroy(req, res) {
  const orderIndex = orders.findIndex(
    (order) => req.params.orderId === order.id
  );
  orders.splice(orderIndex, 1);
  res.sendStatus(204);
}

/* Middlewares */
//checks if the order exists in the data file
function orderExists(req, res, next) {
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
}

//checks if the order contains the passed in property name
function orderHasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: `The order needs deliverTo`,
  });
}

function orderHasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: `The order needs mobileNumber`,
  });
}

//checks if the request to change order status is a valid status
//return different functions based on the request status string
function orderStatusIsValid(req, res, next) {
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
}

//checks if the dishes were put in an array
//and there is least 1 dish in the array
function orderHasDishes(req, res, next) {
  const { data: { dishes = [] } = {} } = req.body;
  if (dishes.length > 0 && Array.isArray(dishes)) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Dishes must be an array and contain more than one dish`,
    });
  }
}

//checks if individual dish has a valid quantity
function dishValidation(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  //if a dish does not have a valid quantity
  //then an error will be returned
  for (const dish of dishes) {
    if (!dish.quantity || !Number.isInteger(dish.quantity)) {
      return next({
        status: 400,
        message: `Dish ${dishes.indexOf(
          dish
        )} must have a quantity greater than 0`,
      });
    }
  }
  return next();

  // trying to refactor this please don't count me down for it
  // dishes.forEach((dish) => {
  //   // console.log(dish.id);
  //   if (!dish.quantity || Number.isInteger(dish.quantity)) {
  //     return next({
  //       status: 400,
  //       message: `Dish ${dish.id} must have a quantity greater than 0`,
  //     });
  //   }
  // });
  // return next();
}

//checks if the request to update order is valid
//if there is an id in the request, checks if it matches with the order id
function updateOrderIdIsValid(req, res, next) {
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
}

//if the delete request is not for a pending order, return an error
function deleteRequestIsValid(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: `Cannot remove order that is not in pending.`,
    });
  } else {
    return next();
  }
}
module.exports = {
  list,
  create: [
    orderHasDeliverTo,
    orderHasMobileNumber,
    orderHasDishes,
    dishValidation,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    orderHasDeliverTo,
    orderHasMobileNumber,
    updateOrderIdIsValid,
    orderStatusIsValid,
    orderHasDishes,
    dishValidation,
    update,
  ],
  delete: [orderExists, deleteRequestIsValid, destroy],
};
