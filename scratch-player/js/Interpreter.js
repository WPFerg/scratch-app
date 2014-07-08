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
// Interpreter.js
// Tim Mickel, July 2011
// Based on the original by John Maloney

'use strict';

var Primitives = require('./primitives/Primitives'),
    Timer = require('./util/Timer');

// Define block constructor
var Block = function(opAndArgs, optionalSubstack)
{
    // Initialise variables
    this.op = opAndArgs[0];
    this.primFcn = interp.lookupPrim(this.op);
    this.args = opAndArgs.slice(1); // arguments can be either or constants (numbers, boolean strings, etc.) or expressions (Blocks)
    this.isLoop = false; // set to true for loop blocks the first time they run
    this.substack = optionalSubstack;
    this.subStack2 = null;
    this.nextBlock = null;
    this.tmp = -1;
    interp.fixArgs(this);
};

// Define thread constructor
var Thread = function(block, target)
{
    // Initialise variables
    this.nextBlock = block; // next block to run; null when thread is finished
    this.firstBlock = block;
    this.stack = []; // stack of enclosing control structure blocks
    this.target = target; // target object running the thread
    this.tmp = null; // used for thread operations like Timer
    this.tmpObj = []; // used for Sprite operations like glide
    this.firstTime = true;
    this.paused = false;
};

// Define inperpreter constructor
var Interpreter = function()
{
    // Interpreter state
    this.primitiveTable = {}
    this.variables = {};
    this.threads = [];
    this.activeThread = new Thread(null);
    this.WorkTime = 30;
    this.currentMSecs = null;
    this.timer = new Timer();
    this.yield = false;
    this.doRedraw = false;
    this.opCount = 0; // used to benchmark the interpreter
    this.debugOps = false;
    this.debugFunc = null;
    this.opCount2 = 0;
};

// Utilities for building blocks and sequences of blocks
Interpreter.prototype.fixArgs = function(InBlock)
{
    // Convert the arguments of the given block into blocks or substacks if necessary.
    // A block argument can be a constant (numbers, boolean strings, etc.), an expression (Blocks), or a substack (an array of blocks).
    var newArgs = [];

    // Iterate through all arguments 
    for (var i = 0; i < InBlock.args.length; i++)
    {

        // Shortcut var
        var CurrentArgument = InBlock.args[i];

        // If exists and is an array
        if (CurrentArgument && CurrentArgument.constructor == Array)
        {
            // If array of arrays (with at least one element in outter array)
            if ((CurrentArgument.length > 0) && (CurrentArgument[0].constructor == Array))
            {
                // If first element arg is itself an array, then arg is a substack
                if (!InBlock.substack)
                {
                    InBlock.substack = this.makeBlockList(CurrentArgument);
                } else {
                    InBlock.substack2 = this.makeBlockList(CurrentArgument);
                }
            } else {
                // CurrentArgument is a block
                newArgs.push(new Block(CurrentArgument));
            }
        } else {
            newArgs.push(CurrentArgument); // arg is a constant
        }
    }

    // Return modified arguments
    InBlock.args = newArgs;
};

// Create forwards singly linked list
Interpreter.prototype.makeBlockList = function(blockList)
{
    var firstBlock = null, lastBlock = null;
    for (var i = 0; i < blockList.length; i++)
    {
        var b = new Block(blockList[i]);
        if (firstBlock == null) firstBlock = b;
        if (lastBlock) lastBlock.nextBlock = b;
        lastBlock = b;
    }
    return firstBlock;
};

// The Interpreter proper
Interpreter.prototype.stepThreads = function()
{

    // Initialisation
    var startTime;
    startTime = this.currentMSecs = this.timer.time().getTime();
    this.doRedraw = false;

    // Exit if no threads exist
    if (this.threads.length == 0) return;

    // Iterate while still in reasonable time (WorkTime) and not a redraw
    while ((this.currentMSecs - startTime) < this.WorkTime && !this.doRedraw)
    {
        // Assume thread should stop (prove wrong)
        var threadStopped = false;

        // For each active thread
        for (var a = this.threads.length-1; a >= 0; --a)
        {
            // Set as active and step
            this.activeThread = this.threads[a];
            this.stepActiveThread();

            // If current thread is last thread
            if (!this.activeThread || this.activeThread.nextBlock == null)
            {
                threadStopped = true;
            }
        }

        // If thread has stopped
        if (threadStopped)
        {
            // Reset threads
            var newThreads = [];

            // Add the next block to process for each thread
            for (var a = this.threads.length-1; a >= 0; --a)
            {
                if (this.threads[a].nextBlock != null)
                {
                    newThreads.push(this.threads[a]);
                }
            }

            // Save new threads to caller object
            this.threads = newThreads;
            if (this.threads.length == 0) return;
        }

        // Set the new time
        this.currentMSecs = this.timer.time();
    }
};

