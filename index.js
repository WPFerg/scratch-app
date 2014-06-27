var connect = require('connect');
var http = require('http');

var url = require('url');
var proxy = require('proxy-middleware');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('.'))

app.use('/projects/', proxy(url.parse('http://projects.scratch.mit.edu/internalapi/project/')));

http.createServer(app).listen(3000);

console.log("Listening on localhost:3000 for requests.");
console.log("Proxy active. Forwarding on /projects");
console.log("Block validator active.");