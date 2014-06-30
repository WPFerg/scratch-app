var connect = require('connect');
var http = require('http');

var url = require('url');
var proxy = require('proxy-middleware');

var manifest = require("./manifest");

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('.'))

app.use('/projects/', proxy(url.parse('http://projects.scratch.mit.edu/internalapi/project/')));
app.use('/projectdetails/', proxy(url.parse('http://scratch.mit.edu/api/v1/project/')));

http.createServer(app).listen(process.env.PORT || 5000);

console.log("Listening on localhost:3000 for requests.");
console.log("Proxy active. Forwarding on /projects");
console.log("Block validator active.");
