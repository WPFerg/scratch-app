'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])

ControllerModule.controller('DashboardCtrl', ['$scope', '$routeParams', '$window', 'UserDetails', 'UserFollowers', function($scope, $routeParams, $window, UserDetails, UserFollowers)
{

  // Method to allow updating of loader method
  function UpdateLoadingMessage(NewMessage)
  {

  };

  // Method to resize all window elements
  function ResizeWindowElements()
  {

    // Calculate number of apps to fit in an app-block
    var AppColCount = (screen.width - screen.width % 107) / 107;

    // Create simple list containing number of items which can be displayed
    $scope.userApps.display = [];
    for (var count = 0; count < Math.min(AppColCount, $scope.userApps.all.length); count ++)
    {
      $scope.userApps.display.push($scope.userApps.all[count]);
    }

    // Calculate list items to display for a friend
    for (var count = 0; count < $scope.friendsApps.all.length; count ++)
    {

      // Create new object
      $scope.friendsApps.display[count] = {};
      $scope.friendsApps.display[count].projects = [];
      $scope.friendsApps.display[count].username = $scope.friendsApps.all[count].username;

      // Iterate for each friend limiting the apps to display
      if ($scope.friendsApps.all[count].projects !== null)
      {
        for (var count2 = 0; count2 < Math.min(AppColCount, $scope.friendsApps.all[count].projects.length); count2 ++)
        {
          $scope.friendsApps.display[count].projects.push($scope.friendsApps.all[count].projects[count2]);        
        }
      }

    }

    // Calculate the height and width which can be used
    var WorkHeight = $('body').height();
    var WorkWidth = $('body').width() - parseInt($('.container').css('padding-left').replace('px',''));
    
    // Calculate the size for the dashboard buttons
    var ButtonWidth = Math.max(WorkWidth / 4, 150)
    
    // Calculate the padding vertically and horizontally making sure it is reasonable
    var PaddingTop = Math.max((WorkHeight-25) / 2, 250);
    var PaddingLeft = (WorkWidth-25) / 2;

    // Apply sizing to navigation top buttons

    // Apply padding to the loading gif
    $('#dashboardloader').css('margin-top', PaddingTop.toString() + 'px');
    $('#dashboardloader').css('margin-bottom', PaddingTop.toString() + 'px');
    $('#dashboardloader').css('margin-left', PaddingLeft.toString() + 'px');
    $('#dashboardloader').css('margin-right', PaddingLeft.toString() + 'px');

    // Reming angular to update
    if (!$scope.$$phase) { $scope.$apply(); }
  
  };

  function FindFollowerProjects(Index)
  {
    // Check to see if that follower exists
    if(typeof($scope.friendsApps.all[Index]) === "undefined")
    {
      if(Index > 0)
      {
        // Even though this follower may not exist, previous ones might.
        FindFollowerProjects(Index-1);
      } else {
        // No more followers to check.
        $scope.finishedLoading = true;
      }
      return;
    }

    var userProject = UserDetails.get({"userId": $scope.friendsApps.all[Index].username}, function(response)
    {

      // Link response project list to the users project list
      $scope.friendsApps.all[Index].projects = response.projects;

      // Process update on base case
      if (Index == 0)
      {
        $scope.finishedLoading = true;
        ResizeWindowElements();
      } else {
        FindFollowerProjects(Index-1);
      }
    
    }, function(response) {

      // Set user projects to nothing
      $scope.finishedLoading = true;
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
    $window.location = "/scratch-player/" + project.projectId + '/#/flags';
  };

  // Set finished loading boolean
  $scope.finishedLoading = false;

  // Set default values
  $scope.userApps = {};
  $scope.userApps.all = [];
  $scope.userApps.display = [];
  $scope.friendsApps = {};
  $scope.friendsApps.all = [];
  $scope.friendsApps.display = [];

  // Get user ID
  $scope.userID = $routeParams.userId;

  // Run procedure to generate user projects
  var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    if(response.projects.length !== 0)
    {
      $scope.userApps.all = response.projects;
    } else {
      $scope.userHasNoProjects = true;
      $scope.finishedLoading = true;
    }
    // Process update
    ResizeWindowElements();
    
  }, function (response) {

    // Store error information in an error holding variable
    $scope.finishedLoading = true;
    $scope.error = response.data;

  });

  // Run procedure to generate following projects
  var userDetails = UserFollowers.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    // check to see if followers exist
    if(response.followers.length !== 0)
    {
      console.log(response.followers.length);
      $scope.friendsApps.all = response.followers;

      // Find all of the projects created by followers
      FindFollowerProjects($scope.friendsApps.all.length-1);
    } else {
      $scope.userHasNoFollowers = true;
      $scope.finishedLoading = true;
    }
  }, function (response) {

    // Store error information in an error holding variable
    $scope.error = response.data;

  });

  // Create orientation event variables
  var supportsOrientationChange = "onorientationchange" in window;
  var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

  // Add event and link to event method
  ResizeWindowElements();
  window.addEventListener(orientationEvent, ResizeWindowElements, false);

}]);

ControllerModule.controller('IndexCtrl', ['$scope', function($scope) 
{

}]);

ControllerModule.controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', '$window', function($scope, Projects, ProjectDetails, $routeParams, $window)
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

  $scope.showflags = false;

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

  // Set the image to scale with the screen
  $scope.calcImageWidth = function() {
    var workHeight = $window.innerHeight;
    var workWidth = $window.innerHeight;
  
    if (!$scope.$$phase) { $scope.$apply(); }

    // Set to t he smaller of the width/heights so it will def. appear on screen.
    return {"width": Math.min(0.8*workHeight, 0.8*workWidth) + "px"};
  }

    
  // Create orientation event variables
  var supportsOrientationChange = "onorientationchange" in window;
  var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

  // Add event and link to event method
  $window.addEventListener(orientationEvent, $scope.calcImageWidth, false);

}]);

ControllerModule.controller("UserCtrl", ['$scope', 'UserDetails', '$routeParams' ,'$window', function($scope, UserDetails, $routeParams, $window)
{

  // Get the list of installed apps, stored as a cookie CSV. Do type check to see if it exists first
  if(typeof($routeParams.userId) !== "undefined")
  {
    $scope.userId = $routeParams.userId;
    $scope.currentPage = 1;
    // And get the User's Projects from the API and add the project to the list.
    // This should be cached by the manifest.
    var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response) {
      // On success, add the projects associate with the user to the list
      $scope.projectList = response.projects;

      // If there's more projects than on this page, show a message to allow the user to load more.
      if(response.projects.length >= 60)
      {
        $scope.anotherPage = true;
      } else {
        $scope.anotherPage = false;
      }

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

  // Load the next page for pagination
  $scope.loadNextPage = function()
  {
    $scope.currentPage++;
    console.log("Loading page " + $scope.currentPage);
    UserDetails.get({"userId": $routeParams.userId, "page": $scope.currentPage}, function(response) {

      // On success, add the projects associate with the user to the list
      $scope.projectList = $scope.projectList.concat(response.projects);

      // If the scope isn't updating the view because a function has been called, tell it to.
      if(!$scope.$$phase)
      {
        $scope.$apply();
      }

      // If there's more projects than on this page, show a message to allow the user to load more.
      if(response.projects.length >= 60)
      {
        $scope.anotherPage = true;
      } else {
        $scope.anotherPage = false;
      }
    });
  }

}]);
