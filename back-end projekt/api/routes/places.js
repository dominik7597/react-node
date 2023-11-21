const express = require("express");
// wyciągam router
const router = express.Router();
//middleware do uwierzytelniania
const checkAuth = require("../middleware/check-auth");
//ładuję controller
const PlacesController = require("../controllers/places");
const upload = require("../middleware/file-upload")

router.get("/", PlacesController.places_get_all);
router.get("/user/:userId", PlacesController.places_get_by_user);
router.get("/:placeId", PlacesController.places_get);

router.use(checkAuth);

router.post(
  "/",
  upload.single("image"),
  PlacesController.places_create
);

router.patch("/:placeId", PlacesController.places_patch);
router.delete("/:placeId", PlacesController.places_delete);

module.exports = router;
