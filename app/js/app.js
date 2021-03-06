'use strict';


// Declare app level module which depends on filters, and services
angular.module('scratch', [
  'ngRoute', 'ngResource',
  'scratch.filters',
  'scratch.services',
  'scratch.directives',
  'scratch.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/project/:projectId', {templateUrl: 'partials/project.html', controller: 'ProjectCtrl'});
  $routeProvider.when('/index', {templateUrl: 'partials/index.html', controller: 'IndexCtrl'});
  $routeProvider.when('/user/:userId', {templateUrl: 'partials/user.html', controller: 'UserCtrl'});
  $routeProvider.when('/dashboard/:userId', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
  $routeProvider.otherwise({redirectTo: '/index'});
}]);
