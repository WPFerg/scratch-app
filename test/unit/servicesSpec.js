'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('scratch.services'));


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });

  describe("Projects", function() {
  	 // var Projects, $httpBackend;

    // // Set up the project service for testing
    // beforeEach(inject(function(_$httpBackend_, _ProjectsService_ ) {
    //   $httpBackend = _$httpBackend_;

    //   // The 2 GET requests made during launch
    //   $httpBackend.expectGET("/projectdetails/ScratchProject/?format=json ").respond({name: "Mr Scratch"});
    //   Projects = _ProjectsService_;
    // }));

    // it('should get project details', function() {
    //   // Get the project details

    //   $httpBackend.flush();

    // });
  });
});
