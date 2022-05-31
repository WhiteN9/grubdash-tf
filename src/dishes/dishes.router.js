const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);
router.route("/:dishId").get(controller.read).all(methodNotAllowed);

module.exports = router;
