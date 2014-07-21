// NODE SERVER TESTS

// TO RUN IN GIT BASH: 
// Ensure Jasmine v2's installed by
// $ npm install jasmine-node@2.0
// then ensure the node server's up with
// $ npm start
// in another terminal, cd into test, and run
// $ jasmine-node --verbose node-server-test.js  --matchAll

var scratch = require('../scratch-folder-middleware');
var manifest = require('../manifest');
var userDetails = require('../userdetails');
var http = require('http');

 describe("Scratch-Player Middleware", function() {

 	var done;
 	// Do HTTP requests to the Scratch Node Server -- this is to ensure that not only the middleware works, but a correct page
 	// with the correct manifest is generated.

 	// Check to see if a project's page is loaded.
 	it("should get a project's corresponding page if the request URL is a number.", function(done)
 	{
		// Create a HTTP GET request with the ProjectID as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/scratch-player/1234"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				expect(str.indexOf("/manifest/1234")).not.toBe(-1);
				expect(str.indexOf("var projectId = \"1234\";")).not.toBe(-1);
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();
 	});

	// Check to see if a file is provided.
	it("should get a text file if a text file is provided in the request", function(done)
	{
		// Create a HTTP GET request with the text file as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/scratch-player/js/IO.js"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				expect(str.indexOf("// Copyright (C) 2013 Massachusetts Institute of Technology")).not.toBe(-1);
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();
	});

	it("should get a non-text file (img) if one is provided in the request", function(done) {
		// Create a HTTP GET request with the text file as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/scratch-player/img/stopOn.png"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			// Create a buffer to store the image data
			var buffer = new Buffer(10000);
			var bufferReturned = true;

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				// Check to see if the chunk is a buffer
				expect(chunk instanceof Buffer).toBe(true);
				// Add the current chunk to the stored data
				buffer = Buffer.concat([buffer, chunk]);
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				// Check to see if the image is in PNG format
				expect(buffer.toString().indexOf("PNG")).not.toBe(-1);
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();
	});

 });

describe("Manifest", function() {
	var manifestData, done;

	it("should refer to the Scratch API that has sounds, costumes, children as part of its JSON object", function(done) {
		manifest.createManifest(23600596, "", function (data) {
			// Check to see if a manifest's created.
			expect(data.indexOf("CACHE MANIFEST")).toBe(0);
			done();
		});
	});

	it("should generate an empty manifest from an invalid id", function(done) {
		manifest.createManifest("", "", function (data) {
			// Check to see if a manifest's created.
			expect(data.indexOf("CACHE MANIFEST\nCACHE MANIFEST INVALID")).toBe(0);
			done();
		});
	});

	it("should generate a manifest based on an input", function(done)
	{

		var input = { "sounds": [{"md5":"ImASound.mp3"}], "costumes": [{"baseLayerMD5":"ImACostume.jpg"}], "children":
							 [{"sounds": [{"md5":"ImASound.mp3"}], "costumes": [{"baseLayerMD5":"ImACostume.jpg"}]},
							  {"sounds": [{"md5":"ImASound2.mp3"}], "costumes": [{"baseLayerMD5":"ImACostume3.jpg"}]} ] }

			manifest.generateManifest("TestManifest", true, input, function(data)
			{
				// Store the manifest data, run a quick check to see if it exists.
				manifestData = data;
				expect(manifestData).not.toBeUndefined();
				expect(manifestData.indexOf("soundbank")).not.toBe(-1);
				expect(manifestData.indexOf("CACHE MANIFEST")).not.toBe(-1);
				done();
			});
	});

	it("should generate the correct manifest based on that input", function() {
		// Check to see if the files are in the manifest
		expect(manifestData.indexOf("http://projects.scratch.mit.edu/internalapi/project/TestManifest/get/")).not.toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImASound.mp3/get/")).not.toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume.jpg/get/")).not.toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImASound2.mp3/get/")).not.toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume3.jpg/get/")).not.toBe(-1);
	})

	it("should not have duplicate entries in the manifest", function() {
		// Check to see if these aren't duplicated. Remove the first (hopefully only) instance these occur and then check to see if another exists.
		manifestData = manifestData.replace("http://projects.scratch.mit.edu/internalapi/project/TestManifest/get/","");
		manifestData = manifestData.replace("http://cdn.scratch.mit.edu/internalapi/asset/ImASound.mp3/get/","");
		manifestData = manifestData.replace("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume.jpg/get/","");
		manifestData = manifestData.replace("http://cdn.scratch.mit.edu/internalapi/asset/ImASound2.mp3/get/","");
		manifestData = manifestData.replace("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume3.jpg/get/","");


		expect(manifestData.indexOf("http://projects.scratch.mit.edu/internalapi/project/TestManifest/get/")).toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImASound.mp3/get/")).toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume.jpg/get/")).toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImASound2.mp3/get/")).toBe(-1);
		expect(manifestData.indexOf("http://cdn.scratch.mit.edu/internalapi/asset/ImACostume3.jpg/get/")).toBe(-1);

	});

	it("should generate without a sound bank on an iPad", function(done)
	{
	// Create a HTTP GET request with the text file as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/manifest/23600596",
			headers: {"User-Agent": "iPad"}
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				expect(str.indexOf("soundbank")).toBe(-1);
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();
		
	});

});

describe("User Details", function() {

	it("should get a user's projects", function(done) {
			// Create a HTTP GET request with the Username as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/user/projects/WillJimbo"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				str = JSON.parse(str);
				expect(str.success).toBe(200);
				expect(str.projects).not.toBeUndefined();
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();

	});

	it("should not get an invalid user's projects", function(done) {
			// Create a HTTP GET request with the Username as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/user/projects/WillJambo"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				str = JSON.parse(str);
				expect(str.error).toBe(404);
				expect(str.projects).toBeUndefined();
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();

	});


	it("should get a user's followers", function(done) {
			// Create a HTTP GET request with the Username as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/user/followers/WillJimbo"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				str = JSON.parse(str);
				expect(str.success).toBe(200);
				expect(str.followers).not.toBeUndefined();
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();

	});

	it("should not get an invalid user's followers", function(done) {
			// Create a HTTP GET request with the Username as a parameter
		var requestOpts = {
			host: "localhost",
			port: 3000,
			path: "/user/followers/WillJambo"
		};

		// Create a function that parses the responses from the HTTP request
		var responseCallback = function (response) {
			var str = "";

			// If there's data, add that chunk to the current store
			response.on('data', function (chunk) {
				str += chunk;
			});

			// If there's no more data, check to see if the response is correct, and signify the test's done.
			response.on('end', function() {
				str = JSON.parse(str);
				expect(str.error).toBe(404);
				expect(str.followers).toBeUndefined();
				done();
			});

			// If there's an error, fail the test.
			response.on('error', function() {
				expect().toFail();
				done();
			});
		}

		// Create and send the request
		http.request(requestOpts, responseCallback).end();

	});

});