'use strict';


// Declare app level module which depends on filters, and services
angular.module('scratch', [
  'ngRoute', 'ngResource', 'ngCookies',
  'scratch.filters',
  'scratch.services',
  'scratch.directives',
  'scratch.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project/:projectId', {templateUrl: 'partials/project.html', controller: 'ProjectCtrl'});
  $routeProvider.when('/index', {templateUrl: 'partials/index.html', controller: 'IndexCtrl'});
  $routeProvider.otherwise({redirectTo: '/index'});
}]);
