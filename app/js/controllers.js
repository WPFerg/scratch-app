'use strict';
/* Controllers */

angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])
  .controller('IndexCtrl', ['$scope', function($scope) {
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

  	// Get the project
  	$scope.project = ProjectDetails.get({"projectId": $routeParams.projectId});

  	// Get the detailed information about the project.

  	$scope.projectInDepth = {};
  	Projects.get({"projectId": $routeParams.projectId}, function(data) {
  		// Callback function after getting the projects.
  		// Assign all the information to the scope

  		// May seem weird but that's how I got it to work
  		$scope.projectInDepth.children = data.children;
  		$scope.projectInDepth.sounds = data.sounds;
  		$scope.projectInDepth.costumes = data.costumes;
  		$scope.projectInDepth.assetLength = data.children.length + data.sounds.length + data.costumes.length;
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
