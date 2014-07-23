var express = require('express');
var ejs = require('ejs');
var http = require('http');

var url = require('url');
var morgan = require('morgan');


var scratch = require("./scratch-folder-middleware");
var manifest = require("./manifest");

var fs = require('fs');
var userDetails = require("./userdetails");

var app = express()
  //.use(express.logger('dev'));

// Set the dynamic HTML renderer as EJS.
// This is for the scratch-player folder to dynamically generate the HTML for the manifest.
app.engine('html', ejs.renderFile);
// Set the views for EJS to be in the HTML player folder, since that's the only place EJS needs to know about.
app.set('views', __dirname + "/scratch-player")

app.use(morgan('dev')); 					// log every request to the console

// app.use('/projects/', proxy(url.parse('http://projects.scratch.mit.edu/internalapi/project/')));
// app.use('/projectdetails/', proxy(url.parse('http://scratch.mit.edu/api/v1/project/')));
// app.use('/asset/', proxy(url.parse('http://cdn.scratch.mit.edu/internalapi/asset/')));
app.use('/scratch-player/', scratch.serveScratchFolder);
app.use('/user/projects/', userDetails.GetUserProjects);
app.use('/user/followers/', userDetails.GetUserFriends);
app.use(express.static('./app'));
app.use('/manifest', function(req, res) {

	// Remove the leading /, and anything after the second /, so /projectid/application.manifest results in projectid
	var projectId = req.url.substring(1).split("/")[0];

	// Ensure the project id is a number so it's the correct format.
	if(parseInt(projectId).toString().length == 8)
	{
		// Return the response as plain text cache manifest
		res.setHeader("Content-Type", "text/cache-manifest");
		// Project ID is a number, create the manifest.

		// If the user is on an iPad/iPhone, don't cache the soundbank
		if(req.headers['user-agent'].indexOf("iPad") !== -1 || req.headers['user-agent'].indexOf("iPhone") !== -1)
		{
			manifest.createManifest(projectId, "no-soundbank", function(manifest) {
				res.end(manifest);
			});
		} else { // Otherwise, do.
			manifest.createManifest(projectId, "", function(manifest) {
				res.end(manifest);
			});
		};
	} else {
		// Project ID isn't a number, show an error.
		res.writeHead(400, {"Content-Type": "text/plain"});
		res.end("FAILURE: Project ID is invalid.");
	}

});

// Set the port. process.env.PORT is so Heroku works. If it doesn't exist, set it to 3000.
var port = process.env.PORT || 3000;
http.createServer(app).listen(port);

console.log("Listening on port " + port + " for requests.");
console.log("App manifest generator active on /manifest.");
