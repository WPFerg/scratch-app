'use strict';

/* Directives */


angular.module('scratch.directives', ['ngResource']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);