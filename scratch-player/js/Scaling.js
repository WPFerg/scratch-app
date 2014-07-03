
'use strict';

// Add requires
var Sprite = require('./Sprite'),
    $ = require('jquery');


// Create empty global variables
window.OldWidthScalar = 1;

window.WidthScalar = function()
{

    // Calculate result
    var result = $("#container").width() / 480;

    // Return calculated value
    return result;

};

function PushAsjustmentToAllSprites()
{

    // Exit if runtime is not assigned
    if (typeof runtime == 'undefined')
    {
        // Display nothing updated method
        console.log('Runtime is not defined.');

    } else {

        // Iterate for every SpriteObject performing PassedFunction
        for (var i = runtime.sprites.length-1; i >= 0; i--)
        {
            // Create object shortcut
            var SpriteObject = runtime.sprites[i];

            // Make sure object is a sprite through constructor comparison
            if (typeof(SpriteObject) == 'object' && SpriteObject.constructor == Sprite)
            {

                // Get the sprite original bounds
                var OriginalLeft = SpriteObject.scratchX;
                var OriginalTop = SpriteObject.scratchY;

                // Check to make sure width is assigned
                if (typeof SpriteObject.SpriteWidth !== 'undefined')
                {

                    // Calculate new width
                    var newwidth = SpriteObject.SpriteWidth / window.OldWidthScalar;
                    SpriteObject.SpriteWidth = newwidth * window.WidthScalar();

                }

                //var OriginalWidth = 

                // // Apply to each item within the sprite stack
                // $.each(SpriteObject.stacks, function(index, stack)
                // {
                //     PassedFunction(stack, SpriteObject);
                // });
            }
        };

        // Message that sprites have been updated
        console.log('Finished updating sprites.');
    }

};

// Function to calculate dimensions
function AdjustPlayerDimensions()
{

    // Set old values for width and height scalars
    window.OldWidthScalar = $("#container").width() / 480;

    // Get the dimensions of the window
    var width = window.innerWidth;
    var height = window.innerHeight;

    $("canvas").height(height);7
    $("canvas").width(height * 1.33);

    // console.log('PPI: ' + document.getElementById('ppitest').offsetWidth);
    // console.log('Outer: ' + window.outerWidth + 'x' + window.outerHeight);
    // console.log('Inner: ' + window.innerWidth + 'x' + window.innerHeight);
    // console.log('Body: ' + $("body").width() + 'x' + $("body").height());
    // console.log('Screen: ' + screen.width + 'x' + screen.height)

    // Set default player width and height
    var PlayerWidth = 640;
    var PlayerHeight = 480 + 38;
    var AspectRatio = 640/480;

    // Make sure the width/height ratios are acceptable
    if (width / height > AspectRatio)
    {
        PlayerHeight = height-4;
        PlayerWidth = PlayerHeight * AspectRatio -4;
    } else {
        PlayerWidth = width-4;
        PlayerHeight = PlayerWidth / AspectRatio -4;
    }

    // Calculate size variables for components
    var HeaderWidth = PlayerWidth;
    var HeaderHeight = 38;
    var StageWidth = PlayerWidth;
    var StageHeight = PlayerHeight - HeaderHeight;

    //$('body').height(window.outerHeight);
    //$('body').paddingTop(window.outerHeight - PlayerHeight)
    var CurrentHeight = $('html').height();
    document.getElementsByTagName("body")[0].style.paddingTop = ((CurrentHeight - PlayerHeight) / 2).toString() + 'px';
    $('body').height(CurrentHeight - (CurrentHeight - PlayerHeight))

    // Set document element sizes
    $("#player-container").width(PlayerWidth);
    $("#player-container").height(PlayerHeight);
    $("#player-header").width(HeaderWidth);
    $("#player-header").height(HeaderHeight);
    $("#player-content").width(StageWidth);
    $("#player-content").height(StageHeight);
    $("#container").width(StageWidth);
    $("#container").height(StageHeight);
    $("#overlay").width(StageWidth);
    $("#overlay").height(StageHeight);

    // Process sprite scaling update
    PushAsjustmentToAllSprites();

};

// Link resize event
window.onresize = AdjustPlayerDimensions;

// Set dimensions of player
AdjustPlayerDimensions();

// Create orientation event
var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

// Add event and link to event method
window.addEventListener(orientationEvent, AdjustPlayerDimensions, false);
