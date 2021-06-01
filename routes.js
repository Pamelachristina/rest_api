
'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const { authenticateUser } = require('./middleware/auth-user');
const User = require('./models').User;
const Course = require('./models').Course;

// Handler function to wrap each route.
function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        // Forward error to the global error handler
        next(error);
      }
    }
  }

  // Route that returns an authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress
    });
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).location('/').end();
      //res.status(201).json({ "message": "Account successfully created!" });
    } catch (error) {
      console.log('ERROR: ', error.name);
  
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  }));

  module.exports = router;