// 
Interpreter.prototype.stepActiveThread = function()
{
    // Break if no active thread currently exists
    if (typeof(this.activeThread) == 'undefined')
    {
        return;
    }

    // Get next block
    var NextBlock = this.activeThread.nextBlock;

    // End if no more blocks
    if (NextBlock == null) return;

    // Set yield value
    this.yield = false;

    // Repeat FOREVER?
    while (true)
    {
        if (this.activeThread.paused) return;

        // Move to next operation
        ++this.opCount;

        // Advance the "program counter" to the next block before running the primitive. -- SCRATCH
        // Control flow primitives (e.g. if) may change activeThread.nextBlock. -- SCRATCH
        this.activeThread.nextBlock = NextBlock.nextBlock;

        // Determine if debug operands/functions exist
        if (this.debugOps && this.debugFunc)
        {

            // Copy over each argument
            var finalArgs = [];
            for (var i = 0; i < NextBlock.args.length; ++i)
            {
                finalArgs.push(this.arg(NextBlock, i));
            }

            // Output current arguments to debugger
            this.debugFunc(this.opCount2, NextBlock.op, finalArgs);
            ++this.opCount2;
        }


        NextBlock.primFcn(NextBlock);
        if (this.yield) { this.activeThread.nextBlock = NextBlock; return; }

        // refresh local variable b in case primitive did some control flow -- SCRATCH
        NextBlock = this.activeThread.nextBlock; 
        
        // While next block is NOT assigned
        while (!NextBlock) 
        {
            // end of a substack; pop the owning control flow block from stack
            // Note: This is a loop to handle nested control flow blocks.

            // yield at the end of a loop or when stack is empty
            if (this.activeThread.stack.length === 0)
            {
                this.activeThread.nextBlock = null;
                return;
            } else {
                NextBlock = this.activeThread.stack.pop();
                if (NextBlock.isLoop)
                {
                    this.activeThread.nextBlock = NextBlock; // preserve where it left off
                    return;
                } else {
                    NextBlock = NextBlock.nextBlock; // skip and continue for non looping blocks
                }
            }
        }
    }
};

// Start/Stop given thread
Interpreter.prototype.toggleThread = function(ThreadToToggle, targetObj)
{
    // Initialise
    var newThreads = [],
        wasRunning = false;

    // Search threads to determine if threads is running
    for (var i = 0; i < this.threads.length; i++)
    {
        // If target thread dont include in new threads
        if (this.threads[i].stack[0] == ThreadToToggle)
        {
            wasRunning = true;
        } else {
            // Not target thread to keep in threads
            newThreads.push(this.threads[i]);
        }
    }
    this.threads = newThreads;

    // If wasnt running start thread
    if (!wasRunning)
    {
        this.startThread(ThreadToToggle, targetObj);
    }
}

// Start a given thread and make this thread active
Interpreter.prototype.startThread = function(ThreadToStart, targetObj)
{
    this.activeThread = new Thread(ThreadToStart, targetObj);
    this.threads.push(this.activeThread);
};

// Restarts a given thread
Interpreter.prototype.restartThread = function(ThreadToRestart, targetObj)
{
    // used by broadcast; stop any thread running on ThreadToRestart, then start a new thread on ThreadToRestart
    var newThread = new Thread(ThreadToRestart, targetObj);
    var wasRunning = false;

    // Search for currently running instance of thread
    for (var i = 0; i < this.threads.length; i++)
    {
        // Find and reset to newThread instance
        if (this.threads[i].stack[0] == ThreadToRestart)
        {
            this.threads[i] = newThread;
            wasRunning = true;
        }
    }

    // If not running add anyway
    if (!wasRunning)
    {
        this.threads.push(newThread);
    }
};

