var connect = require('connect');
var http = require('http');

var url = require('url');
var proxy = require('proxy-middleware');

var manifest = require("./manifest");
var fs = require('fs');

var app = connect()
  .use(connect.logger('dev'));

app.use('/projects/', proxy(url.parse('http://projects.scratch.mit.edu/internalapi/project/')));
app.use('/projectdetails/', proxy(url.parse('http://scratch.mit.edu/api/v1/project/')));
app.use('/asset/', proxy(url.parse('http://cdn.scratch.mit.edu/internalapi/asset/')));
app.use('/scratch-player/', function(req, res) {
	// Get the URL request
	var url = req.url.substring(1);

	// If the url requests a folder, return that.
	if(url.indexOf(".") !== -1 || url.indexOf("/") !== -1)
	{
		// Get the file info and return it to the client
		fs.readFile("scratch-player/" + url, function (err, data) {
			if(err)
			{
				data = "System Error -- Can't get file details";
			}
			res.end(data);
		});
	} else {
		// Otherwise return the index with the dynamic manifest generated.

		fs.readFile("scratch-player/index.html", function (err, data) {
			var html;
			if(!err)
			{
				// And get the index file and concatenate that with the manifest <html>
				html = "<!DOCTYPE html><html manifest='/manifest/" + url + "'><head><script>var projectId = " + url + ";</script>" + data;
			} else {
				console.log(err);
				html = "System Error -- Can't get Player HTML";
			}
			res.end(html);
		})
	}
});
app.use(connect.static('.'));
app.use('/manifest', function(req, res) {


	// Remove the leading /
	var projectId = req.url.substring(1);
	

	// Ensure the project id is a number so it's the correct format.

	if(parseInt(projectId).toString().length == 8)
	{
		// Project ID is a number, create the manifest.
		manifest.createManifest(projectId, function(manifest) {
			// Return the response as plain text cache manifest
			res.setHeader("Content-Type", "text/cache-manifest");
			res.end(manifest);
		});
	} else {
		// Project ID isn't a number, show an error.
		res.writeHead(400);
		res.setHeader("Content-Type", "text/plain");
		res.end("FAILURE: Project ID is invalid.");
	}

});

// Set the port. process.env.PORT is so Heroku works. If it doesn't exist, set it to 3000.
var port = process.env.PORT || 3000;
http.createServer(app).listen(port);

console.log("Listening on port " + port + " for requests.");
console.log("Proxy active. Forwarding on /projects, /projectdetails and /asset");
console.log("App manifest generator active on /manifest.");