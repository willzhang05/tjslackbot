var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var request = require("request");
var bot = require("./bot");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    res.status(200).send("Test");
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
});

app.listen(port, function() {
    console.log("tjslackbot listening on port " + port);
});

app.post("/hello", bot);
