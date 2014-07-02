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
// Primitives.js
// Tim Mickel, July 2011

// Provides the basic primitives for the interpreter and loads in the more
// complicated primitives, e.g. MotionAndPenPrims.

'use strict';

var LooksPrims = require('./LooksPrims'),
    MotionAndPenPrims = require('./MotionAndPenPrims'),
    SensingPrims = require('./SensingPrims'),
    SoundPrims = require('./SoundPrims'),
    VarListPrims = require('./VarListPrims');

var Primitives = function() 
{

    // Create prim table object
    this.primTable = {};

    // Math primitives
    this.primTable['+']        = function(b) { return interp.numarg(b, 0) + interp.numarg(b, 1); };
    this.primTable['-']        = function(b) { return interp.numarg(b, 0) - interp.numarg(b, 1); };
    this.primTable['*']        = function(b) { return interp.numarg(b, 0) * interp.numarg(b, 1); };
    this.primTable['/']        = function(b) { return interp.numarg(b, 0) / interp.numarg(b, 1); };
    this.primTable['%']        = this.primModulo;
    this.primTable['randomFrom:to:'] = this.primRandom;
    this.primTable['<']        = function(b) { return (interp.numarg(b, 0) < interp.numarg(b, 1)); };
    this.primTable['=']        = function(b) { return (interp.arg(b, 0) == interp.arg(b, 1)); };
    this.primTable['>']        = function(b) { return (interp.numarg(b, 0) > interp.numarg(b, 1)); };
    this.primTable['&']        = function(b) { return interp.boolarg(b, 0) && interp.boolarg(b, 1); };
    this.primTable['|']        = function(b) { return interp.boolarg(b, 0) || interp.boolarg(b, 1); };
    this.primTable['not']      = function(b) { return !interp.boolarg(b, 0); };
    this.primTable['abs']      = function(b) { return Math.abs(interp.numarg(b, 0)); };
    this.primTable['sqrt']     = function(b) { return Math.sqrt(interp.numarg(b, 0)); };

    this.primTable['\\\\']               = this.primModulo;
    this.primTable['rounded']            = function(b) { return Math.round(interp.numarg(b, 0)); };
    this.primTable['computeFunction:of:'] = this.primMathFunction;

    // String primitives
    this.primTable['concatenate:with:']  = function(b) { return '' + interp.arg(b, 0) + interp.arg(b, 1); };
    this.primTable['letter:of:']         = this.primLetterOf;
    this.primTable['stringLength:']      = function(b) { return interp.arg(b, 0).length; };

    // Add primitives
    this.addPrims(new LooksPrims());
    this.addPrims(new MotionAndPenPrims());
    this.addPrims(new SensingPrims());
    this.addPrims(new SoundPrims());
    this.addPrims(new VarListPrims());

}

Primitives.prototype.addPrims = function(AdditionalPrims)
{

    // Check object for primitive table
    if (typeof AdditionalPrims.primTable == 'undefined')
    {

        // Display error
        console.log('Passed object does not have primitive table! Aborting table addition.');

    } else {

        // Add each primitive to current object
        var table = this.primTable;
        for (var Prim in AdditionalPrims.primTable)
        {
            table[Prim] = AdditionalPrims.primTable[Prim];
        }
        this.primTable = table;

    }

    // Return compiled table (may still be original table)
    return this.primTable;

}

Primitives.prototype.primRandom = function(b) {
    var n1 = interp.numarg(b, 0);
    var n2 = interp.numarg(b, 1);
    var low = n1 <= n2 ? n1 : n2;
    var hi = n1 <= n2 ? n2 : n1;
    if (low == hi) return low;
    // if both low and hi are ints, truncate the result to an int
    if (Math.floor(low) == low && Math.floor(hi) == hi) {
        return low + Math.floor(Math.random() * (hi + 1 - low));
    }
    return Math.random() * (hi - low) + low;
}

Primitives.prototype.primLetterOf = function(b) {
    var s = interp.arg(b, 1);
    var i = interp.numarg(b, 0) - 1;
    if (i < 0 || i >= s.length) return '';
    return s.charAt(i);
}

Primitives.prototype.primModulo = function(b) {
    var dividend = interp.numarg(b, 1);
    var n = interp.numarg(b, 0) % dividend;
    if (n / dividend < 0) n += dividend;
    return n;
}

Primitives.prototype.primMathFunction = function(b) {
    var op = interp.arg(b, 0);
    var n = interp.numarg(b, 1);
    switch(op) {
        case 'abs': return Math.abs(n);
        case 'sqrt': return Math.sqrt(n);
        case 'sin': return Math.sin(n * Math.PI / 180);
        case 'cos': return Math.cos(n * Math.PI / 180);
        case 'tan': return Math.tan(n * Math.PI / 180);
        case 'asin': return Math.asin(n) * 180 / Math.PI;
        case 'acos': return Math.acos(n) * 180 / Math.PI;
        case 'atan': return Math.atan(n) * 180 / Math.PI;
        case 'ln': return Math.log(n);
        case 'log': return Math.log(n) / Math.LN10;
        case 'e ^': return Math.exp(n);
        case '10 ^': return Math.exp(n * Math.LN10);
    }
    return 0;
}

module.exports = Primitives;
