const express = require('express');
const bodyParser = require('body-parser');
const Post = require("../models/post.model");
const hash = require('object-hash');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/create", jsonParser, async (req, res) => {
    const {title, body, image} = req.body;
    let club = hash(req.body.club, {algorithm : 'sha1'});
    let author = hash(req.body.author, {algorithm : 'sha1'});

    const titleLength = req.body.length;
    const bodyLength = req.body.length;

    if (titleLength > 30) {
        res.status(400).json({"Message": "Title is too long"});
    }
    else if (bodyLength > 500) res.status(400).json({"Message": "Body text exceeds character limits"})
    else {
        const newPost = new Post({title, body, author, image, club});
        newPost.save().then(() => {
            res.status(201).json({"Message": "Success"});
        })
        .catch(err => res.status(500).json({ "Message": "Server Error", "Error": `${err}` }));
    }
})

router.get("/", jsonParser, async (req, res) => {
    if (req.query._id === null || req.query._id === undefined) res.status(200).send(await Post.find());
    else {
        const { _id } = req.body;
        Post.findById( {_id}, (err, post) => {
            console.log(post);
            if (err) res.status(500).send({"Message" : "Error"});
            else if (post === null) res.status(400).send({"Message" : "Post not found"});
            else {
                res.status(200).send(post);
            }
        })
    }
})

router.delete("/delete", jsonParser, async (req, res) => {
    const { _id, body } = req.body;
    Post.findByIdAndUpdate( {_id}, {"body" : body}, (err, comment) => {
        if (err) {
            res.status(500).send({"Message" : "Error"});
        }
        else {
            res.status(200).send({"Message": "Success"});
        }
    })
})

router.put("/update", jsonParser, async (req, res) => {
    let { _id, title, body, image, author } = req.body;

        // check for required params
    if (req.body._id === undefined || req.body._id === null) {
        res.status(400).send({"Message" : "Club name parameter missing"});
    }
    else if (req.body.author === undefined || req.body.author === null) {
        res.status(400).send({"Message" : "Author parameter is missing"});
    }

    else {

        let tempPost = new Post();
        Post.findById({ _id }, (err, post) => {
            if (!err) {
                tempPost = post;
            }
        })

        if (req.body.title === undefined || req.body.title === null) {
            title = tempPost.title;
        }
        if (req.body.body === undefined || req.body.body === null) {
            body = tempPost.body;
        }
        if (req.body.image === undefined || req.body.image === null) {
            image = tempPost.image;
        }

        Post.findByIdAndUpdate( {_id}, {"title" : title, "body" : body, "image" : image}, async (err, post) => {
            if (err) {
                res.status(500).send({"Message" : "Error"});
            }
            else if (post === null) {
                res.status(400).send({"Message" : "Post not found"});
            }
            else if (post.author != author) {
                res.status(400).send({"Message" : "You are not the author of this post"});
            }
            else {
                res.status(200).send({"Message" : "Success"});
            }
        })
    }
}) 

module.exports = router;