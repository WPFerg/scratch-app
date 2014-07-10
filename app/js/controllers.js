'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource', 'ngCookies'])

ControllerModule.controller('DashboardCtrl', ['$scope', '$routeParams', '$window', 'UserDetails', 'UserFollowers', function($scope, $routeParams, $window, UserDetails, UserFollowers)
{

  // Method to resize all window elements
  $scope.ResizeWindowElements = function()
  {

    // Calculate number of apps to fit in an app-block
    var AppColCount = (screen.width - screen.width % 105) / 105;

    // Create simple list containing number of items which can be displayed
    $scope.userApps.display = [];
    for (var count = 0; count < Math.min(AppColCount, $scope.userApps.all.length); count ++)
    {
      $scope.userApps.display.push($scope.userApps.all[count]);
    }

    // Calculate list items to display for a friend
    for (var count = 0; count < $scope.friendsApps.length; count ++)
    {

      // Iterate for each friend limiting the apps to display
      $scope.friendsApps[count].display = [];
      for (var count2 = 0; count2 < Math.min(AppColCount, $scope.friendsApps[count].projects.length); count2 ++)
      {
        $scope.friendsApps[count].display.push($scope.friendsApps[count].projects[count2]);        
      }

    }

    // Reming angular to update
    $scope.$apply();
  
  };

  function FindFollowerProjects(Index)
  {

    var userProject = UserDetails.get({"userId": $scope.friendsApps[Index].username}, function(response)
    {

      console.log(Index);
      console.log($scope.friendsApps[Index].username);

      // Link response project list to the users project list
      $scope.friendsApps[Index].projects = response.projects;

      // Process update on base case
      if (Index == 0)
      {
        $scope.ResizeWindowElements();
      } else {
        FindFollowerProjects(Index-1);
      }
    
    }, function(response) {

      // Set user projects to nothing
      $scope.error = response.data;

    });

  };

  // Create function to navigate to project
  $scope.NavigateToProject = function(project)
  {
    $window.location = "#/project/" + project.projectId;
  };

  // Create function to navigate to player
  $scope.NavigateToPlayer = function(project)
  {
    $window.location = "/scratch-player/" + project.projectId;
  };

  // Set default values
  $scope.userApps = {};
  $scope.userApps.all = [];
  $scope.userApps.display = [];
  $scope.friendsApps = [];

  // Get user ID
  $scope.userID = $routeParams.userId;

  // Run procedure to generate user projects
  var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    $scope.userApps.all = response.projects;

    // Process update
    $scope.ResizeWindowElements();
    
  }, function (response) {

    // Store error information in an error holding variable
    $scope.error = response.data;

  });

  // Run procedure to generate following projects
  var userDetails = UserFollowers.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    $scope.friendsApps = response.followers;

    // Find all of the projects created by followers
    FindFollowerProjects($scope.friendsApps.length-1);

  }, function (response) {

    // Store error information in an error holding variable
    $scope.error = response.data;

  });

  // Create orientation event variables
  var supportsOrientationChange = "onorientationchange" in window;
  var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

  // Add event and link to event method
  $scope.ResizeWindowElements();
  window.addEventListener(orientationEvent, $scope.ResizeWindowElements, false);

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
