const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

// const { Router } = require('express');
// const router = new Router();

router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});

router.post("/signup", (req, res, next) => {
  let { username, password } = req.body;

  if (!username || !password) {
    res.render("auth/signup", {
      errorMessage: `All the form fields are required`,
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPass) => {
      User.create({ username, password: hashedPass })
        .then((user) => {
          console.log(`You just created the User: ${user}`);
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(`You are having this ${err} creating a User`);
        });
    });
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: `To login you must fill the requested fields in the form`,
    });
    return;
  }

  User.findOne({ username })
    .then((userFromDB) => {
      console.log(userFromDB);
      if (!userFromDB) {
        res.render("auth/login", {
          errorMessage: `This user doens't yet exists!!`,
        });
        return;
      } else if (bcryptjs.compareSync(password, userFromDB.password)) {
        req.session.currentUser = userFromDB;
        res.redirect("/private");
      } else {
        res.render("auth/login", {
          errorMessage: `The password doesn't match!!`,
        });
      }
      console.log(`this ${userFromDB} was found`);
    })
    .catch((err) =>
      console.log(`this ${err} was found while looking for the user`)
    );
});

router.get("/private", (req, res, next) => {
  res.render("privateRoutes/private", {
    userInSession: req.session.currentUser,
  });
});

router.get("/main", (req, res, next) => {
  res.render("privateRoutes/main", { userInSession: req.session.currentUser });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
