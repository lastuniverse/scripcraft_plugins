'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}


var Eventemitter =  require('last/eventemmiter');
var GlobalEvents = new Eventemitter();

exports.events = GlobalEvents;

// var eventex = {};


// exports.on = function(eventname,callback,priority){
//   priority = priority||999999999;
//   eventex[eventname]=eventex[eventname]||[];
//   eventex[eventname].push({
//     callback: callback,
//     priority: priority
//   });
//   eventex[eventname] = eventex[eventname].sort(function(a, b) {
//     if (a.priority > b.priority) return -1;
//     if (a.priority < b.priority) return 1;
//   });
// }

// exports.emit = function(eventname,event){
//   if( !eventex.events.hasOwnProperty(eventname) ) 
//     return;

//   var handlers = eventex[eventname];
//   if( !handlers.length )
//     return;


//   for (var i = handlers.length - 1; i >= 0; i--) {
//     handlers[i].callback(event)
//   }
// }

