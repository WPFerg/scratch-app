'use strict';
/* Controllers */

angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource', 'ngCookies'])

  .controller('IndexCtrl', ['$scope', '$cookies', function($scope, $cookies) {
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
  }])

  .controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', function($scope, Projects, ProjectDetails, $routeParams) {
  	
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

  }])
  .controller("InstalledProjectsCtrl", ['$scope', 'ProjectDetails', '$cookies', '$window', function($scope, ProjectDetails, $cookies, $window)
  {

    // Get the list of installed apps, stored as a cookie CSV. Do type check to see if it exists first
    if(typeof($cookies.installedApps) !== "undefined")
    {
      $scope.installedProjects = $cookies.installedApps.split(",");
      $scope.projectList = [];

      // If there's projects downloaded, get all project info from the id
      for(var projectId in $scope.installedProjects)
      {
        // get the project id
        var project = $scope.installedProjects[projectId];

        // And get the project details from the API and add the project details to the list.
        var projectDetails = ProjectDetails.get({"projectId": project}, function() {}, function (response) {
          // Callback function after projectDetails GET has failed
          //  populate the projectDetails var with generic data and its project id
          console.log(response);
          projectDetails = {"title" : "Unpublished Scratch Project", "id": project};
        });

        // Give the projects a generic title so that unshared ones don't show up with nothing
        projectDetails.title = "Unknown Scratch Project";
        
        // Add the id to project details so the page can navigate to the player
        projectDetails.id = project;

        $scope.projectList.push(projectDetails);
      }
    }


    // Function to move to the player's project.
    $scope.playProject = function(project)
    {
      $window.location = "/scratch-player/" + project.id;
    }

  }]);
