// Serve Player HTML
var fs = require('fs');

exports.serveScratchFolder = function(req, res)
{
	// Get the URL request - remove leading and trailing /
	var url = req.url.substring(1);
	// Match / if it's followed by the end of the string
	url = url.replace(/\/+$/, "");

	// Response to the client. 200 is a success.
	var responseCode = 200;

	// Ensure the URL has a value, and it isn't getting /
	if(url === "")
	{
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.end("Not found");
		return;
	}

	// If the url requests a folder/file, return that.
	if(url.indexOf(".") !== -1 || url.indexOf("/") !== -1)
	{
		var urlParams = url.split("/");
		if(parseInt(urlParams[0]))
		{
			// If the first segment of the URL request is a project ID, remove it and treat the rest as usual
			// (Stops relative path errors ie. /12345678/index.html)

			url = urlParams.slice(1).join("/");
		}

		// Convert % notation to the #.
		url = url.replace(/%23/g, '#');
		url = decodeURI(url);
		// Get the file info and return it to the client
		// fs.readFile("scratch-player/" + url, function (err, data) {
		// 	if(err)
		// 	{
		// 		responseCode = 500;
		// 		data = "System Error -- Can't get file details";
		// 		// Internal server error 500
		// 		if (err.code === "ENOENT")
		// 		{
		// 			responseCode = 404;
		// 			data = url + " not found.";
		// 		}

		// 		var fileExtension = url.split('.').pop();
		// 		var contentType = "text/plain"
		// 		switch(fileExtension.toLowerCase())
		// 		{
		// 			case "js":
		// 				contentType = "text/javascript";
		// 				break;
		// 			case "css":
		// 				contentType = "text/css"
		// 				break;
		// 			case "jpg" || "jpeg":
		// 				contentType = "image/jpeg"
		// 				break;
		// 			case "png":
		// 				contentType = "image/png"
		// 				break;
		// 		}

		// 		res.writeHead(responseCode, {"Content-Type": contentType});
		// 	}
		// 	res.end(data);
		// ALTERNATIVE: send the file straight off, but browsers complain
		res.sendfile("scratch-player/" + url);
		// });
	} else {

		// Otherwise return the index with the dynamic manifest generated.
		res.render("index.html", {"projectId": url});
	}
}