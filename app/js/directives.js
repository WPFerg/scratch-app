'use strict';

/* Directives */

// Create transaction visualisation
var scratch = angular.module('scratch.directives', ['ngRoute']);


// Version notice directive
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

// Copyright notice directive