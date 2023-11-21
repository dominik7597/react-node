//ładuje model produktu
const Place = require("../models/place");
//sterownik mongodb
const mongoose = require("mongoose");

const User = require("../models/user");

exports.places_get_all = (req, res, next) => {
  Place.find()
    //wybieranie które pola mają się wyswietlać (bez __v)
    .select("_id title description image address creator")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        places: docs.map((doc) => {
          return {
            //spread operator, .toObject() - bez metadanych mongoose
            ...doc.toObject(),
            request: {
              type: "GET",
              url: "http://localhost:5000/places/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({
        error: err,
      });
    });
};

exports.places_get_by_user = (req, res, next) => {
  const userId = req.params.userId;
  Place.find({ creator: userId })
    .select("_id title description image address creator")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          request: {
            type: "GET",
            url: "http://localhost:5000/places",
          },
          places: doc,
        });
      } else {
        //id nie istnieje ale ma odpowiednią formę
        res.status(404).json({ message: "Entry not found" });
      }
    })
    //nieprawidłowa forma id
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({ error: err });
    });
};

exports.places_create = (req, res, next) => {
  User.findById(req.userData.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "Not existing user",
        });
      }
      const place = new Place({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description,
        image: req.file.path,
        address: req.body.address,
        creator: req.userData.userId,
      });
      user.places.push(place);
      user.save();
      return place.save();
    })
    .then((result) => {
      if (!res.headersSent) {
        console.log(result);
        //usuwam wartość __v
        const { __v, ...rest } = result.toObject();
        res.status(201).json({
          message: "Place added",
          createdOrder: {
            ...rest,
          },
          request: {
            type: "GET",
            url: "http://localhost:5000/places/" + result._id,
          },
        });
      }
    })
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({
        error: err,
      });
    });
};

exports.places_get = (req, res, next) => {
  const id = req.params.placeId;
  Place.findById(id)
    .select("title description _id")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          place: doc,
          request: {
            type: "GET",
            url: "http://localhost:5000/places",
          },
        });
      } else {
        //id nie istnieje ale ma odpowiednią formę
        res.status(404).json({ message: "Entry not found" });
      }
    })
    //nieprawidłowa forma id
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({ error: err });
    });
};

exports.places_patch = (req, res, next) => {
  const id = req.params.placeId;
  Place.findByIdAndUpdate({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "Place not existing",
        });
      }
      if (result.creator.toString() !== req.userData.userId) {
        return res.status(401).json({
          message: "Not authorized",
        });
      }
      res.status(200).json({
        message: "Place updated",
        request: {
          type: "GET",
          url: "http://localhost:5000/places/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({
        error: err,
      });
    });
};

exports.places_delete = (req, res, next) => {
  const id = req.params.placeId;
  User.findOne({ places: id })
    .exec()
    .then((result) => {
      if (result._id.toString() !== req.userData.userId) {
        return res.status(401).json({
          message: "Not authorized",
        });
      }
      console.log(result);
      result.places.pull(id);
      result.save();

      //nowa wersja mongoose (stara - remove)
      Place.deleteOne({ _id: id })
        .exec()
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.status(404).json({
              message: "Place not existing",
            });
          }
          res.status(200).json({
            message: "Place removed",
            request: {
              type: "POST",
              url: "http://localhost:5000/places",
              body: { name: "String", price: "Number" },
            },
          });
        })
        .catch((err) => {
          console.log(err.name);
          res.status(500).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({
        error: err,
      });
    });
};
