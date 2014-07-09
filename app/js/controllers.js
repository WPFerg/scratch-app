'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource', 'ngCookies'])

ControllerModule.controller('DashboardCtrl', ['$scope', '$routeParams', function($scope, $routeParams)
{

  // Set default values
  $scope.featuredApps = [];
  $scope.userApps = [];
  $scope.friendsApps = [];

  // Get user ID
  $scope.userID = $routeParams.userId;

}]);

ControllerModule.controller('IndexCtrl', ['$scope', '$cookies', function($scope, $cookies) 
{

  // Get the list of installed apps, stored as a cookie CSV. Do type check to see if it exists first
  if(typeof($cookies.installedApps) !== "undefined")
  {
    $scope.installedProjects = $cookies.installedApps;
  }
}]);

ControllerModule.controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', function($scope, Projects, ProjectDetails, $routeParams)
{
	
	// Entering a project URL navigates the project back to Index. Therefore this is commented out.
	// Left here for future reference.

	
	//
	// var projectId = $routeParams.projectId; 
	// // If the Project link appears,
	// if(projectId.indexOf("http://scratch.mit.edu/projects/") !== -1)
	// {
	// 	// Remove it
	// 	projectId = projectId.substring(32);
	// 	console.log(projectId);
	// }

  $scope.projectId = $routeParams.projectId;

  // Project status -- defaults for loading.
  $scope.loading = true;
  $scope.projectExists = false;

	// Get the project
	$scope.project = ProjectDetails.get({"projectId": $scope.projectId},
        function() { $scope.loading = false; $scope.projectExists = true; },  // Called on success, meaning project is published
        function() { $scope.loading = false; }); // Called on fail, which means the project isn't published.

	// Get the detailed information about the project.

	$scope.projectInDepth = {};
	Projects.get({"projectId": $scope.projectId}, function(data) {
		// Callback function after getting the projects.
		// Assign all the information to the scope
    $scope.projectExists = true;  
    $scope.projectInDepth = data;
  });

	// Quick download stats variables
	$scope.assetsDownloaded = 0;

	$scope.isDownloading = false;

	// Test; ignore
	setInterval(function(){$scope.assetsDownloaded += 1; $scope.assetsDownloaded %= $scope.projectInDepth.assetLength}, 1000);

	// Function to return the percent downloaded
	$scope.percentDownloaded = function()
	{
		return {"width": ($scope.assetsDownloaded / $scope.projectInDepth.assetLength *100) + "%" };
	}
	// This will then just be displayed on the view.

	// Function that does the logic to begin downloading the app contents
	$scope.startDownloading = function()
	{
		$scope.isDownloading = true;
	}

}]);

ControllerModule.controller("UserCtrl", ['$scope', 'UserDetails', '$routeParams' ,'$window', function($scope, UserDetails, $routeParams, $window)
{

  // Get the list of installed apps, stored as a cookie CSV. Do type check to see if it exists first
  if(typeof($routeParams.userId) !== "undefined")
  {
    $scope.userId = $routeParams.userId;
    // And get the User's Projects from the API and add the project to the list.
    // This should be cached by the manifest.
    var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response) {
      // On success, add the projects associate with the user to the list
      $scope.projectList = response.projects;
    }, function (response) {
      // Callback function after projectDetails GET has failed
      //  Set the projectList to contain an error JSON object.
      $scope.error = response.data;
    });
  }


  // Function to move to the player's project.
  $scope.playProject = function(project)
  {
    $window.location = "/scratch-player/" + project.projectId;
  }

}]);
