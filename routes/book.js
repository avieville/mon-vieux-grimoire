const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

const imageProcessing = require("../middleware/imageProcessing");

router.post("/", auth, multer, imageProcessing, bookCtrl.createBook);
router.put("/:id", auth, multer, imageProcessing, bookCtrl.modifyBook);
router.get("/bestrating", bookCtrl.getTheThreeBestBooksByRating);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.sendRating);

module.exports = router;
