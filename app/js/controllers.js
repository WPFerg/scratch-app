'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])

ControllerModule.controller('DashboardCtrl', ['$scope', '$routeParams', '$window', 'UserDetails', 'UserFollowers', function($scope, $routeParams, $window, UserDetails, UserFollowers)
{
  // Set booleans
  $scope.finishedLoading = false;
  $scope.showAllFriends = false;
  $scope.loadingNextChunk = false;
  $scope.followersLeft = true;

  // Set default values for projects
  $scope.userApps = [];
  $scope.friendsApps = [];
  $scope.visibleFollowerCount = 5;
  $scope.visibleFollowerIncrement = 5;
  $scope.lastLoadedProjectIndex = 0;

  // Get user ID
  $scope.userID = $routeParams.userId;

  // Capitalise/possessify the user ID in a friendly manner
  $scope.userIDCapitalised = $scope.userID.charAt(0).toUpperCase() + $scope.userID.slice(1).toLowerCase();
  $scope.userIDCapitalised += ($scope.userIDCapitalised.charAt($scope.userIDCapitalised.length - 1) == "s") ? "'" : "'s";

  function FindFollowerProjects(Count)
  {

    // Error checking to make sure follower is assigned
    if(typeof($scope.friendsApps[$scope.lastLoadedProjectIndex]) === "undefined")
    {
      if($scope.lastLoadedProjectIndex < $scope.friendsApps.length-1)
      {
        // Even though this follower may not exist, previous ones might.
        $scope.lastLoadedProjectIndex = $scope.lastLoadedProjectIndex + 1;
        FindFollowerProjects(Count);
      } else {
        // No more followers to check.
        $scope.finishedLoading = true;
        $scope.loadingNextChunk = false;
      }
      return;
    }

    var userProject = UserDetails.get({"userId": $scope.friendsApps[$scope.lastLoadedProjectIndex].username}, function(response)
    {

      // Link response project list to the users project list
      $scope.friendsApps[$scope.lastLoadedProjectIndex].projects = response.projects;

      // Process update on base case
      if ($scope.lastLoadedProjectIndex == $scope.friendsApps.length-1 || Count >= ($scope.visibleFollowerCount-1))
      {
        $scope.finishedLoading = true;
        $scope.loadingNextChunk = false;
      } else {
        $scope.lastLoadedProjectIndex = $scope.lastLoadedProjectIndex + 1;
        FindFollowerProjects(Count + 1);
      }
    
    }, function(response) {

      // Set user projects to nothing
      // Called on error

      if($scope.lastLoadedProjectIndex != $scope.friendsApps.length-1)
      {
        $scope.finishedLoading = true;
        $scope.loadingNextChunk = false;
        $scope.error = response.data;
      } else {
        $scope.lastLoadedProjectIndex = $scope.lastLoadedProjectIndex + 1;
        FindFollowerProjects(Count + 1);
      }
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

  // Create show/hide all follower toggles
  $scope.toggleAllFriends = function()
  {
    $scope.showAllFriends = ($scope.showAllFriends == false);
  };

  // Load the next set of followers and their projects
  $scope.loadNextFollowerChunk = function()
  {

    // Increase the amount of followers to display
    var oldVisibleCount = $scope.visibleFollowerCount;
    $scope.visibleFollowerCount = Math.min($scope.visibleFollowerCount + $scope.visibleFollowerIncrement, $scope.friendsApps.length)

    // Mark as loading
    $scope.loadingNextChunk = true;

    // Call method to load next chunk of follower projects
    $scope.lastLoadedProjectIndex = $scope.lastLoadedProjectIndex + 1;
    FindFollowerProjects(oldVisibleCount);

  };

  // Run procedure to generate user projects
  var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    if(!!response.projects && response.projects.length !== 0)
    {
      $scope.userApps = response.projects;
    } else {
      $scope.userHasNoProjects = true;
      $scope.finishedLoading = true;
    }
    
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
    if(!!response.followers && response.followers.length > 0)
    {
      // console.log(response.followers.length);
      $scope.friendsApps = response.followers;

      // Find all of the projects created by followers
      $scope.loadingNextChunk = true;
      FindFollowerProjects(0);

    } else {
      $scope.userHasNoFollowers = true;
      $scope.finishedLoading = true;
    }
  }, function (response) {

    // Store error information in an error holding variable
    $scope.error = response.data;

  });

}]);

ControllerModule.controller('IndexCtrl', ['$scope', function($scope) 
{

}]);

ControllerModule.controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', '$window', function($scope, Projects, ProjectDetails, $routeParams, $window)
{
  
  $scope.showflags = true;
  $scope.autostart = false;
  $scope.fullscreen = true;

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

    // Initialize variables
    $scope.userId = $routeParams.userId;
    $scope.currentPage = 1;
    $scope.loadingNextPage = false;

    // And get the User's Projects from the API and add the project to the list.
    // This should be cached by the manifest.
    var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response)
    {

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

    // Initialize variables
    $scope.loadingNextPage = true;
    $scope.currentPage++;

    UserDetails.get({"userId": $routeParams.userId, "page": $scope.currentPage}, function(response)
    {

      $scope.loadingNextPage = false;

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
