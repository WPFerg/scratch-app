'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('scratch.services', []).
  value('version', '0.1').
  value('platform', 'Android').
  service('Projects', ['$resource', function($resource)			// Gets the project *functionality*, ie. the code, assets, etc.
  {
  	// Get from the Scratch API
  	// Running a proxy server on NPM.
  	return $resource("/projects/:projectId/get/ ",
  		{projectId: "23600596"}// Defaults -- just a random, generic project
  		);
  }]).
  service('ProjectDetails', ['$resource', function($resource)	// Gets the project details of a project
  {
  	// Get from the Scratch API
  	// Running a proxy server on NPM.
  	return $resource("/projectdetails/:projectId/?format=json ",
  		{projectId: "23600596"}, {isArray: false} // Defaults -- just a random, generic project
  		);
  }]);
