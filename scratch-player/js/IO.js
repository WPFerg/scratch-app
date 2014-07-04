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
// IO.js
// Tim Mickel, March 2012

// IO handles JSON communication and processing.
// We make the sprites and threads here.

'use strict';

var Instr = require('../soundbank/Instr'),
    WAVFile = require('./sound/WAVFile'),
    SoundDecoder = require('./sound/SoundDecoder'),
    Stage = require('./Stage'),
    Sprite = require('./Sprite'),
    OffsetBuffer = require('./util/OffsetBuffer'),
    Reporter = require('./Reporter'),
    List = Reporter.List,
    $ = require('jquery');

// Constructor for IO object
var IO = function()
{

    // Reset data object
    this.data = null;

    // Setup paths for use later
    //this.base = 'proxy.php?resource=internalapi/';
    //this.base = 'http://scratch.mit.edu/internalapi/'; // Final base
    this.project_suffix = '/get/';
    this.asset_suffix = '/get/';
    this.soundbank_base = 'soundbank/';
    this.spriteLayerCount = 0;

    // In production, simply use the local path (no proxy)
    // since we won't be hampered by the same-origin policy.
    //
    // this.project_base = 'http://projects.scratch.mit.edu/internalapi/project/';
    // this.asset_base = 'http://cdn.scratch.mit.edu/internalapi/asset/';

    // -- SCOTT LOGIC [11:39 / 23_06_2014] --
    // 
    // Modify to use the proxy server as opposed to local paths to get scratch
    // working from other systems which are not local.
    // 

    // Modify paths to use proxy as opposed to local addresses
    this.project_base = '/projects/';
    this.asset_base = '/asset/';

};

// Load in a project, initialize it then start running it
IO.prototype.loadProject = function(project_id, successCallback, failureCallback)
{
    // Create more intuative var name
    var self = this;

    // Load in json code from passed data
    $.getJSON(this.project_base + project_id + this.project_suffix, function(data)
    {
        // Save get request data to var[data]
        self.data = data;

        // Call the success Callback to indicate the project is correct
        successCallback();

        // Initialize project
        self.makeObjects();
        self.loadThreads();
        self.loadNotesDrums();

        // Try to run the project
        runtime.loadStart();
    }).fail(function(error) {
        // If there's a problem, report back to the caller
        failureCallback(error);
    });
};

// Load in sound information but DO NOT play
IO.prototype.soundRequest = function(sound, sprite)
{
    // Create request object
    var request = new XMLHttpRequest();
    request.open('GET', this.asset_base + sound['md5'] + this.asset_suffix, true);
    request.responseType = 'arraybuffer';

    // Decode sound data on load
    request.onload = function()
    {
        // Temp var - not needed as can be plugged in instead?
        var waveData = request.response;

        // Decode the waveData and populate a buffer channel with the samples
        var snd = new SoundDecoder(waveData);
        var samples = snd.getAllSamples();

        //
        sound.buffer = runtime.audioContext.createBuffer(1, samples.length, runtime.audioContext.sampleRate);
        var data = sound.buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++)
        {
            data[i] = samples[i];
        };

        // Increment number of sounds
        sprite.soundsLoaded++;
    };

    // Execute request
    request.send();
};

//
IO.prototype.loadNotesDrums = function()
{
    // Create more intuative var name
    var self = this;

    // -
    $.each(Instr.wavs, function(name, file)
    {
        // Setup XML HTTP Request for iteration instance
        var request = new XMLHttpRequest();
        request.open('GET', self.soundbank_base + escape(file), true);
        request.responseType = 'arraybuffer';

        // Onload decode data
        request.onload = function()
        {
            var waveData = new OffsetBuffer(request.response);

            // Decode the waveData and populate a buffer channel with the samples
            var info = WAVFile.decode(request.response);
            waveData.offset = info.sampleDataStart;
            var soundBuffer = waveData.readBytes(2 * info.sampleCount);

            // Store sound for later use
            Instr.samples[name] = soundBuffer;
            Instr.wavsLoaded++;
        };

        // Execute request for instance
        request.send();
    });

};

// Create all sprite objects and sounds within a stage
IO.prototype.makeObjects = function()
{

    // Construct returning constructed object
    function createSprite(obj)
    {
        // Create sprite along with sounds
        var newSprite = new Sprite(obj);
        newSprite.loadSounds();

        // Return newly made object
        return newSprite;
    };

    // 
    function createReporter(obj, sprite)
    {
        // Declare variable to work on
        var newSprite;

        // Make sure listName is initialized as an object field
        if (obj.listName)
        { 
            // for local lists, only if in sprite -- SCRATCH
            if (!(sprite===runtime.stage && !runtime.stage.lists[obj.listName]))
            {
                newSprite = new List(obj, sprite.objName);
                runtime.reporters.push(newSprite);
            }
        } else {
            newSprite = new Reporter(obj);
            // If ther's a lable on the object, set that as the sprite's label
            if(obj.label)
            {
                newSprite.label = obj.label;
            }
            runtime.reporters.push(newSprite);
        }

        // Return newly made object
        return newSprite;
    }

    // Create the sprites andruntime.sprites[obj] watchers
    function createObj(obj, sprite)
    {
        // Declare working newsprite var
        var newSprite;

        // Check object field exists
        if (obj.objName)
        { 
            // Create sprite with duplicate reference
            newSprite = createSprite(obj);
            sprite = newSprite;
        } else {
            // Create sprite returning reporter
            newSprite = createReporter(obj, sprite);
        }

        // Make sure newsprite was made
        if (newSprite)
        {
            // Add newSprite to existing array
            runtime.sprites.push(newSprite);
            newSprite.attach(runtime.scene);
        }

    }

    // Create runtime stage with scene and sound
    runtime.stage = new Stage(this.data);
    runtime.stage.attach(runtime.scene);
    runtime.stage.attachPenLayer(runtime.scene);
    runtime.stage.loadSounds();

    // Create each child object in 'this.data.children'
    $.each(this.data.children, function(index, obj)
    {
        // create children of stage - sprites, watchers, and stage's lists -- SCRATCH
        createObj(obj, runtime.stage); 
    });

    // For each value within the filtered sub-set
    $.each(runtime.sprites.filter(function(sprite)
    {
        // Only return sprites and no other object
        return sprite instanceof Sprite

    }), function(index, sprite)
    { 
        // Create each sprite within the returned sprite list
        $.each(sprite.lists, function(index, list)
        {
            // create local lists -- SCRATCH
            createObj(list, sprite); 
        });
    });
};

//
IO.prototype.loadThreads = function()
{
    // Initialize variables
    var target = runtime.stage;
    var scripts = target.data.scripts;

    // Make sure scripts is assigned (by extension 'target.data.scripts')
    if (scripts)
    {
        // Add ?unknown? to stacks array
        for (var item in scripts)
        {
            target.stacks.push(interp.makeBlockList(scripts[item][2]));
        }
    }

    // -?- No idea of the meaning just yet -?-
    $.each(this.data.children, function(index, obj)
    {
        target = runtime.sprites[index];
        if (typeof(target) != 'undefined' && target.data && target.data.scripts)
        {
            $.each(target.data.scripts, function(j, s)
            {
                target.stacks.push(interp.makeBlockList(s[2]));
            });
        }
    });
};

// Returns the number sprite we are rendering used for initial layering assignment
IO.prototype.getCount = function()
{
    // Get the current count and increment by 1
    var rv = this.spriteLayerCount;
    this.spriteLayerCount++;

    // Return value
    return rv;
};

module.exports = IO;