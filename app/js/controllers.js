'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource', 'ngCookies'])

  ControllerModule.controller('UserAppsCtrl', ['$scope', function($scope)
  {

    // Set default values
    $scope.userProjectList = [];

    // Get user projects
    $scope.getUserProjects = function($scope)
    {

      // Create test case 1
      var Object1 = {};
      Object1.id = '24467118';
      Object1.name = 'Test_04';
      Object1.date = '08/07/2014';
      
      // Create test case 2
      var Object2 = {};
      Object2.id = '24361624';
      Object2.name = 'Test_03';
      Object2.date = '07/07/2014';

      // Append constructed objects
      $scope.userProjectList.push(Object1);
      $scope.userProjectList.push(Object2);

    };

    // Method to get project number
    $scope.userProjectCount = function()
    {  
      return $scope.userProjectList.length;
    };

    // Method to determine if projects exist
    $scope.userProjectsExist = function()
    {
      return ($scope.userProjectCount() > 0);
    };

    // Call project retrieval method
    $scope.getUserProjects($scope);

  }]);

  ControllerModule.controller('IndexCtrl', ['$scope', '$cookies', function($scope, $cookies) {
  	$scope.checkForScratchLink = function()
  	{
		// Check to see if the user's entered the Scratch website instead of a plain Project ID. If they have, parse it to get the project ID.
  		// Example link http://scratch.mit.edu/projects/22564095/
  		// If the project link appears
  		if($scope.projectId.indexOf("http://scratch.mit.edu/projects/") !== -1)
		  {
			// Remove it
  			$scope.projectId = $scope.projectId.replace(/http:\/\/scratch.mit.edu\/projects\//g, "");
  			// And also remove any trailing /s
  			$scope.projectId = $scope.projectId.replace(/\//g, "");
  			// Check to see if the length's 8 characters. If it isn't, then set it to be the last 8 characters
        // This prevents multiple pastes of Scratch URLS showing repeated numbers

        if($scope.projectId.length > 8)
        {
          $scope.projectId = $scope.projectId.substring($scope.projectId.length - 8);
        }
		  }
  	}

    // Get the list of installed apps, stored as a cookie CSV. Do type check to see if it exists first
    if(typeof($cookies.installedApps) !== "undefined")
    {
      $scope.installedProjects = $cookies.installedApps;
    }
  }]);

  ControllerModule.controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', function($scope, Projects, ProjectDetails, $routeParams) {
  	
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
