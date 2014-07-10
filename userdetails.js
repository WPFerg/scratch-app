 var http = require("http");
 var cheerio = require("cheerio");

 // Get the user details
 module.exports.GetUserProjects = function(req, res) {

	// Gets a user's projects
	// TODO: Pagination.

	// Get the username from the GET request
	var userId = req.url.substring(1);
	// Response to the client. 200 is a success.
	var responseCode = 200;

	// Send off a request to the scratch website
	// Create a HTTP GET request with the userId as a parameter
	var requestOpts = {
		host: "scratch.mit.edu",
		path: "/users/" + userId + "/projects/"
	};

	// Create a function that parses the responses from the HTTP request
	var responseCallback = function (response) {
		var str = "";

		// If there's data, add that chunk to the current store
		response.on('data', function (chunk) {
			str += chunk;
		});

		// If there's no more data, we can scrape the HTML.
		response.on('end', function()
		{

			// Check to see if the response is a 404, indicating the user doesn't exist.
			var responseJson = [];

			// If so, set responseJson to be an error message.
			var statusCode = response.statusCode;

			if(statusCode == 404)
			{
				responseJson = {"error": response.statusCode};
			} else {
				responseJson = {"success": response.statusCode, "projects": []}
			}

			// Load the HTML into a scraper
			var $ = cheerio.load(str);

			// Parse each project that exists
			$("li.project").each(function()
			{

				// Find the title of the project according to:
				// li.project having a child span.title having a child a.
				// Add the project to the array of projects
				// Get the <a> tag that references the project details
				var aTag = $(this).find("span.title").find("a");
				// The project ID is in the <a href="/projects/id"> so parse.
				var projectLink = aTag.attr("href").split("/");
				var projectId = projectLink[2];
				// And add the project into the list of projects
				responseJson.projects.push({"title": aTag.text(), "projectId": projectId});

			});

			// Send the response (200, in JSON format)
			res.writeHead(response.statusCode, {"Content-Type": "application/json"})
			res.end(JSON.stringify(responseJson));

		});

		// If there's an error, return the error code and end.
		response.on('error', function(err) { console.log(err); res.writeHead(err.code); res.end(); });
	}

	// Create and send the request
	http.request(requestOpts, responseCallback).end();
}

 // Get the user details
 module.exports.GetUserFriends = function(req, res) {

	// Gets a user's projects
	// TODO: Pagination.

	// Get the username from the GET request
	var userId = req.url.substring(1);
	// Response to the client. 200 is a success.
	var responseCode = 200;

	// Send off a request to the scratch website
	// Create a HTTP GET request with the userId as a parameter
	var requestOpts = {
		host: "scratch.mit.edu",
		path: "/users/" + userId + "/following/"
	};

	// Create a function that parses the responses from the HTTP request
	var responseCallback = function (response) {
		var str = "";

		// If there's data, add that chunk to the current store
		response.on('data', function (chunk) {
			str += chunk;
		});

		// If there's no more data, we can scrape the HTML.
		response.on('end', function()
		{

			// Check to see if the response is a 404, indicating the user doesn't exist.
			var responseJson = [];

			// If so, set responseJson to be an error message.
			var statusCode = response.statusCode;

			if(statusCode == 404)
			{
				responseJson = {"error": response.statusCode};
			} else {
				responseJson = {"success": response.statusCode, "followers": []}
			}

			// Load the HTML into a scraper
			var $ = cheerio.load(str);

			// Parse each project that exists
			$("li.user").each(function()
			{

				// Find the username according to:
				// li.user having a child span.title
				// Add the username to the array of usernames
				// Get the <a> tag that references the project details
				var aTag = $(this).find("span.title").find("a");

				// The username is in the <a href="/users/username"> so parse.
				var usernameLink = aTag.attr("href").split("/");
				var username = usernameLink[2];

				// And add the username into the list of usernames
				responseJson.followers.push({"username": username, "projects": null});

			});

			// Send the response (200, in JSON format)
			res.writeHead(response.statusCode, {"Content-Type": "application/json"})
			res.end(JSON.stringify(responseJson));

		});

		// If there's an error, return the error code and end.
		response.on('error', function(err) { console.log(err); res.writeHead(err.code); res.end(); });
	}

	// Create and send the request
	http.request(requestOpts, responseCallback).end();
}