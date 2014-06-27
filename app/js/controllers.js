'use strict';

/* Controllers */

angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])
  .controller('IndexCtrl', ['$scope', function($scope) {

  }])
  .controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', function($scope, Projects, ProjectDetails, $routeParams) {
  	
  	// Entering a project URL navigates the project back to Index. Therefore this is commented out.

  	// Check to see if the user's entered the Scratch website instead of a plain Project ID. If they have, parse it to get the project ID.
  	// Example link http://scratch.mit.edu/projects/22564095/
  	//
  	// var projectId = $routeParams.projectId; 
  	// // If the Project link appears,
  	// if(projectId.indexOf("http://scratch.mit.edu/projects/") !== -1)
  	// {
  	// 	// Remove it
  	// 	projectId = projectId.substring(32);
  	// 	console.log(projectId);
  	// }

  	// Get the project
  	$scope.project = ProjectDetails.get({"projectId": $routeParams.projectId});
  	// This will then just be displayed on the view.

  }]);
