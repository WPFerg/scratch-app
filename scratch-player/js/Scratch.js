// Copyright (C) 2013 Massachusetts Institute of Technology
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 2,
// as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

// Scratch HTML5 Player
// Scratch.js
// Tim Mickel, July 2011

// Here we define the actions taken on window load.
// The three application-wide global variables are defined here.

'use strict';

// Create empty variables -- will be changed later
//var runtime, interp, io, iosAudioActive = false;

var Interpreter = require('./Interpreter'),
    Runtime = require('./Runtime'),
    IO = require('./IO'),
    $ = require('jquery'),
    appcache = require('./AppCache'),
    Scaling = require('./Scaling'),
    cookie = require('cookie-cutter');

var iosAudioActive = false;

// Create the scratch project from an ID
function Scratch(project_id)
{
    // Define and initialise the runtime
    //runtime = new Runtime();
    global.runtime = new Runtime();

    // Create IO object
    //io = new IO();
    global.io = new IO();

    // Load AppCache to show the state of download
    appcache.listen();

    // Called on success of loading the project -- bind relevant events and create objects required to launch.
    runtime.init();

    // Load the interpreter and primitives
    //interp = new Interpreter();
    global.interp = new Interpreter();
    interp.initPrims();

    // Set project details from the API to set the title to the title of the project. If the project hasn't been published, fail silently.
    $.get("/projectdetails/" + project_id + "/?format=json", function(projectData) {
        $("title").text(projectData.title);
    }).fail(function(){});

    // Load the requested project and go!
    io.loadProject(project_id, function()
    {
        // Project exists, so
        // Bind keydown events that are fired when executing the project
        $(window).keydown(function(e)
        {
            runtime.keysDown[e.which] = true;
            runtime.startKeyHats(e.which);
        });

        // Remove the keydown events when they're fired.
        $(window).keyup(function(e)
        {
            delete runtime.keysDown[e.which];
        });

        // Initialise some jQuery DOM objects.
        var address = $('#address-hint');
        var project = $('#project-id');

        // Update the project ID field
        project.val(project_id);

        // Validate project ID field
        project.keyup(function()
        {
            // Initialize n for ue later
            var n = this.value;

            // Allow URL pasting
            var e = /projects\/(\d+)/.exec(n);

            // Check if URL was returned (null if invalid?)
            if (e)
            {
                n = this.value = e[1];
            }

            // Eventually, this will xhr to /projects/{{this.value}}/ and
            // change color based on whether the response is 404 or 200.
            $('#project-id, #address-hint').toggleClass('error', isNaN(n));
        });

        // Focus the actual input when the user clicks on the URL hint
        // When the address hint (ie. placeholder for the text box) is clicked, then select the text box underneath.
        address.click(function()
        {
            project.select();
        });

        // Define the width as the width of the placeholder address,
        // And set the CSS of the text box according to that width.
        var width = address.outerWidth();
        project.css(
        {
            paddingLeft: width,
            marginLeft: -width
        });

        // Go project button behavior
        $('#go-project').click(function()
        {
            // Add the "#<ProjectID>" to the end of the window location, and refresh.
            window.location = '#' + parseInt($('#project-id').val());
            window.location.reload(true);
        });

        // Green flag behavior
        $('#trigger-green-flag, #overlay').click(function()
        {
            // If the project hasn't been loaded, don't run.
            if (!runtime.projectLoaded) return;

            // Otherwise, hide the green flag and start the project.
            $('#overlay').css('display', 'none');
            runtime.greenFlag()
        });

        // Stop button behavior
        $('#trigger-stop').click(function()
        {
            runtime.stopAll();
        });

        // Canvas container mouse events -- modify the mouseDown variable as appropriate.
        $('#container').mousedown(function(e)
        {
            runtime.mouseDown = true;
            //e.preventDefault();
        });

        // Release mouse down flag on mouse up
        $('#container').mouseup(function(e)
        {
            runtime.mouseDown = false;
            //e.preventDefault();
        });

        // When the mouse is moved, change the mosue position
        $('#container').mousemove(function(e)
        {
            // Initialize calc variable
            var bb = this.getBoundingClientRect();

            // Find the absolute X,Y
            var absX = e.clientX - bb.left;
            var absY = e.clientY - bb.top;
            // -240, -y+180 (assuming) is to put in range -240..240, -180...180.

            // Set mouse pos as absolute x and y
            runtime.mousePos = [absX-240, -absY+180];
        });

        // Touch events - EXPERIMENTAL
        $(window).bind('touchstart', function(e)
        {
            // On iOS, we need to activate the Web Audio API
            // with an empty sound play on the first touch event.

            // If the audio isn't active, create a buffer and a source in order to activate it, and assign as appropriate.
            if (!iosAudioActive)
            {
                // Initialize variables
                var ibuffer = runtime.audioContext.createBuffer(1, 1, 22050);
                var isource = runtime.audioContext.createBufferSource();
                isource.buffer = ibuffer;

                // Connect the audio to the audioContext
                isource.connect(runtime.audioContext.destination);
                isource.noteOn(0);
                iosAudioActive = true;
            }
        });

        // Assign mouseDown as appropriate for touch events. Same functions as above.
        $('#container').bind('touchstart', function(e)
        {
            runtime.mouseDown = true;
            // Stop iOS scrolling.
            e.preventDefault();
        });

        // Set mouse down flag on touch ending
        $('#container').bind('touchend', function(e)
        {
            runtime.mouseDown = true;
            e.preventDefault();
        });

        // Same as mouse move
        $('#container').bind('touchmove', function(e)
        {
            // Initialize calc variable
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            var bb = this.getBoundingClientRect();

            // Find the absolute X,Y
            var absX = touch.clientX - bb.left;
            var absY = touch.clientY - bb.top;

            // Set mouse pos as absolute x and y
            runtime.mousePos = [absX-240, -absY+180];
        });

        // Border touch events - EXPERIMENTAL
        // Fire specific keyDown events on certain actions (aka do some shit on arrow key presses)
        $('#left').bind('touchstart touchmove', function(e) { runtime.keysDown[37] = true; runtime.startKeyHats(37); });
        $('#left').bind('touchend', function(e) { delete runtime.keysDown[37]; });
        $('#up').bind('touchstart touchmove', function(e) { runtime.keysDown[38] = true; runtime.startKeyHats(38); });
        $('#up').bind('touchend', function(e) { delete runtime.keysDown[38]; });
        $('#right').bind('touchstart touchmove', function(e) { runtime.keysDown[39] = true; runtime.startKeyHats(39); });
        $('#right').bind('touchend', function(e) { delete runtime.keysDown[39]; });
        $('#down').bind('touchstart touchmove', function(e) { runtime.keysDown[40] = true; runtime.startKeyHats(40); });
        $('#down').bind('touchend', function(e) { delete runtime.keysDown[40]; });
    },
    function(err)
    {
        // Called if there's a problem loading the project
        $("#player-container").css("display", "none");
        $("body").append("<h1>" + err.statusText + "</h1>");
    });
};

exports.showInstallMessage = function() {
    console.log("Showing install message...");
}

module.exports = Scratch;