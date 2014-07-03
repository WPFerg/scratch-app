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
// Stage.js
// Tim Mickel, July 2011 - March 2012

// Provides the basic logic for the Stage, a special kind of Sprite.

'use strict';

var Sprite = require('./Sprite'),
    $ = require('jquery');

var Stage = function(data)
{

    // Set default width and height of player
    this.PlayerWidth = $("#container").width();
    this.PlayerHeight = $("#container").height();
    //this.PlayerWidth = document.getElementById('player-container').attr('width');
    //this.PlayerHeight = document.getElementById('player-container').attr('height');

    // Place the background layer in the very back.
    // The pen layer is right above the stage background,
    // and all sprites are above that.
    this.z = -2;

    // Pen layer and canvas cache.
    this.penLayerLoaded = false;

    // Create a canvas and specify width and height.
    this.lineCanvas = document.createElement('canvas');
    this.lineCanvas.width = this.PlayerWidth;
    this.lineCanvas.height = this.PlayerHeight;

    // Get a context of the line canvas, set it as stage and call Sprite.
    this.lineCache = this.lineCanvas.getContext('2d');
    this.isStage = true;
    this.askAnswer = ""; // this is a private variable and should be blank -- SCRATCH

    Sprite.call(this, data);
};

//No idea what these do, but okay.

// Create a sprite prototype
Stage.prototype = Object.create(Sprite.prototype);

// Set the prototype constructor to stage
Stage.prototype.constructor = Stage;

// Attach a pen layer to the scene
Stage.prototype.attachPenLayer = function(scene)
{
    // If the scene's already got a pen layer, then don't do anything.
    if (this.penLayerLoaded) return;

    // Otherwise, set the layer as loaded, and put it behind everything.
    this.penLayerLoaded = true;
    $(this.lineCanvas).css('position', 'absolute');
    $(this.lineCanvas).css('z-index', '-1');

    // Add it to the scene.
    scene.append(this.lineCanvas);
};

// Check to see if the scene is loaded, by checking the pen layer, costumes and sounds
Stage.prototype.isLoaded = function()
{
    return this.penLayerLoaded && this.costumesLoaded == this.costumes.length && this.soundsLoaded == Object.keys(this.sounds).length;
};

// Pen functions
// Clear the pen strokes by rendering a rectangle
Stage.prototype.clearPenStrokes = function()
{
    this.lineCache.clearRect(0, 0, this.PlayerWidth, this.PlayerHeight);
};

// Add a stroke to the canvas.
Stage.prototype.stroke = function(from, to, width, color)
{

    // Define width, set the line to be rounded (ends are semicircular)
    this.lineCache.lineWidth = width;
    this.lineCache.lineCap = 'round';

    // Start the path
    this.lineCache.beginPath();

    // Use .5 offsets for canvas rigid pixel drawing -- ie. draws on complete pixel
    // Move to the start position
    this.lineCache.moveTo(from[0] + 240.5, 180.5 - from[1]);

    // To the end position
    this.lineCache.lineTo(to[0] + 240.5, 180.5 - to[1]);

    // With the colour
    this.lineCache.strokeStyle = 'rgb(' + (color >> 16) + ',' + (color >> 8 & 255) + ',' + (color & 255) + ')';
    
    // Render
    this.lineCache.stroke();
};

module.exports = Stage;