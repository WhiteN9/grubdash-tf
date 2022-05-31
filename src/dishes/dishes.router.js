const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

router
  .route("/")

  .all(methodNotAllowed);
router
  .route("/:dishId")

  .all(methodNotAllowed);

module.exports = router;
