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

'use strict';

var $ = require('jquery'),
    VarListPrims = require('./primitives/VarListPrims');

var Reporter = function(data)
{

    // Initialize variables
    this.cmd = data.cmd;
    this.color = data.color;
    this.isDiscrete = data.isDiscrete;
    this.mode = data.mode;
    this.param = data.param;
    this.sliderMin = data.sliderMin;
    this.sliderMax = data.sliderMax;
    this.target = data.target;
    this.visible = data.visible;
    this.x = data.x;
    this.y = data.y;
    this.z = io.getCount();

    //Set the label after hydrating the cmd and param variables
    this.label = this.determineReporterLabel();

    // Reset null values
    this.el = null; // jQuery Element for the outer box
    this.valueEl = null; // jQ element containing the reporter value
    this.slider = null; // slider jQ element
};

//  Generates the relevant text string to log in the console
Reporter.prototype.determineReporterLabel = function()
{
    // If thetarget is stage command is getVar then return the param, as getVar is a generic cmd.
    // If the target is stage and command isn't getVar, return the command
    // Otherwise, return the target and the params.
    if (this.target === 'Stage' && this.cmd === "getVar:") return this.param;
    if (this.target === 'Stage' && this.param === null) return this.cmd;
    return this.target + ': ' + this.param;
}

// Attaches the reporter to a scene.
Reporter.prototype.attach = function(scene)
{
    // Check to see which mode it is.
    switch (this.mode)
    {
        case 1: // Normal (or...)
        case 3: // Slider

            // Define the reporter element, and set its value to null
            this.el = $('<div class="reporter-normal">' + this.label + '</div>');
            this.valueEl = $('<div class="reporter-inset">null</div>');

            // Add the value to the reporter element
            this.el.append(this.valueEl);
            if (this.mode == 3)
            {
                // Slider-specific
                // Temporarily, set the value to sliderMin until an update
                this.slider = $('<input type="range" min="' + this.sliderMin +
                                '" max="' + this.sliderMax + '" step="1" value="' +
                                this.sliderMin + '" data-target="' + this.target +
                                '" data-var="' + this.param + '">');

                // Change the slider
                this.slider.change(this.changeSlider);

                // Add a linebreak and and the slider to the reporter element.
                this.el.append('<br>');
                this.el.append(this.slider);
            }
            break;
        case 2: // Large -- add a new class
            this.el = $('<div class="reporter-large">null</div>');
            this.valueEl = this.el;
            break;
    }

    // Add some positioning CSS to the reporter element.
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.el.css('z-index', this.z);

    // And some colour CSS.
    var cR = (this.color >> 16);
    var cG = (this.color >> 8 & 255);
    var cB = (this.color & 255);
    this.valueEl.css('background-color', 'rgb(' + cR + ',' + cG + ',' + cB + ')');

    // And if it should be displayed, set it accordingly
    this.el.css('display', this.visible ? 'inline-block' : 'none');

    // And add it to the scene.
    scene.append(this.el);
};

// Updates the reporter prototype.
Reporter.prototype.update = function()
{
    // Check to see if the reporter should be visible, Update accordingly
    this.el.css('display', this.visible ? 'inline-block' : 'none');

    // If it's not visible any more, then stop.
    if (!this.visible) return;

    // Create an empty new value to keep the new value of the reporter
    var newValue = '';

    // Set the target defined by the sprite name of the target.
    var target = runtime.spriteNamed(this.target);

    // Find the relevant command, and append the relevant value based off of that. 
    switch (this.cmd)
    {
        case 'answer':
            newValue = target.askAnswer;
            break;
        case 'getVar:':
            newValue = target.variables[this.param];
            break;
        case 'xpos':
            newValue = target.scratchX;
            break;
        case 'ypos':
            newValue = target.scratchY;
            break;
        case 'heading':
            newValue = target.direction;
            break;
        case 'scale':
            newValue = target.getSize();
            break;
        case 'sceneName':
            // Return the costume name of that costume
            newValue = runtime.stage.costumes[runtime.stage.currentCostumeIndex].costumeName;
            break;
        case 'costumeIndex':
            newValue = target.currentCostumeIndex + 1;
            break;
        case 'timer':
            newValue = '' + Math.round(interp.primitiveTable.timer() * 10) / 10;
            break;
    }

    // If the new value is a number and is large enough, round it.
    if (typeof newValue === 'number' && Math.abs(newValue) > 0.001)
    {
        newValue = Math.round(newValue * 1000) / 1000;
    }

    // Convert newValue to string if it isn't already
    newValue = '' + newValue;

    // Set the value of the reporter
    this.valueEl.html(newValue);

    // If the mode is slider-specific, then set the slider value to that.
    if (this.mode == 3)
    {
        this.slider.val(Number(newValue));
    }
};

// Update the layer with the pre-defined z-index
Reporter.prototype.updateLayer = function()
{
    this.el.css('z-index', this.z);
};

// Change the value of the slider
Reporter.prototype.changeSlider = function()
{
    // Convert the value requested to a number.
    var newValue = Number($(this).val());

    // Set the target to be the sprite defined in the data-target attribute
    var target = runtime.spriteNamed($(this).attr('data-target'));

    // And the relevant value from data-var
    var variable = $(this).attr('data-var');

    // And set the variable to be the value defined.
    target.variables[variable] = newValue;
};

