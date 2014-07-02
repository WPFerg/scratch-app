// Serve Player HTML
var fs = require('fs');

exports.serveScratchFolder = function(req, res)
{
	// Get the URL request
	var url = req.url.substring(1);
	// Response to the client. 200 is a success.
	var responseCode = 200;

	// If the url requests a folder, return that.
	if(url.indexOf(".") !== -1 || url.indexOf("/") !== -1)
	{
		// Convert % notation to the #.
		url = url.replace(/%23/g, '#');
		// Get the file info and return it to the client
		fs.readFile("scratch-player/" + url, function (err, data) {
			if(err)
			{
				responseCode = 500;
				data = "System Error -- Can't get file details";
				// Internal server error 500
				if (err.code === "ENOENT")
				{
					responseCode = 404;
					data = url + " not found.";
				}
				res.writeHead(responseCode);
			}
			res.end(data);
		});
	} else {

		// Otherwise return the index with the dynamic manifest generated.
		res.render("index.html", {"projectId": url});
	}
}