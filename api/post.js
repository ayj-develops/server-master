const express = require('express');
const bodyParser = require('body-parser');
const hash = require('object-hash');
const exist = require('./exist');
const Post = require('../models/post.model');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/create', jsonParser, async (req, res) => {
  if (exist.checkExist(req.body.title)
    && exist.checkExist(req.body.body)
    && exist.checkExist(req.body.club)
    && exist.checkExist(req.body.author)) {
    const { title, body, image } = req.body;
    const club = hash(req.body.club, { algorithm: 'sha1' });
    const author = hash(req.body.author, { algorithm: 'sha1' });

    const titleLength = req.body.length;
    const bodyLength = req.body.length;

    if (titleLength > 30) {
      res.status(400).json({ Message: 'Title is too long' });
    } else if (bodyLength > 500) res.status(400).json({ Message: 'Body text exceeds character limits' });
    else {
      const newPost = new Post({
        title, body, author, image, club,
      });
      newPost.save().then(() => {
        res.status(201).json({ Message: 'Success' });
      })
        .catch((err) => res.status(500).json({ Message: 'Server Error', Error: `${err}` }));
    }
  } else {
    res.status(400).send({ Message: 'Missing params' });
  }
});

router.get('/', jsonParser, async (req, res) => {
  if (!exist.checkExist(req.query._id)) res.status(200).send(await Post.find());
  else {
    const { _id } = req.body;
    Post.findById({ _id }, (err, post) => {
      console.log(post);
      if (err) res.status(500).send({ Message: 'Error' });
      else if (post === null) res.status(400).send({ Message: 'Post not found' });
      else {
        res.status(200).send(post);
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  const { _id } = req.body;
  if (!exist.checkExist(_id)) {
    res.status(400).send({ Message: 'ID params are missing' });
  } else if (!exist.checkExist(req.body.author)) {
    res.status(400).send({ Message: 'Author params are missing' });
  } else {
    const author = hash(req.body.author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not OP' });
      } else {
        Post.findByIdAndDelete({ _id }, (err, post) => {
          if (err) {
            res.status(500).send({ Message: 'Error' });
          } else {
            res.status(200).send({ Message: 'Success' });
          }
        });
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  const { _id } = req.body;
  if (_id === null) {
    res.status(400).send({ Message: 'ID params are missing' });
  } else if (author === null) {
    res.status(400).send({ Message: 'Author params are missing' });
  } else {
    const author = hash(req.body.author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not OP' });
      } else {
        Post.findByIdAndDelete({ _id }, (err, comment) => {
          if (err) {
            res.status(500).send({ Message: 'Error' });
          } else {
            res.status(200).send({ Message: 'Success' });
          }
        });
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  const { _id } = req.body;
  if (!exist.checkExist(_id)) {
    res.status(400).send({ Message: 'ID params are missing' });
  } else if (!exist.checkExist(req.body.author)) {
    res.status(400).send({ Message: 'Author params are missing' });
  } else {
    const author = hash(req.body.author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not OP' });
      } else {
        Post.findByIdAndDelete({ _id }, (err, post) => {
          if (err) {
            res.status(500).send({ Message: 'Error' });
          } else {
            res.status(200).send({ Message: 'Success' });
          }
        });
      }
    });
  }
});

router.put('/update', jsonParser, async (req, res) => {
  let {
    _id, title, body, image, author,
  } = req.body;

  // check for required params
  if (!exist.checkExist(_id)) {
    res.status(400).send({ Message: 'Id parameter missing' });
  } else if (!exist.checkExist(author)) {
    res.status(400).send({ Message: 'Author parameter is missing' });
  } else {
    author = hash(author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not the author of this post' });
      } else {
        if (exist.checkExist(title)) {
          title = post.title;
        }
        if (exist.checkExist(body)) {
          body = post.body;
        }
        if (exist.checkExist(image)) {
          image = post.image;
        }
        Post.findByIdAndUpdate({ _id }, { title, body, image }, (err, post) => {
          if (err) {
            res.status(500).send({ Message: 'Error' });
          } else {
            res.status(200).send({ Message: 'Success' });
          }
        });
      }
    });
  }
});

module.exports = router;
