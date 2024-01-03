const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imageProcessing = (req, res, next) => {
  if (!req.file) {
    next();
  } else {
    const originalPath = req.file.path;
    const filenameWithoutExtension = path.parse(req.file.filename).name;
    const targetExtension = "webp";
    const modifiedName = `${filenameWithoutExtension}_processed.${targetExtension}`;

    sharp(originalPath)
      .resize({ width: 463, height: 595 })
      .toFormat(targetExtension)
      .toFile(`images/${modifiedName}`)
      .then(() => {
        req.file.modifiedName = modifiedName;
        fs.unlink(originalPath, function (err) {
          if (err) {
            console.log(err);
          }
        });

        next();
      })
      .catch((err) => {
        res.status(500).send("Error processing image");
      });
  }
};

module.exports = imageProcessing;
