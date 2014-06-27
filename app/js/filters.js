'use strict';

/* Filters */

angular.module('scratch.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]).
  filter("newLine", ['$sce', function($sce)	// Parses \n for descriptions.
  	{
  		return function(text)
  		{
  			// Replace \n with <br />
  			text = text.replace(/\n/g, "<br />");
  			// Trust the HTML so it can be displayed
  			return $sce.trustAsHtml(text);
  		}
  	}]);
