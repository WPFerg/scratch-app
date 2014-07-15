'use strict';
/* Controllers */

var ControllerModule = angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])

ControllerModule.controller('DashboardCtrl', ['$scope', '$routeParams', '$window', 'UserDetails', 'UserFollowers', function($scope, $routeParams, $window, UserDetails, UserFollowers)
{


  // Set booleans
  $scope.finishedLoading = false;
  $scope.showAllFriends = false;

  // Set default values for projects
  $scope.userApps = [];
  $scope.friendsApps = [];

  // Get user ID
  $scope.userID = $routeParams.userId;

  function BindTouchEvents()
  {

    // Bind first touch method
    $('.dashboard-app-group-list').each(function()
    {
      $(this).bind('touchstart', function(Event)
      {

        // Create context reference
        window.touchMonitor = this;

        // Get initial touch position for later working
        var Touch = Event.originalEvent.changedTouches[0];
        this.touchScrollX = Touch.pageX;

        // Create empty history management object
        this.touchHistory = {};
        this.touchHistory.record = true;
        this.touchHistory.head = 0;
        this.touchHistory.maxRecordings = 20;
        this.touchHistory.recordings = [];
        this.touchHistory.decelerateVelocity = 0;

        // Create velocity retrieval function
        this.touchHistory.getVelocity = function(touchHistory)
        {

          // Set end value and working index
          var checkIndex = touchHistory.head-1;
          var EndX = touchHistory.recordings[checkIndex];

          // Calculate starting position
          checkIndex = (checkIndex + 1) % Math.min(touchHistory.maxRecordings, touchHistory.recordings.length);
          while (touchHistory.recordings[checkIndex] == 'undefined')
          {
            checkIndex = (checkIndex + 1) % Math.min(touchHistory.maxRecordings, touchHistory.recordings.length);
          }
          var StartX = touchHistory.recordings[checkIndex];

          // Debug message
          console.log('[' + (touchHistory.head-1) + ']' + StartX + ' > [' + checkIndex + ']' + EndX + ' = ' + (StartX-EndX));

          // Return calculated velocity
          return (StartX - EndX);

        }

        // Create timing function
        function timingFunction()
        {

          // Add record to queue
          window.touchMonitor.touchHistory.recordings[window.touchMonitor.touchHistory.head] = window.touchMonitor.touchScrollX;

          // Wrap queue head
          window.touchMonitor.touchHistory.head = (window.touchMonitor.touchHistory.head + 1) % window.touchMonitor.touchHistory.maxRecordings;

          // Recurse on record flag
          if (window.touchMonitor.touchHistory.record)
          {
            setTimeout(timingFunction, 5);
          }

        };

        // Set timeout start
        setTimeout(timingFunction, 5);

      });
    });

    // Bind movement method
    $('.dashboard-app-group-list').each(function()
    {
      $(this).bind('touchmove', function(Event)
      {

        // Get movement update
        var Touch = Event.originalEvent.changedTouches[0];
        $(this).scrollLeft($(this).scrollLeft() + this.touchScrollX - Touch.pageX);

        // Save position for future working
        this.touchScrollX = Touch.pageX;

      });
    });

    // Bind touch end method
    $('.dashboard-app-group-list').each(function()
    {
      $(this).bind('touchend', function(Event)
      {

        // Decelerate scroll
        function DecelerateScroll()
        {

          // Set increment
          var increment = 10;
          if (window.touchMonitor.touchHistory.decelerateVelocity < 0) 
          {
            increment = -10;
          }

          // Get current velocity
          var velocity = window.touchMonitor.touchHistory.decelerateVelocity;
          console.log(velocity);

          // Apply movement
          var self = window.touchMonitor;
          $(self).scrollLeft($(self).scrollLeft() + velocity);

          // Reduce velocity
          velocity = velocity * 0.95;

          // Snap velocity to 0 if close
          if (velocity > -0.5 && velocity < 0.5)
          {
            velocity = 0;
          }

          // Update velocity
          window.touchMonitor.touchHistory.decelerateVelocity = velocity;

          // Apply deceleration
          if (velocity !== 0)
          {
            setTimeout(DecelerateScroll, 5);
          }

        };

        // Stop recordings
        this.touchHistory.record = false;
        this.touchHistory.decelerateVelocity = this.touchHistory.getVelocity(window.touchMonitor.touchHistory) * 0.7;

        // Run scroll deceleration
        DecelerateScroll(this.touchHistory);

      });
    });

  }

  function FindFollowerProjects(Index, Count)
  {
    // Check to see if that follower exists
    if(typeof($scope.friendsApps[Index]) === "undefined")
    {
      if(Index > 0)
      {
        // Even though this follower may not exist, previous ones might.
        FindFollowerProjects(Index-1, Count + 1);
      } else {
        // No more followers to check.
        $scope.finishedLoading = true;
      }
      return;
    }

    var userProject = UserDetails.get({"userId": $scope.friendsApps[Index].username}, function(response)
    {

      // Link response project list to the users project list
      $scope.friendsApps[Index].projects = response.projects;

      // Process update on base case
      if (Index == 0)
      {
        $scope.finishedLoading = true;
        BindTouchEvents();
      } else {
        FindFollowerProjects(Index-1, Count + 1);
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

  // Create show/hide all follower toggles
  $scope.toggleAllFriends = function()
  {
    $scope.showAllFriends = ($scope.showAllFriends == false);
  };

  // Run procedure to generate user projects
  var userDetails = UserDetails.get({"userId": $routeParams.userId}, function(response)
  {

    // Link response project list to the user apps list
    if(response.projects.length !== 0)
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
    if(response.followers.length !== 0)
    {
      console.log(response.followers.length);
      $scope.friendsApps = response.followers;

      // Find all of the projects created by followers
      FindFollowerProjects($scope.friendsApps.length-1, 0);
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

  $scope.loadingNextPage = false;

  // Bind a touch event to enable
  $(window).scroll(function(e) {
    var height = $(document).height();
    var location = $(document).scrollTop();

    // If the user has scrolled through 90% of the page and there's another page to load, load it.
    if(location >= 0.9* height && $scope.anotherPage && !$scope.loadingNextPage)
    {
      $scope.loadNextPage();
    }

  })

  // Function to move to the player's project.
  $scope.playProject = function(project)
  {
    $window.location = "/scratch-player/" + project.projectId;
  }

  // Load the next page for pagination
  $scope.loadNextPage = function()
  {
    $scope.loadingNextPage = true;
    $scope.currentPage++;
    console.log("Loading page " + $scope.currentPage);
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
