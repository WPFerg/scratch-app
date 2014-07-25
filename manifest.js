var http = require('http');
var fs = require('fs');

exports.createManifest = function(projectId, opts, callbackFunction)
{
	var getSoundbank = true;

	// If no-soundbank is provided in the options, don't get the soundbank
	if(opts.indexOf("no-soundbank") !== -1)
	{
		getSoundbank = false;
	}
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
			exports.generateManifest(projectId, getSoundbank, str, callbackFunction);
		});

		// If there's an error, call the callback function with an error parameter
		response.on('error', callbackFunction);
	};

	// Create and send the request
	http.request(requestOpts, responseCallback).end();
};

exports.generateManifest = function(projectId, getSoundbank, manifestData, callbackFunction)
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
		callbackFunction("CACHE MANIFEST\nCACHE MANIFEST INVALID\n# That causes fetch to fail\nNETWORK:\n*");
		return;
	}

	var manifest;

	// Create a list for manifest files to see if they're already existing in the manifest
	// Therefore we don't include duplicate files in the manifest.
	var manifestFiles = [];

	// Create the manifest with an initial, constant, set of data
	manifest = "CACHE MANIFEST\n# Version 1\n\n# Automatically Generated From the Scratch API\nNETWORK:\n*";

	// Add a random number to make the manifest regenerate per refresh (for testing)
	//manifest += "4";

	manifest += "\nCACHE:";

	// Add the project details url (that has all the code/instructions)
	manifest += "\nhttp://projects.scratch.mit.edu/internalapi/project/" + projectId + "/get/";
	// manifest += "\nhttp://scratch.mit.edu/api/v1/project/" + projectId + "/?format=json";

	// Add jQuery
	manifest += "\nhttp://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";

	// The excluded files and folders designated by an array of regexes. The last element of the array checks for all uppercase characters
	// Stops extra development files being added.
	var excludedFilesAndFolders = [/.git/,/test/,/.gitignore/,/.jscsrc/,/^[A-Z/ .\_]*$/,/node\_modules/];

	// The excluded files in the project details (ie. wav/svg/png assets)
	var projectExcludes = [];

	// Don't add any sound files if not getting the sound bank.
	if(!getSoundbank)
	{
		excludedFilesAndFolders.push(/soundbank/);
		projectExcludes.push(/\.mp3/);
		projectExcludes.push(/\.wav/);
	}

	// Add the non-excluded files in the /scrach-player/ directory to the manifest so they can be cached.
	manifest += addFilesInFolder("scratch-player/", manifestFiles, excludedFilesAndFolders);

	// Add the project's root files to the manifest list
	manifest += getFileList(manifestData, manifestFiles, projectExcludes);

	// Now add the each project's child to the manifest list
	for(var childIndex in manifestData.children)
	{
		manifest += getFileList(manifestData.children[childIndex], manifestFiles, projectExcludes);
	}

	// Execute the callback function with the manifest data.
	callbackFunction(manifest);
};

// Gets and adds all files in a folder. Used recursively to add subfolders
addFilesInFolder = function(folderUrl, manifestFiles, excludes)
{

	// Initialise an empty string to store the paths to the scratch player files
	var scratchPlayerFiles = "";
	var files;

	// Read the directory. If there's an error instantly return
	try
	{
		files = fs.readdirSync(folderUrl);
	} catch (err) {
		return "";
	}

	// For every file in the folder, check to see if it's a folder. If so, add those files. Otherwise,
	// Just add it straight away.
	for(var fileIndex in files) {

		var file = files[fileIndex];

		// Check if folder, by using fs stats
		stats = fs.lstatSync(folderUrl + file);

		var isExcluded = regexCheck(folderUrl, excludes);

		// If it's a folder AND it's not on the exclude folders, add files
		if(stats.isDirectory() && !isExcluded)
		{
			// If a folder, add its contents to the manifest.
			scratchPlayerFiles += addFilesInFolder(folderUrl + file + "/", manifestFiles, excludes);
		} else if (!isExcluded) {
			// Add to the manifest, replace hashes with escape char so it's a file and not a page with a hash.
			file = file.replace(/#/g, "%23");
			file = file.replace(/\(/g, "%28");
			file = file.replace(/\)/g, "%29");
			// This breaks but I'm keeping it here fore future reference.
			//file = encodeURIComponent(file);
			scratchPlayerFiles += addToManifest("/" + folderUrl + file, manifestFiles, excludes);
		}
	}

	return scratchPlayerFiles;
};

// Creates a file list based off the manifestData supplied. Looks for costumes and sounds.
getFileList = function(manifestData, manifestFiles, excludedFiles)
{
	var manifest = "";

	for(var soundIndex in manifestData.sounds)
	{
		// Current sound being worked on
		var sound = "http://cdn.scratch.mit.edu/internalapi/asset/" + manifestData.sounds[soundIndex].md5 + "/get/";

		manifest += addToManifest(sound, manifestFiles, excludedFiles);
	}

	// And the costumes
	for(var costumeIndex in manifestData.costumes)
	{
		// Current costume being worked on
		var costume = "http://cdn.scratch.mit.edu/internalapi/asset/" + manifestData.costumes[costumeIndex].baseLayerMD5 + "/get/";

		manifest += addToManifest(costume, manifestFiles, excludedFiles);
	}

	return manifest;
};

// Adds an item to the manifest and manifest files if it isn't excluded. If it is excluded, it will return an empty string
// This provides a single chunk of code where everything's done so one change changes everything.
addToManifest = function(item, manifestFiles, excludes)
{
	var manifestAddition = "";
	// If the item isn't excluded and it doesn't already exist in the manifest and it's defined
	if(!regexCheck(item, excludes) && manifestFiles.indexOf(item) === -1 && !!item)
	{
		manifestAddition += "\n";
		manifestAddition += item;

		manifestFiles.push(item);
	}
	return manifestAddition;
};

// Checks a string against an array of regexes, returning true if at least one matches.
regexCheck = function(string, regexArray)
{
	for(var index in regexArray)
	{
		var regex = regexArray[index];

		// If the regex is a string, make it into a regex object
		if(typeof(regex) === "string")
		{
			regex = new RegExp(regex);
		}

		// If this regex matches return true
		if(regex.test(string) || string.match(regex))
		{
			return true;
		}
	}
	// If none match, return false
	return false;
};