// Creates a list based off of data and a sprite.
var List = function(data, sprite)
{
    // Define the contents and name of the list
    this.contents = data.contents;
    this.listName = data.listName;

    // And the size and position (what?)
    this.height = data.height;
    this.width = data.width;
    this.x = data.x;
    this.y = data.y;
    this.z = io.getCount();         // Increases the amount of sprite layers by one
    this.visible = data.visible;    // Sets its visibility

    // And set the target of the sprite.
    this.target = sprite;

    // this.isPersistent = data.isPersistent;

    // Set the list element, the container element and the scrollbar to null, so they shouldn't appear
    this.el = null;             // jQuery element for list
    this.containerEl = null; 
    this.scrollbar = null;
};

// Attach the scene to a lsit
List.prototype.attach = function(scene)
{
    // Define the list element
    this.el = $('<div class="list">');

    // Give it a value, if the target's a stage, then don't add the target, otherwise do. Also add the name of the list.
    this.el.append('<div class="list-title">' + (this.target==='Stage'?'':this.target + ' ') + this.listName);

    // The container. Append it to the list element, setting the containers width and height to be smaller than the list element itself.
    var c = this.containerEl = $('<div style="overflow:hidden;float:left;position:relative">').appendTo(this.el).width(this.width-13).height(this.height-34);

    // Add the scrollbar to the list element
    var s = this.scrollbar = $('<div class="list-scrollbar-container"><div class="list-scrollbar">').appendTo(this.el);

    // And find all the children of the scrollbar with CSS params 
    var sb = s.children('.list-scrollbar');

    // When the scrollbar is clicked, set the data as scroll, and the start position as the current position
    sb.mousedown(function(e)
    {
        if (e.which===1) $(this).data({scrolling:true,startY:e.pageY}); // left button
    });

    // When the mouse is moved
    $('body').mousemove(function(e)
    {
        // and the scrollbar is scrolling
        if (sb.data('scrolling'))
        {
            // Move the scrollbar appropriately
            var offset = parseInt(sb.css('top'))+e.pageY-sb.data('startY');

            // If there's a n egative offset, don't allow -- set to 0
            if (offset < 0)
            {
                offset = 0;
            }

            // If the offset is greater than the container height - the scrollbar height (ie. offset more than ti should be)
            // set it to the maximum it should be
            if (offset > c.height()-sb.height())
            {
                offset = c.height()-sb.height();
            }

            // Update the offset as possible
            sb.css('top',offset);

            // Set the container's scroll top to be the ratio of heights times the offset
            // ie I dunno
            c.scrollTop(c.height()/sb.height()*offset);
        }
    }).mouseup(function()
    {
        // If it's been scrolling, remove it.
        if ($.hasData(sb[0],'scrolling')) sb.removeData(['scrolling','startY']);
    });

    // this.el.append('<div class="list-add">+'); // disabled because it doesn't do anything even in the original

    // Append information about the list to the element.
    this.el.append('<div class="list-length">length: '+this.contents.length);

    // Add the element to the scene, and update the list
    scene.append(this.el);
    this.update();

    // Position and size the element as appropriate
    this.el.css('left', this.x);
    this.el.css('top', this.y);
    this.el.width(this.width);
    this.el.height(this.height);
    this.el.css('z-index', this.z);

    // Hide and show as appropriate.
    this.el.css('display', this.visible ? 'inline-block' : 'none');
};

// Updating the list.
List.prototype.update = function()
{
    // Set the contents to be the listsprite target with the list name listName
    // -?- (assuming this is what findList does) -?-
    //this.contents = findList(runtime.spriteNamed(this.target), this.listName);
    this.contents = VarListPrims.findList(runtime.spriteNamed(this.target),this.listName);

    // Set the CSS to visible as appropriate. If it's not visible then return.
    this.el.css('display', this.visible ? 'inline-block' : 'none');
    if (!this.visible) return;

    // For each element in the list, append it to the container element with index i and value val.
    var c = this.containerEl.html(''); // so that it can be used inside the forEach
    this.contents.forEach(function(val,i)
    {
        $('<div style="clear:both">').appendTo(c).append('<div class="list-index">'+(i+1),'<div class="list-item">'+val);
    });

    // For all the objects with class list-index that're a child of c, set its width to the last listIndex's width
    // ie. so all list indices are the same size so they appear in a uniform way. The last one will have the highest width
    c.find('.list-index').width(c.find('.list-index').last().width());

    // Set each list item to have the width of the container, less the size of the indices and some padding, to give extra space
    // for good layout. If not using the list index width, then the items would not appear in a pleasing way with the indices.
    c.find('.list-item').width(c.width()-c.find('.list-index').width()-15);

    // Set the scrollbar height to the container height initially
    var s = this.scrollbar.height(c.height());

    // Set the list scrollbar height to be the correct scroll height. Set it to be visible if the height of the scrollbar and the container don't match.
    s.children('.list-scrollbar').height(s.height()/c[0].scrollHeight*s.height()).css('display', s.children('.list-scrollbar').height()===c.height() ? 'none' : 'inline-block');
    
    // Find the list length element, and set its text to be the length.
    this.el.find('.list-length').text('length: '+this.contents.length);
};

// Update the z-balue of the list layer.
List.prototype.updateLayer = function()
{
    this.el.css('z-index', this.z);
};

module.exports = Reporter;
module.exports.List = List;