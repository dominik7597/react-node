const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const UsersController = require("../controllers/users");
const upload = require("../middleware/file-upload");

router.post(
  "/signup",
  upload.single("image"),
  UsersController.users_signup
);
router.post("/login", UsersController.users_login);
router.get("/", UsersController.users_get_all);
router.delete("/:userId", checkAuth, UsersController.users_delete);

module.exports = router;
