'use strict';

/* Filters */

angular.module('scratch.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]).
  filter("newLine", ['$sce', function($sce)	// Parses \n for descriptions.
  	{
  		return function(text)
  		{
        // Quick type check to see if text is defined
        if(typeof(text) === "undefined")
        {
          return;
        }
  			// Replace \n with <br />
  			text = text.replace(/\n/g, "<br />");
  			// Trust the HTML so it can be displayed
  			return $sce.trustAsHtml(text);
  		}
  	}]).
  filter("dateTimeToReadable", function()
    { // Converts YYYY-MM-DDTHH:MM:SS into a readable format.
      return function(text)
      {
        // Basic type check to see if text is defined
        if(typeof(text) === "undefined")
        {
          return;
        }

        var date, time, day, month, year;
        // Split into YYYY-MM-DD and HH:MM:SS
        var dateTimeSplit = text.split(/T/);
        date = dateTimeSplit[0];
        time = dateTimeSplit[1];
        // Time is in readable format, just need to convert date

        // Split into YYYY, MM, and DD
        var dateComponents = date.split(/-/);
        year = dateComponents[0];
        month = dateComponents[1];
        day = dateComponents[2];

        // Compose a readable date formate, DD/MM/YYYY.
        date = day + "/" + month + "/" + year;

        return date + " " + time;
      }
    });