// Get argument at index and display debug if needed
Interpreter.prototype.arg = function(block, index)
{
    // Transfer given block argument
    var arg = block.args[index];

    // Make sure argument is a block
    if ((typeof(arg) == 'object') && (arg.constructor == Block))
    {
        // Increase operands
        ++this.opCount;

        // If debugging return operand info
        if (this.debugOps && this.debugFunc)
        {
            var finalArgs = [];
            for (var i = 0; i < arg.args.length; ++i)
            {
                finalArgs.push(this.arg(arg, i));
            }

            this.debugFunc(this.opCount2, arg.op, finalArgs);
            ++this.opCount2;
        }

        // expression -- SCRATCH
        return arg.primFcn(arg);
    }

    // Return transfered argument
    return arg;
};

// Check if argument is a number
Interpreter.prototype.numarg = function(block, index)
{
    var arg = Number(this.arg(block, index));
    if (arg !== arg) {
        return 0;
    }
    return arg;
};

// Check if argument is a boolean (boolean or string representation)
Interpreter.prototype.boolarg = function(block, index)
{
    var arg = this.arg(block, index);
    if (typeof arg === 'boolean')
    {
        return arg;
    } else if (typeof arg === 'string')
    {
        return !(arg === '' || arg === '0' || arg.toLowerCase() === 'false');
    }
    return Boolean(arg);
};

// Return current thread target
Interpreter.prototype.targetSprite = function()
{
    return this.activeThread.target;
};

// Return current stage
Interpreter.prototype.targetStage = function()
{
    return runtime.stage;
};

// Start timer at for passed interval in seconds
Interpreter.prototype.startTimer = function(secs)
{
    var waitMSecs = 1000 * secs;
    if (waitMSecs < 0) waitMSecs = 0;
    this.activeThread.tmp = this.currentMSecs + waitMSecs; // end time in milliseconds
    this.activeThread.firstTime = false;
    this.yield = true;
};

// Check if timer has finished
Interpreter.prototype.checkTimer = function()
{
    // check for timer expiration and clean up if expired. return true when expired
    if (this.currentMSecs >= this.activeThread.tmp)
    {
        // time expired
        this.activeThread.tmp = 0;
        this.activeThread.firstTime = true;
        return true;
    } else {
        this.yield = true;
        return false;
    }
};

// Redraw flag to true
Interpreter.prototype.redraw = function() // Red Raw?
{
    this.doRedraw = true;
};

// Primitive operations
Interpreter.prototype.initPrims = function()
{

    // Add some flags/functions
    this.primitiveTable = {};
    this.primitiveTable['whenGreenFlag']       = this.primNoop;
    this.primitiveTable['whenKeyPressed']      = this.primNoop;
    this.primitiveTable['whenClicked']         = this.primNoop;
    this.primitiveTable['if']                  = function(b) { if (interp.boolarg(b, 0)) interp.startSubstack(b); };
    this.primitiveTable['doForever']           = function(b) { interp.startSubstack(b, true); };
    this.primitiveTable['doForeverIf']         = function(b) { if (interp.boolarg(b, 0)) interp.startSubstack(b, true); else interp.yield = true; };
    this.primitiveTable['doIf']                = function(b) { if (interp.boolarg(b, 0)) interp.startSubstack(b); };
    this.primitiveTable['doRepeat']            = this.primRepeat;
    this.primitiveTable['doIfElse']            = function(b) { if (interp.boolarg(b, 0)) interp.startSubstack(b); else interp.startSubstack(b, false, true); };
    this.primitiveTable['doWaitUntil']         = function(b) { if (!interp.boolarg(b, 0)) interp.yield = true; };
    this.primitiveTable['doUntil']             = function(b) { if (!interp.boolarg(b, 0)) interp.startSubstack(b, true); };
    this.primitiveTable['doReturn']            = function(b) { interp.activeThread = new Thread(null); };
    this.primitiveTable['stopAll']             = function(b) { interp.activeThread = new Thread(null); interp.threads = []; }
    this.primitiveTable['whenIReceive']        = this.primNoop;
    this.primitiveTable['broadcast:']          = function(b) { interp.broadcast(b, false); };
    this.primitiveTable['doBroadcastAndWait']  = function(b) { interp.broadcast(b, true); };
    this.primitiveTable['wait:elapsed:from:']  = this.primWait;

    // added by John - "nice work john ☺" @ WillJimbo:
    this.primitiveTable['showBubble'] = function(b) { console.log(interp.arg(b, 1)); };
    this.primitiveTable['timerReset'] = function(b) { interp.timerBase = Date.now(); };
    this.primitiveTable['timer'] = function(b) { return (Date.now() - interp.timerBase) / 1000; };

    // -?- Dont see the use of this as the constructed object is never used -?-
    new Primitives().addPrimsTo(this.primitiveTable);
};

