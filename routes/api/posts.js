const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Load validation
const validatePostInput = require('../../validation/post');

// @route	GET api/posts/test
// @desc 	Tests post route
// @access 	Public
router.get('/test', (req, res) => res.json({msg:"posting works"}));

// @routes  GET api/posts
// @desc	Get posts
// @access	Public
router.get('/', (req, res) => {
  Post.find()
	.sort({date: -1})
	.then(posts => res.json(posts))
	.catch(err => res.status(404).json({ message: 'No posts found' }));
});

// @routes  GET api/posts/:id
// @desc	Get a post by id
// @access	Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
	.then(post => res.json(post))
	.catch(err => res.status(404).json({ message: 'No post found with that ID' }));
});


// @routes  POST api/posts
// @desc	Create a post
// @access	Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) {
	return res.status(400).json(errors);
  }

  const newPost = new Post({
	text: req.body.text,
	name: req.body.name,
	avatar: req.body.avatar,
	user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

// @routes	DELETE api/post/:id
// @desc	Delete post by id
// @access 	Private
router.delete('/:id', passport.authenticate('jwt',{ session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
	.then(profile => {
	  Post.findById(req.params.id)
		.then(post => {
		  // Check for post  owner
		  if (post.user.toString() !== req.user.id) {
			res.status(401).json({ notauthorized: 'User not authorized' });
		  }
		  // Delete post
		  post.remove().then(() => res.json({ success: true }));
		})
		.catch(err => res.status(404).json({ message: 'Post not found' }));
	})
});

module.exports = router;

