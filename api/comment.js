const express = require('express');
const bodyParser = require('body-parser');
const Comment = require("../models/comment.model");
const hash = require('object-hash');
const { checkExist } = require('./exist');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/create", jsonParser, async (req, res) => {
    let { name, body, parent } = req.body;
    // do not await when querying mongoose
    if (!checkExist(name) || !checkExist(body) || !checkExist(parent)) {
        res.status(400).send({"Message" : "Missing params"});
    }
    else if (req.body.body.length > 500) {
        res.status(400).json({ "Message": "Word limit exceeded" });
    }
    else {
        name = hash(name, {algorithm: 'sha1'});
        const newComment = new Comment({ name, body, parent});
        newComment.save().then(() => {
            res.status(201).json({"Message": "Success"})
        })
        .catch(err => res.status(500).json({ "Message": "Server Error", "Error": `${err}` }));
    }
  });

  router.delete("/delete", jsonParser, async (req, res) => {
    let {_id, name} = req.body;
    name = hash(name, { algorithm: 'sha1' });
    User.findById( {_id}, (err, comment) => {
        if (err) {
            res.status(500).send({"Message" : "Error"});
        }
        else if (!checkExist(comment)) {
            res.status(400).send({"Message" : "Comment not found"})
        }
        else if (comment.name !== name) {
            res.status(400).send({"Message" : "This is not your comment"});
        }
        else {
            User.findByIdAndDelete({ _id }, (err, comment) => {
                if (err) res.status(500).json({ "Message" : "Error"});
                else {
                    res.status(200).send({ "Message" : "Success" });
                }
            })
        }
    })
    
})

  router.get("/", jsonParser, async (req, res) => {
      if (!checkExist(req.query._id)) {
        res.status(200).send(await Comment.find());
      }
      else {
          const {_id} = req.body;
          Comment.findById({_id}, async (err, comment) => {
              if (err) {
                  res.status(500).send({"Message" : "Error"});
              }
              else if (comment === null) {
                  res.status(400).send({"Message" : "Comment not found"});
              }
              else {
                  res.status(200).send(comment);
              }
          })
      }
  })

  router.put("/update", jsonParser, async (req, res) => {
      const { _id, body } = req.body;
      if (!checkExist(_id)) {
          res.status(400).send({"Message" : "_id param is missing"})
      }
      else 
      {
        let name = hash(req.body.name, {algorithmm : 'sha1'})
        Comment.findById( {_id}, (err, comment) => {
        if (err) {
            res.status(500).send({"Message" : "Error"})
        }
        else if (comment === null) {
            res.status(400).send({"Message" : "Comment not found"})
        }
        else if (name !== comment.name) {
            res.status(400).send({"Message" : "You are not the author of this comment"})
        }
        else {
            Comment.findByIdAndUpdate( {_id}, {"body" : body}, (err, comment) => {
                if (err) {
                    res.status(500).send({"Message" : "Error"});
                }
                else {
                    res.status(200).send({"Message": "Success"})
                }
            })
        }
        })
        }
  })

  
  module.exports = router;