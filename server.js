const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongo = require("mongodb");
const mongoose = require("mongoose");
let bodyParser = require("body-parser");
let ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let uri = process.env.DB_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Drew inspiration for exercise
// and user schema from Ganesh H:

let exerciseSchema = mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
});
let Exercise = mongoose.model("Exercise", exerciseSchema);

let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  _id: String,
  log: [exerciseSchema]
});
let User = mongoose.model("User", userSchema);


app.post("/api/users", bodyParser.urlencoded({extended: false}), (req, res) => {
  let username = req.body.username;
  let _id;
  let resObj = {};

  User.findOne({username: username})
      .exec((error, result) => {
        if(!error) {
          if(!result) {
            let objId = ObjectId();
            let newUser = new User({username: username, _id: objId});
            resObj["username"] = newUser.username;
            resObj["_id"] = newUser._id;
            newUser.save();
            res.json(resObj);
          } else if(result) {
            resObj["username"] = result.username;
            resObj["_id"] = result._id;
            res.json(resObj);
          }
          
        }

      });
  
  
});

// app.post("/api/users", bodyParser.urlencoded({extended: false}), (req, res) => {
//   let username = req.body.username;
//   let _id;
//   let resObj = {};
//   User.findOne({})
//       .sort({_id: "descending"})
//       .exec((error, result) => {
//         if(!error && result == undefined) {
//             _id = 1;
//           }
//         if(!error && result) {
//           let idString = result._id;
//           _id = parseInt(idString) + 1;
//         }
        
//       });

//   User.findOne({username: username})
//       .exec((error, result) => {
//         if(!error) {
//           _idString = _id.toString();
//           if(!result) {
//             let newUser = new User({username: username, _id: _idString});
//             resObj["username"] = username;
//             resObj["_id"] = _idString;
//             newUser.save();
//             res.json(resObj);
//           } else if(result) {
//             console.log("result: " + result);
//             resObj["username"] = result.username;
//             resObj["_id"] = result._id;
//             res.json(resObj);
//           }
          
//         }

//       });
  
  

// });

app.get("/api/users", (req, res) => {
  User.find({})
      .exec((error, result) => {
    if(!error) {
          res.json(result);
        }
  });
});

app.post("/api/users/:_id/exercises", bodyParser.urlencoded({extended: false}), (req, res) => {
  let _id = req.params._id;
  // let _id = ObjectId(req.params._id);
  let date;
  if(!req.body.date || req.body.date == undefined) {
    date = new Date(Date.now()).toISOString().substring(0, 10);
  } else {
    date = req.body.date;
  }
  let exercise = new Exercise({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    // date: date
    date: date
  });
  let resObj = {};
  User.findOne({_id: _id})
      .exec((error, user) => {
        // if(error) {
        //   console.log(error);
        //   res.send(error);
        // }

        if(error) {
          return console.log(error);
        }
          // user["log"] = [];
          user["log"].push(exercise);
          // resObj = {
          //   _id: user._id,
          //   username: user.username,
          //   date: user.date,
          //   duration: user.duration,
          //   exercise: exercise
          // };
          
          // resObj = user;
          // let userId = ObjectId(user._id);
          // resObj = {
          //   "_id:": ObjectId(user._id),
          //   // "_id:": user._id,
          //   "username": user.username,
          //   "date": exercise.date,
          //   // "date": exercise.date.slice(0, 15);
          //   // "date": new Date(exercise.date).toDateString(),
          //   "duration": Number(exercise.duration),
          //   // "duration": exercise.duration,
          //   "description": exercise.description
          // };
          // user.save();
          // res.send(resObj);

          user.save((err, data) => {
            if(err) {
              return console.log(err);
            }
            resObj = {
              // "_id:": data._id,
              "_id:": ObjectId(data._id),
              "username": data.username,
              "date": new Date(exercise.date).toDateString(),
              "duration": Number(exercise.duration),
              "description": exercise.description
            };
            res.json(resObj);
          });
          // Expected output
          // {"_id":"60b3c9ed43119c05767fe411","username":"Me101010","date":"Sun May 30 2021","duration":40,"description":"Running"}
        
      });
});

// app.get("/api/users/:_id/logs", (req, res) => {
//   let _id = req.params._id;
//   User.findOne({_id: _id})
//       .exec((error, user) => {
//         if(!error) {
//           let log = user.log;
//           countObj = {count: log.length};
//           log.push(countObj);
//           res.send(log);
//         }
//       });
// });


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
