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
  $routeProvider.when('/installed', {templateUrl: 'partials/installed.html', controller: 'InstalledProjectsCtrl'});
  $routeProvider.when('/user', {templateUrl: 'partials/user_apps.html', controller: 'UserAppsCtrl'});
  $routeProvider.otherwise({redirectTo: '/index'});
}]);
