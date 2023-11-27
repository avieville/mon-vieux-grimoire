const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBook);
router.post("/", auth, multer, bookCtrl.createBook);

module.exports = router;
