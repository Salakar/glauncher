console.log(process.env.PROJECT_NAME + ': My app has been launched, much wow doge.');
console.dir(process.env.FOO);
console.dir(process.env.GLAUNCHER_NAME);
console.dir(process.env.GLAUNCHER);

var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send(JSON.stringify(process.env));
});
