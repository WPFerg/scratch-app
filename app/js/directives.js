'use strict';

/* Directives */

// Create transaction visualisation
var scratch = angular.module('scratch.directives', ['ngRoute']);
scratch.directive('versionInfo', ['version', function(version)
{
	return {
		restrict: 'E',
		link: function(scope, element, attrs)
			{
				element.text(version);
			}
	}
}]);
scratch.directive('loadOnVerticalScroll', ['$document', '$window', function($document, $window)
{
    return {
    	restrict: 'A',
    	scope:
    	{
    		loadingNextPage: '=',
    		loadNextPage: '&',
    		anotherPage: '='
    	},
    	link: function(scope, element, attrs)
    	{

		  // Bind a touch event to enable
		  $document.bind('scroll', function() {

		    var height = $document.height();
		    var location = $document.scrollTop();

		    // If the user has scrolled through 90% of the page and there's another page to load, load it.
		    if(location + $window.innerHeight >= 0.9* height && scope.anotherPage && !scope.loadingNextPage)
		    {
		      	scope.loadNextPage();
		    }

		  });
    	}
  	}
}]);

scratch.directive("loadProjectPage", ["$window", function($window)
{
	return {
		restrict: "A",
		scope: {
			projectSettings: "="
		},
		link: function(scope, element, attrs) {
			element.click(function() {
    			$window.location = "#/project/" + scope.projectSettings.projectId;
			});
		}
	}
}]);

scratch.directive("loadProjectPlayer", ["$window", function($window)
{
	return {
		restrict: "A",
		scope: {
			projectSettings: "="
		},
		link: function(scope, element, attrs) {
			element.click(function(e) {
				e.stopPropagation();
    			$window.location = "/scratch-player/" + scope.projectSettings.projectId + '#showflags=true&autoplay=false&fullscreen=true';
			});
		}
	}
}]);

scratch.directive('scrollable', ['$window', function($window)
{
	return {
		restrict: 'A',
		scope: {

		},
		link: function(scope, element, attrs)
		{
			// Bind first touch method
			var touchScrollX, touchHistory;
			element.bind('touchstart', function(Event)
			{
		        // Get initial touch position for later working
		        var Touch = Event.originalEvent.changedTouches[0];
		        touchScrollX = Touch.pageX;

		        // Create empty history management object
		        touchHistory = {};
		        touchHistory.record = true;
		        touchHistory.head = 0;
		        touchHistory.maxRecordings = 20;
		        touchHistory.recordings = [];
		        touchHistory.decelerateVelocity = 0;

		        // Create velocity retrieval function
		        touchHistory.getVelocity = function(touchHistory)
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
		          // console.log('[' + (touchHistory.head-1) + ']' + StartX + ' > [' + checkIndex + ']' + EndX + ' = ' + (StartX-EndX));

		          // Return calculated velocity
		          return (StartX - EndX);

		        }

		        // Create timing function
		        function timingFunction()
		        {

		          // Add record to queue
		          touchHistory.recordings[touchHistory.head] = touchScrollX;

		          // Wrap queue head
		          touchHistory.head = (touchHistory.head + 1) % touchHistory.maxRecordings;

		          // Recurse on record flag
		          if (touchHistory.record)
		          {
		            setTimeout(timingFunction, 5);
		          }

		        };

		        // Set timeout start
		        setTimeout(timingFunction, 5);
	    	});

	    // Bind movement method
	      element.bind('touchmove', function(Event)
	      {

	        // Get movement update
	        var Touch = Event.originalEvent.changedTouches[0];
	        element.scrollLeft(element.scrollLeft() + touchScrollX - Touch.pageX);

	        // Save position for future working
	        touchScrollX = Touch.pageX;

	      });

	    // Bind touch end method
	      element.bind('touchend', function(Event)
	      {

	        // Decelerate scroll
	        function DecelerateScroll()
	        {

	          // Set increment
	          var increment = 10;
	          if (touchHistory.decelerateVelocity < 0) 
	          {
	            increment = -10;
	          }
	          // Get current velocity
	          var velocity = touchHistory.decelerateVelocity;
	          //console.log(velocity);

	          // Apply movement
	          element.scrollLeft(element.scrollLeft() + velocity);

	          // Reduce velocity
	          velocity = velocity * 0.95;

	          // Snap velocity to 0 if close
	          if (velocity > -0.5 && velocity < 0.5)
	          {
	            velocity = 0;
	          }

	          // Update velocity
	          touchHistory.decelerateVelocity = velocity;

	          // Apply deceleration
	          if (velocity !== 0)
	          {
	            setTimeout(DecelerateScroll, 5);
	          }

	        };

	        // Stop recordings
	        touchHistory.record = false;
	        touchHistory.decelerateVelocity = touchHistory.getVelocity(touchHistory) * 0.7;

	        // Run scroll deceleration
	        DecelerateScroll(touchHistory);

		});
	}
}
}]);
