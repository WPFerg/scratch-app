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
  beforeEach(module('scratch.services'));

  describe("ProjectCtrl", function()
  {

    var scope, ctrl, $httpBackend;

    // Set up the project controller for testing
    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;

      // The 2 GET requests made during launch
      $httpBackend.expectGET("http://scratch.mit.edu/api/v1/project/ScratchProject/?format=json ").respond({name: "Mr Scratch"});
      $httpBackend.expectGET("http://projects.scratch.mit.edu/internalapi/project/ScratchProject/get/ ").respond({children:["1"], sounds:["2", "3"], costumes:["4"]});

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
      // Check each part individually to see if they're defined. $promises are irrelevant so toEqualData doesn't work.
      // ProjectInDepth isn't really needed any more so this will likely be removed in a future version
      expect(scope.projectInDepth.children).toEqual(["1"]);
      expect(scope.projectInDepth.sounds).toEqual(["2", "3"]);
      expect(scope.projectInDepth.costumes).toEqual(["4"]);

      expect(scope.projectExists).toBe(true);
    });
  }); 

  describe("IndexCtrl", function()
  {
    // Nothing to test.
  });

  describe("UserCtrl", function() 
  {
    var $httpBackend, scope, ctrl;
    beforeEach(inject(function($rootScope, $controller, _$httpBackend_, $routeParams) {
      $httpBackend = _$httpBackend_;

      $httpBackend.expectGET("/user/projects/AlanSugar/1 ").respond({"success": 200, "projects": [{"title": "You're Fired (out of a cannon)",
                                                                                          "projectId": "1234"},
                                                                                        {"title": "Amstrad: The Game", 
                                                                                          "projectId": "5678"}]});
      $routeParams.userId = "AlanSugar";

      scope = $rootScope.$new();
      ctrl = $controller("UserCtrl", {$scope: scope});
    }));

    it("should get the list of projects for a user", function()
    {
      expect(scope.projectList).toBeUndefined();
      $httpBackend.flush();

      // Only need to check titles and ids, $promises are irrelevant
      expect(scope.projectList[0].title).toEqual("You're Fired (out of a cannon)");
      expect(scope.projectList[0].projectId).toEqual("1234");
      expect(scope.projectList[1].title).toEqual("Amstrad: The Game");
      expect(scope.projectList[1].projectId).toEqual("5678");
    });
  });

  describe("DashboardCtrl", function()
  {

    // Create http catch system
    var $httpBackend, scope, ctrl;

  });

});