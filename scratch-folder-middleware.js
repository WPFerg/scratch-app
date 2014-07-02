// Serve Player HTML
var fs = require('fs');

// exports.serveScratchFolder = function(req, res)
// {
// 	// Get the URL request
// 	var url = req.url.substring(1);
// 	// Response to the client. 200 is a success.
// 	var responseCode = 200;

// 	// If the url requests a folder, return that.
// 	if(url.indexOf(".") !== -1 || url.indexOf("/") !== -1)
// 	{
// 		// Get the file info and return it to the client
// 		fs.readFile("scratch-player/" + url, function (err, data) {
// 			if(err)
// 			{
// 				// Internal server error 500
// 				responseCode = 500;
// 				data = "System Error -- Can't get file details";
// 			}
// 			res.end(responseCode, data);
// 		});
// 	} else {
// 		// Otherwise return the index with the dynamic manifest generated.

// 		fs.readFile("scratch-player/index.html", function (err, data) {
// 			var html;
// 			if(!err)
// 			{
// 				// And get the index file and concatenate that with the manifest <html>
// 				// VERY inelegant
// 				html = "<!DOCTYPE html><html manifest='/manifest/" + url + "'><head><script>var projectId = " + url + ";</script>" + data;
// 			} else {
// 				// Internal server error 500
// 				responseCode = 500;
// 				html = "System Error -- Can't get Player HTML";
// 			}
// 			res.end(responseCode, html);
// 		})
// 	}
// }

exports.serveScratchFolder = function(req, res)
{
	// Get the URL request
	var url = req.url.substring(1);
	// Response to the client. 200 is a success.
	var responseCode = 200;

	// If the url requests a folder, return that.
	if(url.indexOf(".") !== -1 || url.indexOf("/") !== -1)
	{
		// Get the file info and return it to the client
		fs.readFile("scratch-player/" + url, function (err, data) {
			if(err)
			{
				// Internal server error 500
				responseCode = 500;
				data = "System Error -- Can't get file details";
				res.setHeader(500);
			}
			res.end(data);
		});
	} else {

		// Otherwise return the index with the dynamic manifest generated.
		res.render("index.html", {"projectId": url});
	}
}