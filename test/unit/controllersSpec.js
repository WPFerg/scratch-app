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

  describe("InstalledProjectsCtrl", function() 
  {
    var $httpBackend, cookies, scope, ctrl;
    beforeEach(inject(function($rootScope, $controller, _$cookies_, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      cookies = _$cookies_;
      cookies.installedApps = "1234,5678";

      $httpBackend.expectGET("/projectdetails/1234/?format=json ").respond({title: "Mr Scratch", id: "1234"});
      $httpBackend.expectGET("/projectdetails/5678/?format=json ").respond({title: "Mrs Scratch", id: "5678"});

      scope = $rootScope.$new();
      ctrl = $controller("InstalledProjectsCtrl", {$scope: scope, $cookies: cookies});
    }));

    it("should get the project details of every installed app", function()
    {
      $httpBackend.flush();

      // Only need to check titles and ids, $promises are irrelevant
      expect(scope.projectList[0].title).toEqual("Mr Scratch");
      expect(scope.projectList[0].id).toEqual("1234");
      expect(scope.projectList[1].title).toEqual("Mrs Scratch");
      expect(scope.projectList[1].id).toEqual("5678");
    });
  });
});