'use strict';

/* Controllers */

angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])
  .controller('IndexCtrl', ['$scope', function($scope) {

  }])
  .controller('ProjectCtrl', ['$scope', 'Projects', 'ProjectDetails', '$routeParams', function($scope, Projects, ProjectDetails, $routeParams) {
  	// Get the project
  	$scope.project = ProjectDetails.get({projectId: $routeParams.projectId});
  	// This will then just be displayed on the view.

  }]);
