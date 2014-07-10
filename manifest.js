var http = require('http');
var fs = require('fs');

exports.createManifest = function(projectId, callbackFunction)
{
	// Create a HTTP GET request with the ProjectID as a parameter
	var requestOpts = {
		host: "projects.scratch.mit.edu",
		path: "/internalapi/project/" + projectId + "/get/"
	};

	// Create a function that parses the responses from the HTTP request
	var responseCallback = function (response) {
		var str = "";

		// If there's data, add that chunk to the current store
		response.on('data', function (chunk) {
			str += chunk;
		});

		// If there's no more data, we can generate the manifest.
		response.on('end', function() {
			// Use exports. to ensure generateManifest is actually called. Without exports. it isn't.
			exports.generateManifest(projectId, str, callbackFunction);
		});

		// If there's an error, call the callback function with an error parameter
		response.on('error', callbackFunction);
	}

	// Create and send the request
	http.request(requestOpts, responseCallback).end();
}

exports.generateManifest = function(projectId, manifestData, callbackFunction)
{
	// Parse manifestData into JSON
	try
	{
		// If the manifest's String, make it JSON
		if(typeof(manifestData) === "string")
		{
			manifestData = JSON.parse(manifestData);
		}
	} catch (err) {
		// If the JSON parse fails...
		callbackFunction("Not a valid scratch file.");
		return;
	}

	var manifest;

	// Create a list for manifest files to see if they're already existing in the manifest
	// Therefore we don't include duplicate files in the manifest.
	var manifestFiles = [];

	// Create the manifest with an initial, constant, set of data
	manifest = "CACHE MANIFEST\n# Version 1\n\n# Automatically Generated From the Scratch API\n\nNETWORK:\n*\n\nFALLBACK:\n/ /offline.html"

	// Add a random number to make the manifest regenerate per refresh (for testing)
	//manifest += "4";

	manifest += "\nNETWORK:\n*\nCACHE:";

	// Add the project details url (that has all the code/instructions)
	manifest += "\n/projects/" + projectId + "/get/";

	// Add the files in the /scrach-player/ directory to the manifest so they can be cached.
	manifest += addFilesInFolder("scratch-player/");

	// Add the soundbank to the manifest -- it's always requested.
	//manifest += addFilesInFolder("soundbank/");

	// Add the project's root files to the manifest list
	manifest += getFileList(manifestData, manifestFiles);

	// Now add the each project's child to the manifest list
	for(var childIndex in manifestData.children)
	{
		manifest += getFileList(manifestData.children[childIndex], manifestFiles);
	}

	// Execute the callback function with the manifest data.
	callbackFunction(manifest);
}

// Gets and adds all files in a folder. Used recursively to add subfolders
addFilesInFolder = function(folderUrl)
{
	// Initialise an empty string to store the paths to the scratch player files
	var scratchPlayerFiles = "";

	// Read the directory. If there's an error instantly return
	try
	{
		var files = fs.readdirSync(folderUrl);
	} catch (err) {
		return "";
	}

	// For every file in the folder, check to see if it's a folder. If so, add those files. Otherwise,
	// Just add it straight away.
	for(var fileIndex in files) {

		var file = files[fileIndex];

		// Check if folder, by using fs stats
		stats = fs.lstatSync(folderUrl + file);

		if(stats.isDirectory())
		{
			// If a folder, add its contents to the manifest.
			scratchPlayerFiles += addFilesInFolder(folderUrl + file + "/");
		} else {
			// Add to the manifest, replace hashes with escape char so it's a file and not a page with a hash.
			file = file.replace(/#/g, "%23");
			file = file.replace(/\(/g, "%28");
			file = file.replace(/\)/g, "%29");
			// This breaks but I'm keeping it here fore future reference.
			//file = encodeURIComponent(file);
			scratchPlayerFiles += ("\n/" + folderUrl + file);
		}
	}

	return scratchPlayerFiles;
}

// Creates a file list based off the manifestData supplied. Looks for costumes and sounds.
getFileList = function(manifestData, manifestFiles)
{
	var manifest = "";

	// If the pen layer exists, and the file isn't in the manifest add that.
	if(manifestData.penLayerMD5 && manifestFiles.indexOf(manifestData.penLayerMD5) === -1)
	{
		manifest += "\n/asset/" + manifestData.penLayerMD5 + "/get/";

		manifestFiles.push(manifestData.penLayerMD5);
	}

	for(var soundIndex in manifestData.sounds)
	{
		// Current sound being worked on
		var sound = manifestData.sounds[soundIndex];

		// Check to see if file exists. If it doesn't, add it. Otherwise, continue.
		if(manifestFiles.indexOf(sound.md5) === -1)
		{
			manifest += "\n/asset/" + sound.md5 + "/get/";

			manifestFiles.push(sound.md5);
		}
	}

	// And the costumes
	for(var costumeIndex in manifestData.costumes)
	{
		// Current costume being worked on
		var costume = manifestData.costumes[costumeIndex];

		// Check to see if file exists. If it doesn't, add it. Otherwise, continue.
		if(manifestFiles.indexOf(costume.baseLayerMD5) === -1)
		{
			manifest += "\n/asset/" + costume.baseLayerMD5 + "/get/";

			manifestFiles.push(costume.baseLayerMD5);
		}
	}

	return manifest;
}