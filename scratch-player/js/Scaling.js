
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
    if (window.SettingUp !== true) { result = $("#player-container").width() / 480; } 

    // Return calculated value
    return result;

};

// Method to calculate an equivalent scaled value
window.ScaleEquiv = function(InValue)
{

    // Return calculated answer
    return InValue * window.Scalar();

};

// Method to calculate an equivalent scaled rectangle
window.ScaleRectEquiv = function(InRect)
{

    // Calculate each position of the rectangle
    InRect.left = window.ScaleEquiv(InRect.left);
    InRect.left = window.ScaleEquiv(InRect.right);
    InRect.left = window.ScaleEquiv(InRect.top);
    InRect.left = window.ScaleEquiv(InRect.bottom);

    // Return calculated difference
    return InRect;

}

// Method to check if landscape
window.IsLandscape = function()
{
    // Set default result
    var result = true;

    // Get screen height and width
    var width = screen.width;
    var height = screen.height;

    // Make sure not buggy version of android
    // if (uagent == "android 10")
    // {
    //     height = screen.width;
    //     width = screen.height;
    // }

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
            for(var texId in runtime.stage.textures)
            {
                var texture = runtime.stage.textures[texId];
                $(texture).width(CalcNewScaleValue($(texture).width()));
                //$(texture).height(CalcNewScaleValue($(texture).height()));
            }
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

                    // // Get the sprite original bounds
                    // var OriginalLeft = SpriteObject.scratchX;
                    // var OriginalTop = SpriteObject.scratchY;
                    // SpriteObject.scratchX = CalcNewScaleValue(OriginalLeft); 
                    // SpriteObject.scratchY = CalcNewScaleValue(OriginalTop); 

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

// Position buttons correctly based on orientation
function PositionButtons()
{

    // Declare variables
    var GButton = $('#trigger-green-flag');
    var SButton = $('#trigger-stop');

    var GCalcLeft = 0;
    var SCalcLeft = 0;
    var GCalcTop = 0;
    var SCalcTop = 0;

    // Calculate position of buttons on screen 
    if (window.IsLandscape())
    {

        // Size buttons appropriately
        GButton.width(window.innerWidth / 100 * 6);

        // Set default positions
        GCalcLeft = window.innerWidth - GButton.width() - 10;
        SCalcLeft = window.innerWidth - GButton.width() - 10;
        GCalcTop = 10;
        SCalcTop = GCalcTop + GButton.width() + 10;

        // Create temp hold for suggested value
        var ProposedLeft = window.innerWidth - parseInt($("#player-container").css('marginRight')) + 10;

        // Determine if there is enough space to apply suggestion
        if (ProposedLeft + GButton.width() < window.innerWidth)
        {
            GCalcLeft = ProposedLeft;
            SCalcLeft = ProposedLeft;
        }
        
    } else {

        // Size buttons appropriately
        GButton.width(window.innerHeight / 100 * 6);

        // Set default positions
        SCalcLeft = window.innerWidth - GButton.width() - 10;
        GCalcLeft = SCalcLeft - GButton.width() - 10;
        GCalcTop = 10;
        SCalcTop = GCalcTop;

        // Create temp hold for suggested value
        var ProposedTop = parseInt($('body').css('paddingTop')) - GButton.width() - 10;
        console.log($('body').css('paddingTop'));

        // Set top values to just above player
        if (ProposedTop > 0)
        {
            GCalcTop = ProposedTop;
            SCalcTop = ProposedTop;
        }

    }

    // Sync up button dimensions
    GButton.height(GButton.width());
    SButton.width(GButton.width());
    SButton.height(GButton.width());

    // Apply positions to elements
    GButton.css('left', GCalcLeft.toString() + 'px');
    GButton.css('top', GCalcTop.toString() + 'px');
    SButton.css('left', SCalcLeft.toString() + 'px');
    SButton.css('top', SCalcTop.toString() + 'px');

};

// Function to calculate dimensions
function AdjustPlayerDimensions()
{

    // Set old values for width and height scalars
    window.OldScalar = $("#player-container").width() / 480;

    // Get the dimensions of the window
    var width = window.innerWidth;
    var height = window.innerHeight;

    // Debug code
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

    // Re-pad the body to vertically align the player
    var CurrentHeight = $('html').height();
    document.getElementsByTagName("body")[0].style.paddingTop = ((CurrentHeight - PlayerHeight) / 2).toString() + 'px';
    $('body').height(CurrentHeight - (CurrentHeight - PlayerHeight));

    // Set document element sizes
    $("canvas").height(PlayerHeight);
    $("canvas").width(PlayerWidth);
    $("#player-container").width(PlayerWidth);
    $("#player-container").height(PlayerHeight);
    $("#container").width(PlayerWidth);
    $("#container").height(PlayerHeight);
    $("#overlay").width(PlayerWidth);
    $("#overlay").height(PlayerHeight);

    // Process sprite scaling update
    PushAsjustmentToAllSprites();

    // Position buttons on form
    PositionButtons();

    // Mark setup as complete
    window.SettingUp = false;

    window.scaledWidth = $('#player-container').width();
    window.scaledHalfWidth = $('#player-container').width() / 2;
    window.scaledHeight = $('#player-container').height();
    window.scaledHalfHeight = $('#player-container').height() / 2;

};

// Set dimensions of player
AdjustPlayerDimensions();

// Link resize event
window.onresize = AdjustPlayerDimensions;

// Create orientation event variables
var supportsOrientationChange = "onorientationchange" in window;
var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

// Add event and link to event method
window.addEventListener(orientationEvent, AdjustPlayerDimensions, false);
