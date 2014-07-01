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
app.use('/asset/', proxy(url.parse('http://cdn.scratch.mit.edu/internalapi/asset/')));
app.use('/manifest', function(req, res) {

	// Remove the leading /
	var projectId = req.url.substring(1);
	
	// Return the response as plain text
	res.setHeader("Content-Type", "text/plain");

	// Ensure the project id is a number so it's the correct format.

	if(parseInt(projectId))
	{
		// Project ID is a number, create the manifest.
		manifest.createManifest(projectId, function(manifest) {
			res.end(manifest);
		});
	} else {
		// Project ID isn't a number, show an error.
		res.end("FAILURE: Project ID is not a number");
	}

});

// Set the port. process.env.PORT is so Heroku works. If it doesn't exist, set it to 3000.
var port = process.env.PORT || 3000;
http.createServer(app).listen(port);

console.log("Listening on port " + port + " for requests.");
console.log("Proxy active. Forwarding on /projects, /projectdetails and /asset");
console.log("App manifest generator active on /manifest.");