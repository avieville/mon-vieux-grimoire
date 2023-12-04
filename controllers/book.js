const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.modifiedName
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.modifiedName
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            const filename = book.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, function (err) {
              if (err) {
                console.log(err);
              }
            });

            res.status(200).json({ message: "Objet modifié!" });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getTheThreeBestBooksByRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: "desc" })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.sendRating = (req, res, next) => {
  if (req.body.rating < 0 || req.body.rating > 5) {
    res.status(400).json({ message: "the score must be between 0 and 5" });
  }

  Book.findOne({ _id: req.params.id }).then((book) => {
    if (book.ratings.some((rating) => rating.userId === req.auth.userId)) {
      res.status(401).json({ message: "You have already rated this book" });
    } else {
      const ratingObject = {
        userId: req.auth.userId,
        grade: req.body.rating,
      };

      book.ratings.push(ratingObject);

      const SumOflRating = book.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        0
      );
      book.averageRating = SumOflRating / book.ratings.length;

      book
        .save()
        .then(() => {
          res.status(200).json(book);
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }
  });
};
