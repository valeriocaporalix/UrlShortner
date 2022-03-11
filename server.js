require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Database Settings
let mongoose = require("mongoose");
let mongo = require("mongodb");
let uri = "mongodb+srv://user1:" + process.env.PASSWORD + "@freecodecamp.y0bby.mongodb.net/db2?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema URL Shortner Setting
let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short : Number
});

// API Settings
let Url = mongoose.model("Url", urlSchema);
let bodyParser = require("body-parser");
let resObj = {};
app.post("/api/shorturl", bodyParser.urlencoded({extended: false}), (req, res) => {
  let inputUrl = req.body["url"];
  
// Invalid Url Setting
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  if(!inputUrl.match(urlRegex)) {
    res.json({error: "invalid url"})
    return
  }

// Main URL Shortner Settings
  resObj["original_url"] = inputUrl;
  let inputShort = 1;
  
  Url.findOne({}).sort({short: "desc"}).exec((err, result) => {
      if(!err && result != undefined) {
        inputShort = result.short + 1;
      }
      if(!err) {
        Url.findOneAndUpdate(
          {original: inputUrl},
          {original: inputUrl, short: inputShort}, 
          {new: true, upsert: true},
          (err, savedUrl) => {
            if(!err) {
              resObj["short_url"] = savedUrl.short;
              res.json(resObj);
            }
          }
        )
      }
    })

})

// URL Shortner Validation Setting
app.get("/api/shorturl/:input", (req, res) => {
  let input = req.params.input;
  Url.findOne({short: input}, (err, result) => {
    if(!err && result != undefined) {
      res.redirect(result.original)
    } else {
      res.json("URL not Found")
    }
  })
})

// Listen Port
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
