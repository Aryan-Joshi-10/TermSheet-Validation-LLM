const { signUp, login } = require("../controllers/AuthController.js");
const {
  signUpValidation,
  loginValidation,
} = require("../middlewares/AuthMiddleware");
const upload = require("../models/fileUpload");
const ensureAuthenticated = require("../middlewares/Auth");

const router = require("express").Router();

router.post(
  "/signup",
  upload.single("profilePicture"),
  signUpValidation,
  signUp
);

router.post("/login", loginValidation, login);

router.get("/verify", ensureAuthenticated, (req, res) => {
  res.send({ message: "You have access!", user: req.user });
});

module.exports = router;
