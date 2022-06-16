const express = require('express');
const bodyParser = require('body-parser');
const Club = require("../models/club.model");
const hash = require('object-hash');
const { checkExist } = require('./exist');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/create", jsonParser, async (req, res) => {
    let { name, description, execs, teacher } = req.body;
    const text = req.body.description;
    // do not await when querying mongoose
    if (text.length > 100) {
        res.status(400).json({ "Message": "Word limit exceeded" });
    }
    else {
        teacher = hash(teacher, {algorithm: 'sha1'});
        Club.findOne({ name }, (err, taken) => {
            if (err) res.status(500).json({ "Message": "Error" });
            else if (taken) res.status(400).json({ "Message" : "Name has been taken"})
            else {
                const newClub = new Club({ name, description, execs, teacher });
                newClub.save()
                .then(() => {
                    res.status(201).json({ "Message": "Success" });
                })
                .catch(err => res.status(500).json({ "Message": "Server Error", "Error" : `${err}`}));
            }
        }
    )}
  });

  router.get("/", jsonParser, async (req, res) => {
      if (!checkExist(req.query._id)) {
        res.status(200).send(await Club.find());
      }
      else {
          const { _id } = req.body;
          Club.findById({ _id }, async (err, club) => {
              if (err) {
                  res.status(500).send({"Message" : "Error"});
              }
              else if (club === null) {
                  res.status(400).send({"Message" : "Club not found"});
              }
              else {
                  res.status(200).send(club);
              }
          })
      }
  })
  
  router.delete("/delete", jsonParser, async(req, res) => {
      const { name } = req.body;
      if (!checkExist(name)) {
        res.status(400).send({"Message" : "Missing params"});
      }
      else {
        Club.findOne( { name }, (err, club) => {
            if (err) {
                res.status(500).send({"Message" : "Error"});
            }
            else if (club === null) {
                res.status(400).send({"Message" : "Club not found"});
            }
            else {
                Club.findOneAndDelete( { name }, (err, club) => {
                    if (err) res.status(500).send({"Message": "Error"});
                    else res.status(200).send({"Message" : "Success"});
                })
            }
        })
      }
  })

  router.put("/update", jsonParser, async (req, res) => {
      let {_id, name, description, execs, teacher} = req.body;
      if (!checkExist(req.query._id)) {
          res.status(400).send({"Message" : "Club name parameter missing"});
      }
      else {
            Club.findById({ _id }, (err, club) => {
                if (err) {
                    res.status(500).send({"Message" : "Error"});
                }
                else if (club === null) {
                    res.status(400).send({"Message" : "Club not found"});
                }
                else {
                    if (name === undefined || name === null) {
                        name = club.name;
                        }
                        if (description === undefined || description === null) {
                            description = club.description;
                        }
                        if (execs === undefined || execs === null) {
                            execs = club.execs;
                        }
                        else {
                            execs = hash(execs, {algorithm: 'sha1'});
                        }
                        if (teacher === undefined || teacher === null) {
                            teacher = club.teacher;
                        }
                        else {
                            teacher = hash(teacher, {algorithm : 'sha1'});
                        }
                    Club.findByIdAndUpdate({ _id }, {"name" : name, "description" : description, "execs" : execs, "teacher" : teacher}, async (err, club) => {
                        if (err) {
                            res.status(500).send({"Message" : "Error"});
                        }
                        else {
                            res.status(200).send({"Message" : "Success"});
                        }
                    })
                }

            })
            
            
        }
  })
  
  module.exports = router;