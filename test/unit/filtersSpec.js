'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('scratch.filters'));


  describe('NewLine Filter', function() {

    it('should exist', inject(function($filter) {
    	expect($filter('newLine')).not.toBeNull();
    }));


    it('should replace \\n with <br />', inject(function(newLineFilter) {
    	// Run the \nI'm a test\n through the filter, then unwrap its trusted value to get the actual
    	// value.
    	var filtered = newLineFilter("\nI'm a test\n");
    	expect(filtered.$$unwrapTrustedValue()).toEqual("<br />I'm a test<br />");

    	filtered = newLineFilter("\nI'm a\ntest\n");
    	expect(filtered.$$unwrapTrustedValue()).toEqual("<br />I'm a<br />test<br />");

    	filtered = newLineFilter("\n\n");
    	expect(filtered.$$unwrapTrustedValue()).toEqual("<br /><br />");
    }));

  });

  describe("DateTime to Readable Filter", function() {

    it('should exist', inject(function($filter) {
    	expect($filter('dateTimeToReadable')).not.toBeNull();
    }));

    it('should replace the less readable YYYY-MM-DDTHH:MM:SS into something nicer', inject(function(dateTimeToReadableFilter) {
		expect(dateTimeToReadableFilter("0000-00-00-T00:00:00")).toBe("00/00/0000 00:00:00");
		expect(dateTimeToReadableFilter("4519-12-24-T23:58:59")).toBe("24/12/4519 23:58:59");

    }));
  });
});
