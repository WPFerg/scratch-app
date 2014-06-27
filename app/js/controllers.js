'use strict';

/* Controllers */

angular.module('scratch.controllers', ['scratch.directives', 'ngRoute', 'ngResource'])
  .controller('MyCtrl1', ['$scope', 'Projects', '$http', function($scope, Projects, $http) {
  	$scope.project = "No Project";
  	$scope.project = Projects.get({projectId: "23600596"});
  	alert("What");
  	//$http.jsonp("//projects.scratch.mit.edu/internalapi/project/23600596/get/?callback=JSON_CALLBACK").success(function(data) { console.log(data.found); });
  	console.log($scope.project);
  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
