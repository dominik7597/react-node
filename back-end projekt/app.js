// import ekspresa
const express = require("express");

//importuję zmienne środowiskowe
require("dotenv").config();

// instancja ekspresa
const app = express();

// uruchamiam logera
const morgan = require("morgan");
app.use(morgan("combined"));

//upubliczniam folder uploads
app.use("/uploads", express.static("uploads"));

// uruchamiam body parser
const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//sterownik mongodb
const mongoose = require("mongoose");

const fs = require("fs");

//dodanie naglowkow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT");
    return res.status(200).json({});
  }
  next();
});

//nowsza wersja - bez useMongoClient
mongoose.connect(
  "mongodb+srv://" +
    process.env.DB_USERNAME +
    ":" +
    process.env.DB_PASSWORD +
    "@cluster0.d4zpmxc.mongodb.net/my-rest-api?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//routy
const placesRoutes = require("./api/routes/places");
app.use("/places", placesRoutes);
const usersRoutes = require("./api/routes/users");
app.use("/users", usersRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  //zastepuje req errorem
  next(error);
});

//przyszlosciowe - zlapie tez errory z bazy danych (|| 500)
app.use((error, req, res, next) => {
  //rollback pliku
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
