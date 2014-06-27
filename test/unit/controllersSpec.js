'use strict';

/* jasmine specs for controllers go here */

describe('Scratch Controllers', function(){
   beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });
   // Import stuff
  beforeEach(module('scratch.controllers'));
  beforeEach(module('scratch.directives'));

  describe("ProjectCtrl", function()
  {

    var scope, ctrl, $httpBackend;

    // Set up the project controller for testing
    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;

      // The 2 GET requests made during launch
      $httpBackend.expectGET("/projectdetails/ScratchProject/?format=json ").respond({name: "Mr Scratch"});
      $httpBackend.expectGET("/projects/ScratchProject/get/ ").respond({children:["1"], sounds:["2", "3"], costumes:["4"]});

      // Specify it's the "ScratchProject" project we want
      $routeParams.projectId = "ScratchProject";
      scope = $rootScope.$new();
      ctrl = $controller("ProjectCtrl", {$scope: scope});
    }));

    it('should get project details', function() {
      // Get the project details

      $httpBackend.flush();
      expect(scope.project.name).toBe("Mr Scratch");
    });

    it('should get project details', function() {
      //spec body

      $httpBackend.flush();
      expect(scope.projectInDepth).toEqualData({children:["1"], sounds:["2", "3"], costumes:["4"], assetLength: 4});
    });
  }); 

  describe("IndexCtrl", function()
  {
    // Nothing to test.
  })
});