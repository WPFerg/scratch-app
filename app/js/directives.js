'use strict';

/* Directives */

// Create transaction visualisation
var scratch = angular.module('scratch.directives', ['ngRoute']);


// Version notice directive
scratch.directive('getAppVersion', function()
{
    return {
    	restrict: 'E',
    	scope:
    	{

    	},
    	link: function(scope, element)
    	{

    	}
  	}
});

// Copyright notice directive