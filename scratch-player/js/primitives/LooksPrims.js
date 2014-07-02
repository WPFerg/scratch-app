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

var LooksPrims = function()
{
    // Create empty primitive table object
    this.primTable = {};

    this.primTable['show']               = this.primShow;
    this.primTable['hide']               = this.primHide;

    this.primTable['nextCostume']        = this.primNextCostume;
    this.primTable['lookLike:']          = this.primShowCostume;
    this.primTable['costumeIndex']       = this.primCostumeNum;

    this.primTable['nextScene']     = this.primNextCostume;
    this.primTable['showBackground:']    = this.primShowCostume;
    this.primTable['backgroundIndex']    = this.primCostumeNum;

    this.primTable['startScene']         = this.primStartScene;
    this.primTable['backgroundIndex']    = this.primCostumeNum;

    this.primTable['changeSizeBy:']      = this.primChangeSize;
    this.primTable['setSizeTo:']         = this.primSetSize;
    this.primTable['scale']              = this.primSize;

    this.primTable['comeToFront']        = this.primGoFront;
    this.primTable['goBackByLayers:']    = this.primGoBack;

    this.primTable['changeGraphicEffect:by:'] = this.primChangeEffect;
    this.primTable['setGraphicEffect:to:']    = this.primSetEffect;
    this.primTable['filterReset']             = this.primClearEffects;

<<<<<<< HEAD
    this.primTable['say:'] = function(b) { showBubble(b, 'say'); };
    this.primTable['say:duration:elapsed:from:'] = function(b) { showBubbleAndWait(b, 'say'); };
    this.primTable['think:'] = function(b) { showBubble(b, 'think'); };
    this.primTable['think:duration:elapsed:from:'] = function(b) { showBubbleAndWait(b, 'think'); };
=======
    //primTable['say:'] = function(b) { showBubble(b, 'say'); };
    //primTable['say:duration:elapsed:from:'] = function(b) { showBubbleAndWait(b, 'say'); };
    //primTable['think:'] = function(b) { showBubble(b, 'think'); };
    //primTable['think:duration:elapsed:from:'] = function(b) { showBubbleAndWait(b, 'think'); };

    primTable['say:'] = this.showBubble.bind(this, 'say');
    primTable['say:duration:elapsed:from:'] = this.showBubbleAndWait.bind(this, 'say');
    primTable['think:'] = this.showBubble.bind(this, 'think');
    primTable['think:duration:elapsed:from:'] = this.showBubbleAndWait.bind(this, 'think');

>>>>>>> e70444d1da6225bc976db6500d1db96d4ee1876c
};

LooksPrims.prototype.primShow = function(b) {
    interp.targetSprite().setVisible(true);
    interp.redraw();
};

LooksPrims.prototype.primHide = function(b) {
    interp.targetSprite().setVisible(false);
    interp.redraw();
};

LooksPrims.prototype.primNextCostume = function(b) {
    interp.targetSprite().showCostume(interp.targetSprite().currentCostumeIndex + 1);
    interp.redraw();
};

LooksPrims.prototype.primShowCostume = function(b) {
    var s = interp.targetSprite();
    if (s == null) return;
    var arg = interp.arg(b, 0);
    if (typeof(arg) == 'number') {
        s.showCostume(arg - 1);
    } else {
        if ((arg == 'CAMERA') || (arg == 'CAMERA - MIRROR')) {
            s.showCostumeNamed(arg);
            return;
        }
        var i = s.indexOfCostumeNamed(arg);
        if (i >= 0) {
            s.showCostume(i);
        } else {
            var n = parseInt(arg, 10);
            if (n === n) { // if n is not NaN
                s.showCostume(n - 1);
            } else {
                return;  // arg did not match a costume name nor is a valid number
            }
        }
    }
    if (s.visible) interp.redraw();
};

LooksPrims.prototype.primStartScene = function(b) {
    var s = runtime.stage;
    var arg = interp.arg(b, 0);
    if (typeof(arg) == 'number') {
        s.showCostume(arg - 1);
    } else {
        if ((arg == 'CAMERA') || (arg == 'CAMERA - MIRROR')) {
            s.showCostumeNamed(arg);
            return;
        }
        var i = s.indexOfCostumeNamed(arg);
        if (i >= 0) {
            s.showCostume(i);
        } else {
            var n = parseInt(arg, 10);
            if (n === n) { // fast !isNaN check
                s.showCostume(n - 1);
            } else {
                return;  // arg did not match a costume name nor is a valid number
            }
        }
    }
    if (s.visible) interp.redraw();
};

LooksPrims.prototype.primCostumeNum = function(b) {
    var s = interp.targetSprite();
    return s == null ? 1 : s.currentCostumeIndex + 1;
};

LooksPrims.prototype.primChangeSize = function(b) {
    var s = interp.targetSprite();
    if (s == null) return;
    s.setSize(s.getSize() + interp.numarg(b, 0));
    if (s.visible) interp.redraw();
};

LooksPrims.prototype.primSetSize = function(b) {
    var s = interp.targetSprite();
    if (s == null) return;
    s.setSize(interp.numarg(b, 0));
    if (s.visible) interp.redraw();
};

LooksPrims.prototype.primSize = function(b) {
    var s = interp.targetSprite();
    if (s == null) return 100;
    return s.getSize();
};

LooksPrims.prototype.primGoFront = function(b) {
    var s = interp.targetSprite();
    runtime.reassignZ(s, null);
    if (s.visible) interp.redraw();
};

LooksPrims.prototype.primGoBack = function(b) {
    var s = interp.targetSprite();
    runtime.reassignZ(s, interp.numarg(b, 0));
    if(s.visible) interp.redraw();
};

LooksPrims.prototype.primChangeEffect = function(b) {
    var s = interp.targetSprite();
    s.filters[interp.arg(b, 0)] += interp.numarg(b, 1);
    s.updateFilters();
};

LooksPrims.prototype.primSetEffect = function(b) {
    var s = interp.targetSprite();
    s.filters[interp.arg(b, 0)] = interp.numarg(b, 1);
    s.updateFilters();
};

LooksPrims.prototype.primClearEffects = function(b) {
    var s = interp.targetSprite();
    s.resetFilters();
    s.updateFilters();
};

//var showBubble = function(b, type) {
LooksPrims.prototype.showBubble = function(type, b) {
    var s = interp.targetSprite();
    if (s !== null) s.showBubble(interp.arg(b, 0), type);
};

//var showBubbleAndWait = function(b, type) {
LooksPrims.prototype.showBubbleAndWait = function(type, b) {
    var s = interp.targetSprite();
    if (s === null) return;
    if (interp.activeThread.firstTime) {
        var text = interp.arg(b, 0);
        var secs = interp.numarg(b, 1);
        s.showBubble(text, type);
        if (s.visible) interp.redraw();
        interp.startTimer(secs);
    } else {
        if (interp.checkTimer()) s.hideBubble();
    }
};

module.exports = LooksPrims;
