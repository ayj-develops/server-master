const express = require('express');
const bodyParser = require('body-parser');
const hash = require('object-hash');
const mongoose = require('mongoose');


const User = require('../models/user.model');
const Club = require('../models/club.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

const { checkExist } = require('./exist');
const { getUser, getPost, getComment } = require('./miscallenous');
const { NotFound, BadRequest, Conflict, GeneralError } = require('../middleware/error');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/create', jsonParser, async (req, res) => {
    if (!checkExist(req.body.email)) {
        res.status(400).json({"Message": "Missing params"});
    }
    else if (!req.body.email.includes('tdsb.on.ca')) {
        res.status(400).json({"Message" : "Non-TDSB users are not allowed"});
    }
    else {
        const account_type = req.body.email.includes("@tdsb.on.ca") ? "teacher" : "student";
        const email = hash(req.body.email, {algorithm: 'sha1'});
        const {pfp} = req.body;
        
        if (!checkExist(await getUser('email', email))) {
            const createdAt = null;
            const newUser = account_type === "teacher" ? new User({ email, account_type, pfp, createdAt }) : new User({ email, account_type, pfp });
            newUser.save()
                .then(() => {
                    res.status(201).json({"Message" : "Success"});
                })
                .catch((err) => res.status(500).json({ Message: 'Server Error', Error: `${err}` }));
        }

        else {
            res.status(404).json({Message: "User already exists"})
        }
    }
})





router.get('/', jsonParser, async (req, res) => {
    if (!checkExist(req.query._id) && !checkExist(req.query.email)) {
        res.status(200).json(await User.find());
    }
    else if (checkExist(req.query._id)) {
        const {_id} = req.query;
        User.findById({ _id }, async (err, user) => {
            if (err)    res.status(500).json({Message : "Error"});
            else if (!checkExist(user)) res.status(404).json({Message : "User not found"});
            else res.status(200).json(user);
        })
    }
    else {
        const {email} = req.query;
        User.findOne({ email : req.query.email}, async (err, user) => {
            if (err)    res.status(500).json({Message : "Error"})
            else if (!checkExist(user)) res.status(404).json({Message : "User not found"});
            else res.status(200).json(user);
        })
    }
})


router.put('/like', jsonParser, async (req, res, next) => {
    try {
      const {userID, articleID} = req.body;
      if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
      else if (!checkExist(articleID)) throw new BadRequest('Missing required field: articleID');
      else {
        const user = await getUser('_id', userID);
        if (checkExist(user)) {
          const post = await getPost('_id', articleID);
          if (checkExist(post)) {
            if (user.liked.includes(articleID)) throw new Conflict('Resource conflict: Article is already liked');
            else {
                user.liked.addToSet(articleID);
                user.save().then(() => {
                    post.likes++;
                    post.save().then(() => {res.status(200).send({Message: "Success"})})
                    .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
                })
                .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
            }
          }
          //check comment now
          else {
            const comment = await getComment('_id', articleID);
            console.log(comment);
            if (checkExist(comment)) {
                if (user.liked.includes(articleID)) throw new Conflict('Resource conflict: Article is already liked');
                else {
                    user.liked.addToSet(articleID);
                    user.save().then(() => {
                        comment.likes++;
                        comment.save().then(() => {res.status(200).send({Message: "Success"})})
                        .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
                    })
                    .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
                }
            }
            else throw new NotFound('Article not found');
          }
        }
        else throw new NotFound('User not found');
      }
    }
    catch(err) {next(err)}
  })


module.exports = router;