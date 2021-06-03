
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

  //*********** User Routes ************* *//
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


   //*********** Course Routes ************* *//

  // GET route that will return a list of all courses including the User that owns each course
  router.get('/courses', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
      include:[
        {
          model: User,
          attributes: ['firstName', 'lastName', 'emailAddress']
        }
      ]
    }); 
    res.json(courses);

      
    }));
 


  // GET route that will return corresponding course along with User that owns course
  router.get('/courses/:id', asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: ['id','title', 'description', 'estimatedTime', 'materialsNeeded'],
      include: [
        {
          model: User,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password']
          }
        }
      ]
    });
    //check if course exists
    if(course){
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course Not Found' });
    }
  }));

  


  // POST route that will create a new course, set the location header to the URI for the newly created course
  router.post('/courses', authenticateUser, asyncHandler(async(req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).location(`/api/courses/${course.id}`).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  }));



  // PUT route that will update the corresponding course 
  router.put('/courses/:id',  authenticateUser, asyncHandler(async(req, res) => {
    try {
      const course = await Course.update(req.body, {where: {id: req.params.id}});
      res.status(201).location(`/api/courses/${course.id}`).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }

  }));


  // DELETE route that will delete the corresponding course
  router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
    const course = await Course.findByPk(req.params.id);
  //check if course exists
  if(course) {
    //check course owner
    const user = req.currentUser;
    if(user.id === course.userId){ 
      await course.destroy();
      res.status(204).end();
    } 
     else {
      res.status(403).json({ message: 'Incorrect User' });      
    } 
  } else {
    res.status(404).json({message: 'Course Not Found'});
  }
}));
 





  module.exports = router;