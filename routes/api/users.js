const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route	GET api/users/test
// @desc 	Tests users route
// @access 	Public
router.get('/test', (req, res) => res.json({msg: 'Users works'}));


// @route	POST api/users/register
// @desc 	Register a new user
// @access 	Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
	return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
	.then(user => {
	  if (user) {
		return res.status(400).json({email: 'Email already exists'})
	  } else {
	
		const avatar = gravatar.url(req.body.email, {
		  s: '200', // size
		  r: 'pg', // rating
		  d: 'mm', // default: blank user icon
		});

		const newUser = new User({
		  name: req.body.name,
		  email: req.body.email,
		  avatar,
		  password: req.body.password
		});

		bcrypt.genSalt(10, (err, salt) => {
		  bcrypt.hash(newUser.password, salt, (err, hash) => {
			if (err) throw err;
			newUser.password = hash;
			newUser
			  .save()
			  .then(user => res.json(user))
			  .catch(err => console.log(err));
		  })
	    })

	  }

	});
});


// @route	POST api/users/login
// @desc 	login a user 
// @access 	Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  console.log(errors)

  // Check validation
  if (!isValid) {
	return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email})
	.then( user => {
	  if (!user) {
		errors.email = 'User not found';
		return res.status(404).json(errors)
	  } 
	  
	  // Check password
	  bcrypt.compare(password, user.password)
		.then(isMatch => {
		  if (isMatch) {
			// User match 
			
			// Create JWT payload
			const payload = { id: user.id, name: user.name, avatar: user.avatar }

			// Sign token
			jwt.sign(payload, 
			  keys.secretOrKey, 
			  { expiresIn: 86400 }, 
			  (err, token) => {
			 	res.json({
				  success: true,
				  token: 'Bearer ' + token 
				})
			  }
			);

			// res.json({msg: 'Success'})
		  } else {
			errors.password = 'Password incorrect';
			return res.status(400).json(errors);
		  }
		});
	})

})

// @route	GET api/users/current
// @desc 	Return current user 
// @access 	Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
	id: req.user.id,
	name: req.user.name,
	email: req.user.email
  });
});

module.exports = router;