// Get the time
Interpreter.prototype.timerBase = Date.now();

// Find primitive if it exists (log errors)
Interpreter.prototype.lookupPrim = function(op)
{
    var fcn = interp.primitiveTable[op];
    if (fcn == null) fcn = function(b) { console.log('not implemented: ' + b.op); };
    return fcn;
};

// -?- What are you playing at? -?-
Interpreter.prototype.primNoop = function(b)
{ console.log(b.op); };

// Wait for primitive
Interpreter.prototype.primWait = function(b)
{
    if (interp.activeThread.firstTime)
    {
        interp.startTimer(interp.numarg(b, 0));
    } else {
        interp.checkTimer();
    }
};

// Repeat primitive
Interpreter.prototype.primRepeat = function(b)
{
    if (b.tmp == -1)
    {
        b.tmp = Math.max(interp.numarg(b, 0), 0); // Initialize repeat count on this block
    }
    if (b.tmp > 0)
    {
        b.tmp -= 1; // decrement count
        interp.startSubstack(b, true);
    } else {
        // Done executing this repeat block for this round
        b.tmp = -1;
        b = null;
    }
};

// Send a broadcast
Interpreter.prototype.broadcast = function(b, waitFlag)
{
    // Initialise pair
    var pair;
    var done = true;

    // Determine if this is the first broadcase
    if (interp.activeThread.firstTime)
    {
        // Initialise more variables
        var receivers = [];
        var msg = String(interp.arg(b, 0)).toLowerCase();

        // Find receivers looking for specific broadcast message
        var findReceivers = function(stack, target)
        {
            if ((stack.op == 'whenIReceive') && (stack.args[0].toLowerCase() == msg))
            {
                receivers.push([stack, target]);
            }
        }

        // Process function to each stack
        runtime.allStacksDo(findReceivers);

        // Restart the found receivers
        for (pair in receivers)
        {
            interp.restartThread(receivers[pair][0], receivers[pair][1]);
        }

        // If not waiting then end else wait
        if (!waitFlag) return;
        interp.activeThread.tmpObj = receivers;
        interp.activeThread.firstTime = false;
    }

    // For each item in temp object (receivers)
    for (pair in interp.activeThread.tmpObj)
    {
        // If anything is running then not finished
        if (interp.isRunning(interp.activeThread.tmpObj[pair][0]))
        {
            done = false;
        }
    }

    // If finished delete everything
    if (done)
    {
        interp.activeThread.tmpObj = null;
        interp.activeThread.firstTime = true;
    } else {
        interp.yield = true;
    }
};

// If the block is running
Interpreter.prototype.isRunning = function(b)
{
    // Find block within threads to varify its running
    //for (t in interp.threads)
    for (var t in interp.threads) 
    {
        if (interp.threads[t].firstBlock == b)
        {
            return true;
        }
    }
    return false;
};

// Start a substack
Interpreter.prototype.startSubstack = function(b, isLoop, secondSubstack)
{
    // Start the substack of a control structure command such as if or forever.
    // "y'what?" - Will [23_06_2014]
    // "Were you high when writing this?" - James [23_06_2014]
    b.isLoop = !!isLoop;

    // remember the block that started the substack - SCRATCH
    this.activeThread.stack.push(b); 

    // -?- Is each block a substack itself? We'll work this out later -?-
    if (!secondSubstack)
    {
        this.activeThread.nextBlock = b.substack;
    } else {
        this.activeThread.nextBlock = b.substack2;
    }
};

module.exports = Interpreter;
module.exports.Thread = Thread;
module.exports.Block = Block;