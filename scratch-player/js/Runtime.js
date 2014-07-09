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
// Runtime.js
// Tim Mickel, July 2011

// Runtime takes care of the rendering and stepping logic.

'use strict';

var Thread = require('./Interpreter').Thread,
    SoundPrims = require('./primitives/SoundPrims'),
    Instr = require('../soundbank/Instr'),
    Sprite = require('./Sprite'),
    Timer = require('./util/Timer'),
    $ = require('jquery');

// Create local timer
var t = new Timer();

// Declare runtime constructor
var Runtime = function()
{
    // Initialize values to default blanks (empty/null/false)
    this.scene = null;
    this.sprites = [];
    this.reporters = [];
    this.keysDown = {};
    this.mouseDown = false;
    this.mousePos = [0, 0];
    this.audioContext = null;
    this.audioGain = null;
    this.audioPlaying = [];
    this.notesPlaying = [];
    this.projectLoaded = false;
};

// Initializer for the drawing and audio contexts.
Runtime.prototype.init = function()
{
    // Set scene value to that of id container
    this.scene = $('#container');

    // If audio is not defined (still null) try the second case assignment
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // Create object field audio context
    this.audioContext = new AudioContext();

    // -?- Dont know -?-
    try
    {
        this.audioGain = this.audioContext.createGain();
    } catch(err) {
        this.audioGain = this.audioContext.createGainNode();
    }

    // -?- Dont know (establishing a connection for audio) -?-
    this.audioGain.connect(runtime.audioContext.destination);
};

// Load start waits for the stage and the sprites to be loaded, without
// hanging the browser.  When the loading is finished, we begin the step
// and animate methods.
Runtime.prototype.loadStart = function()
{
    // Detemine if app is not loaded
    if (!runtime.stage.isLoaded())
    {
        // Reload stage [start loading after 50ms]
        setTimeout(function(runtime) { runtime.loadStart(); }, 50, this);
        return;
    }

    // Iterate for every sprite loading in any sprites which have failed to load [start loading after 50ms]
    for (var obj = 0; obj < runtime.sprites.length; obj++)
    {
        if (typeof(runtime.sprites[obj]) == 'object' && runtime.sprites[obj].constructor == Sprite)
        {
            if (!runtime.sprites[obj].isLoaded())
            {
                setTimeout(function(runtime) { runtime.loadStart(); }, 50, this);
                return;
            }
        }
    }

    // Make sure all wavefront format audio files are loaded [start loading after 50ms]

    if (Instr.wavsLoaded != Instr.wavCount)
    {
        setTimeout(function(runtime) { runtime.loadStart(); }, 50, this);
        return;
    }

    console.log("Wavs loaded");

    // Set finalization values
    setInterval(this.step, 33);
    this.projectLoaded = true;
};

// -?- Terrible name for a function pointer as it has no descriptive quality -?-
Runtime.prototype.greenFlag = function()
{
    // Verify project is loaded
    if (this.projectLoaded)
    {
        // Create thread to being program
        interp.activeThread = new Thread(null);
        interp.threads = [];
        interp.primitiveTable.timerReset();
        this.startGreenFlags();
    }
};

// Stop the execution of the project
Runtime.prototype.stopAll = function()
{
    // Free all threads and sounds
    interp.activeThread = new Thread(null);
    interp.threads = [];
    //stopAllSounds();
    SoundPrims.stopAllSounds();

    // Hide sprite bubbles, resetFilters and doAsk prompts
    for (var s = 0; s < runtime.sprites.length; s++)
    {
        if (runtime.sprites[s].hideBubble) runtime.sprites[s].hideBubble();
        if (runtime.sprites[s].resetFilters) runtime.sprites[s].resetFilters();
        if (runtime.sprites[s].hideAsk) runtime.sprites[s].hideAsk();
    }

    // Reset graphic effects
    runtime.stage.resetFilters();
};

// Step method for execution - called every 33 milliseconds (1/30th of a second for smooth playback)
Runtime.prototype.step = function()
{
    // Increment project state
    interp.stepThreads();

    // Update all reporters
    for (var r = 0; r < runtime.reporters.length; r++)
    {
        runtime.reporters[r].update();
    }
};

// Stack functions -- push and remove stacks to be run by the interpreter as threads. -- SCRATCH
Runtime.prototype.allStacksDo = function(PassedFunction)
{
    // Initialize values
    var stage = runtime.stage;

    // -- SCOTT LOGIC [14:53 / 23_06_2014] --
    // 
    // Stack variable declared but only ever used within functions which
    // declare it as a parameter anyway, no need to have it here at all
    //
    // var stack;
    //

    // Iterate for every SpriteObject performing PassedFunction
    for (var i = runtime.sprites.length-1; i >= 0; i--)
    {
        // Create object shortcut
        var SpriteObject = runtime.sprites[i];

        // Make sure object is a sprite through constructor comparison
        if (typeof(SpriteObject) == 'object' && SpriteObject.constructor == Sprite)
        {
            // Apply to each item within the sprite stack
            $.each(SpriteObject.stacks, function(index, stack)
            {
                PassedFunction(stack, SpriteObject);
            });
        }
    }

    // 
    $.each(stage.stacks, function(index, stack)
    {
        PassedFunction(stack, stage);
    });
};

