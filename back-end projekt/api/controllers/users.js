const User = require("../models/user");
const mongoose = require("mongoose");
//bibilioteka do hashowania hasła
const bcrypt = require("bcrypt");
//uwierzytelnianie tokenami
const jwt = require("jsonwebtoken");

exports.users_signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        return next(
          res.status(422).json({
            error: "User already exists.",
          })
        );
      } else {
        //10 - liczba salting rounds
        bcrypt.hash(req.body.password, 10);
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          email: req.body.email,
          image: req.file.path,
          password: hash,
          places: [],
        });
        user
          .save()
          .then((result) => {
            console.log(result);
            let token;
            try {
              token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_KEY,
                {
                  expiresIn: 30 * 60,
                }
              );
            } catch (err) {
              return next(err);
            }
            res.status(201).json({
              userId: result._id,
              email: result.email,
              token: token,
            });
          })
          .catch((err) => {
            console.log(err);
            return next(err);
          });
      }
    });
};

exports.users_login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(403).json({
          message: "Wrong credentials.",
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(403).json({
            message: "Wrong credentials.",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              userId: user._id,
              email: user.email,
            },
            process.env.JWT_KEY,
            {
              expiresIn: 30 * 60,
            }
          );
          return res.status(200).json({
            userId: user._id,
            email: user.email,
            token: token,
          });
        }
        res.status(403).json({
          message: "Wrong credentials.",
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

exports.users_get_all = (req, res, next) => {
  User.find()
    //wybieranie które pola mają się wyswietlać (bez __v)
    .select("name email places image")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          return {
            //spread operator, .toObject() - bez metadanych mongoose
            ...doc.toObject(),
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

exports.users_delete = (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "User not existing",
        });
      }
      res.status(200).json({
        message: "User removed",
      });
    })
    .catch((err) => {
      console.log(err.name);
      res.status(500).json({
        error: err,
      });
    });
};
