'use strict';

/* Directives */


angular.module('scratch.directives', ['ngResource']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  service('Projects', ['$resource', function($resource)
  {
  	// Get from the Scratch API
  	// Running a proxy server on NPM.
  	return $resource("/projects/:projectId/get/ ",
  		{projectId: "23600596"} // Defaults
  		);
  }]);