// Hat triggers
Runtime.prototype.startGreenFlags = function()
{

    // Trigger all green flags
    function startIfGreenFlag(stack, target)
    {
        if (stack.op == 'whenGreenFlag') interp.toggleThread(stack, target);
    }

    // Initiate function on stack
    this.allStacksDo(startIfGreenFlag);
};

// 
Runtime.prototype.startKeyHats = function(ch)
{
    // Reset keyname
    var keyName = null;

    // Take lowercase letters
    if (('A'.charCodeAt(0) <= ch) && (ch <= 'Z'.charCodeAt(0)) ||
        ('a'.charCodeAt(0) <= ch) && (ch <= 'z'.charCodeAt(0)))
        keyName = String.fromCharCode(ch).toLowerCase();

    // Take numbers
    if (('0'.charCodeAt(0) <= ch) && (ch <= '9'.charCodeAt(0)))
        keyName = String.fromCharCode(ch);

    // Manage arrows and spaces (movement?)
    if (ch == 37) keyName = "left arrow";
    if (ch == 39) keyName = "right arrow";
    if (ch == 38) keyName = "up arrow";
    if (ch == 40) keyName = "down arrow";
    if (ch == 32) keyName = "space";

    // Break if no keyname assigned
    if (keyName == null) return;

    // Taking the parameter execute all keypressed events which apply
    var startMatchingKeyHats = function(stack, target)
    {
        // Match keypressed event with correct keyname
        if ((stack.op == "whenKeyPressed") && (stack.args[0] == keyName))
        {
            // Only start the stack if it is not already running
            if (!interp.isRunning(stack))
            {
                interp.toggleThread(stack, target);
            }
        }
    }

    // Initiate above function
    runtime.allStacksDo(startMatchingKeyHats);
};

// Initiate all click events
Runtime.prototype.startClickedHats = function(sprite)
{

    // Initiate functions where OnClick is an event
    function startIfClicked(stack, target)
    {
        if (target == sprite && stack.op == "whenClicked" && !interp.isRunning(stack))
        {
            interp.toggleThread(stack, target);
        }
    }

    // Intiate above function on stack
    runtime.allStacksDo(startIfClicked);
};

// Returns true if a key is pressed.
Runtime.prototype.keyIsDown = function(ch)
{
    return this.keysDown[ch] || false;
};

// Sprite named -- returns one of the sprites on the stage.
Runtime.prototype.spriteNamed = function(n)
{
    // Get sprites from name
    if (n == 'Stage') return this.stage;

    // Set default result
    var selected_sprite = null;

    // Find matching object name in sprites
    $.each(this.sprites, function(index, s)
    {
        if (s.objName == n) {
            selected_sprite = s;
            return false;
        }
    });

    // Return calcualted result
    return selected_sprite;
};

// Calculate and return the time in a readable string format
Runtime.prototype.getTimeString = function(which)
{
    // Return local time properties
    var now = new Date();

    // Determine formate to return
    switch (which)
    {
        case 'hour': return now.getHours();
        case 'minute': return now.getMinutes();
        case 'second': return now.getSeconds();
        case 'year': return now.getFullYear(); // four digit year (e.g. 2012)
        case 'month': return now.getMonth() + 1; // 1-12
        case 'date': return now.getDate(); // 1-31
        case 'day of week': return now.getDay() + 1; // 1-7, where 1 is Sunday
    }

    // Return erroneous value (prevents breaking by caller) - SHOULDNT HAPPEN
    return ''; 
};

// Reassigns z-indices for layer functions
Runtime.prototype.reassignZ = function(target, move)
{
    // Initialize variables
    var sprites = this.sprites;
    var oldIndex = -1;

    // Iterate over sprite images splicing based on index (make index 0 sprite to be shown)
    $.each(this.sprites, function(index, sprite)
    {
        if (sprite == target) {
            // Splice out the sprite from its old position
            oldIndex = index;
            sprites.splice(index, 1);
        }
    });

    // 
    if (move == null)
    {
        // Move to the front
        this.sprites.splice(this.sprites.length, 0, target);
    } else if (oldIndex - move >= 0 && oldIndex - move < this.sprites.length + 1) {
        // Move to the new position
        this.sprites.splice(oldIndex - move, 0, target);
    } else {
        // No change is required
        this.sprites.splice(oldIndex, 0, target);
    }

    // Renumber the z-indices
    var newZ = 1;

    // Shift to next zindex image in the sprite
    $.each(this.sprites, function(index, sprite)
    {
        sprite.z = newZ;
        sprite.updateLayer();
        newZ++;
    });
};

module.exports = Runtime;