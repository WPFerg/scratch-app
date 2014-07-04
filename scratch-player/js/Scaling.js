
'use strict';

// Add requires
var Sprite = require('./Sprite'),
    $ = require('jquery');


// Create empty global variables
window.OldScalar = 1;
window.SettingUp = true;

// Method to calculate the amount for which values need to be scaled by
window.Scalar = function()
{

    // Calculate result
    var result = 1;
    if (window.SettingUp !== true) { result = $("#container").width() / 480; } 

    // Return calculated value
    return result;

};

// Method to calculate an equivalent scaled value
window.ScaleEquiv = function(InValue)
{

    // Return calculated answer
    return InValue * window.Scalar();

};

// Method to check if landscape
window.IsLandscape = function()
{
    // Set default result
    var result = true;

    // Get screen height and width
    var width = screen.width;
    var height = screen.height;

    // Make sure not buggy version of android
    if (uagent == "android 10")
    {
        height = screen.width;
        width = screen.height;
    }

    // Return checked result
    return (width > height);
};

// Method to check if portrait
window.IsPortrait = function()
{
    return (window.IsLandscape == false);
}

// Method for adjusting all sprites for the screen
function PushAsjustmentToAllSprites()
{

    // Quick function to calculate new scaled value
    function CalcNewScaleValue(InValue)
    {
        var newwidth = InValue / window.OldScalar;
        var result = newwidth * window.Scalar();
        return result;
    }

    // Exit if runtime is not assigned
    if (typeof runtime == 'undefined')
    {
        // Display nothing updated method
        console.log('Runtime is not defined.');

    } else {

        // Manage runtime stage
        if (typeof runtime.stage !== 'undefined')
        {
            // Update bounds
            $(runtime.stage.textures[0]).width(CalcNewScaleValue($(runtime.stage.textures[0]).width()));
            $(runtime.stage.textures[0]).height(CalcNewScaleValue($(runtime.stage.textures[0]).height()));
            // runtime.stage.textures[0].updateTransform();

            // Debug line
            //console.log($(runtime.stage.textures[0]).width() + 'x' + $(runtime.stage.textures[0]).height());
        }

        // Iterate for every sprite loading in any sprites which have failed to load [start loading after 50ms]
        for (var obj = 0; obj < runtime.sprites.length; obj++)
        {
            if (typeof(runtime.sprites[obj]) == 'object' && runtime.sprites[obj].constructor == Sprite)
            {
                if (runtime.sprites[obj].isLoaded())
                {

                    // Create shortcut
                    var SpriteObject = runtime.sprites[obj];

                    // Get the sprite original bounds
                    var OriginalLeft = SpriteObject.scratchX;
                    var OriginalTop = SpriteObject.scratchY;

                    // Check to make sure width is assigned
                    if (typeof SpriteObject.SpriteWidth !== 'undefined')
                    {

                        // Calculate new width and height
                        SpriteObject.SpriteWidth = CalcNewScaleValue(SpriteObject.SpriteWidth);
                        SpriteObject.SpriteHeight = CalcNewScaleValue(SpriteObject.SpriteWidth);

                        // Debug line
                        //console.log('Calculated: ' + OriginalWidth + ' > ' + SpriteObject.SpriteWidth);

                        for (var Item in runtime.sprites[obj].costumes)
                        {
                            // Create shortcut variable
                            var IMGTag = runtime.sprites[obj].textures[Item];
                            var bounds = IMGTag.getBoundingClientRect();

                            //console.log(bounds.top + ' ' + bounds.left);

                            var origtop = bounds.top;
                            var origleft = bounds.left;

                            // Calculate new scale values
                            bounds.top = CalcNewScaleValue(bounds.top);
                            bounds.left = CalcNewScaleValue(bounds.left);

                            var newtop = bounds.top;
                            var newleft = bounds.left;

                            // Call sprite update method
                            SpriteObject.updateTransform();

                            // Set IMGTag bounds
                            $(IMGTag).width(SpriteObject.SpriteWidth);
                            $(IMGTag).height(SpriteObject.SpriteHeight);
                        }

                    }

                }
            }
        };

        // Message that sprites have been updated
        //console.log('Finished updating sprites.');
    }

};

// Function to calculate dimensions
function AdjustPlayerDimensions()
{

    // Set old values for width and height scalars
    window.OldScalar = $("#container").width() / 480;

    // Get the dimensions of the window
    var width = window.innerWidth;
    var height = window.innerHeight;

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
    var HeaderHeight = 0; //38;
    var StageWidth = PlayerWidth;
    var StageHeight = PlayerHeight - HeaderHeight;

    //$('body').height(window.outerHeight);
    //$('body').paddingTop(window.outerHeight - PlayerHeight)
    var CurrentHeight = $('html').height();
    document.getElementsByTagName("body")[0].style.paddingTop = ((CurrentHeight - PlayerHeight) / 2).toString() + 'px';
    $('body').height(CurrentHeight - (CurrentHeight - PlayerHeight))

    // Set document element sizes
    $("canvas").height(PlayerHeight);
    $("canvas").width(PlayerWidth);
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

    // Mark setup as complete
    window.SettingUp = false;

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