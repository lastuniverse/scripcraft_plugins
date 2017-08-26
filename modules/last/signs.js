'use strict';

if (!__plugin.bukkit){
  console.warn('last/signs supported in Spigot only');
  return;
}

/* Global requires */
var utils = require('utils');
var storage = require('last/storage');
var eventex = require('last/eventex');

var bkClickType = org.bukkit.event.inventory.ClickType;

/* Global storages */

var signs = {};




/* Global functions and utilites */


function hasSign( block ){
  if (block && block.state && block.state.setLine)
      return block.state;
  return false;
}



/* work moments for event handlers */

function getLocationKey(block){
  var loc =   block.getLocation();
  loc = utils.locationToJSON( loc );
  return loc.world+"."+loc.x+"."+loc.y+"."+loc.z;
};

function storeSignInfo(event){
  var block = event.getBlock();
  var key = getLocationKey(block);
  signs[key] = {
    block: block,
    against:  event.getBlockAgainst()
  }
}

function getSignInfo(event){
  var block = event.getBlock();
  var key = getLocationKey(block);
  var against = signs[key];
  delete signs[key];
  return against;
}

function isAxe(item_type){
  if(  item_type == 'STONE_AXE'
    || item_type == 'DIAMOND_AXE'
    || item_type == 'GOLD_AXE'
    || item_type == 'IRON_AXE'
    || item_type == 'WOOD_AXE' ) 
    return true;
  return false;
}

/* Event handlers */

events.blockPlace(function (event){
  var block = event.getBlockPlaced();
  if( !hasSign(block) )
    return;
  storeSignInfo(event);
});


events.blockPhysics( function (event){
  // var block = event.getBlock();
  // if( !hasSign(block) )
  //   return;

  // var state = block.getState();
  // var lines = state.getLines();
  // if( !lines )
  //   return;

  // var plased = state.isPlaced();
  // var liquid = block.isLiquid();

  // // var loc = block.getLocation();
  // // var type = event.getChangedType();
  // // var etype = event.getEventName();
  // console.log("!!! blockPhysics onSignBreak "+liquid );
  
  // eventex.events.emit('onSignBreak',event); 
});

events.blockBreak( function (event){
  var block = event.block;
  if( !hasSign(block) )
    return;
  eventex.events.emit('onSignBreak',event); 
});

// events.blockFade( function (event){
//   var block = event.block;
//   if( !hasSign(block) )
//     return;
//   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! sign FADE");
//   eventex.events.emit('onSignBreak',event); 
// });


// onSignBreak( function (event){
//   var block = event.block || event.getBlock();
//   var sign = block.getState();

//   // eventex.events.emit('onClickSign',{
//   //   native: event
//   // });    
// }

// events.blockDamage( function (event){
//   console.log("!!!! blockDamage sign" );
// });

// var loc =   block.getLocation();
// loc = utils.locationToJSON( loc );
// loc = JSON.stringify(loc);
// console.log("!!!! blockPhysics sign "+loc );


events.signChange(function (event){
  var signInfo = getSignInfo(event);
  //signInfo.block
  eventex.events.emit('onSignPlace',{
    native: event,
    against: signInfo.against
  });
});

events.playerInteract( function (event){
  var action = event.getAction(); //RIGHT_CLICK_BLOCK, LEFT_CLICK_BLOCK, RIGHT_CLICK_AIR, LEFT_CLICK_AIR
  if( action == 'RIGHT_CLICK_BLOCK' || action ==  'LEFT_CLICK_BLOCK'){
    eventex.events.emit('onClickBlock',event);
  }
});

onClickBlock( function (event){
  var block = event.getClickedBlock();
  if( !hasSign(block) )
    return;
  var sign = block.getState();

  eventex.events.emit('onClickSign',{
    native: event
  });    
});


var users_timer = {};

onClickSign(function(event){

  event.block = event.native.getClickedBlock();
  event.sign = event.block.getState();
  eventex.events.emit("onBeforeClickSign",event);

  /* last_storage */
  // if(!event.info)
  //   event.info = event.getData();

  //console.log("!!!! onClickSign 01 "+JSON.stringify(info));
  if(!event.info)
    return;

  var player = event.native.getPlayer();
  var UUID = ''+player.getUniqueId();
  var time = now();

  //console.log("!!!! onClickSign 02");
  if(event.info.isUnbreakable){
    var item_type  = player.getItemInHand().getType();
    //console.log("!!!! onClickSign 03");
    if( isAxe(item_type) )
      return;
    //if( bkClickType.isShiftClick(); )
    
    event.native.setCancelled(true);
    event.native.setUseInteractedBlock(org.bukkit.event.Event.Result.DENY);
  }
  //console.log("!!!! onClickSign 04");

  if( (time - users_timer[UUID]) < 300 )
    return;

  users_timer[UUID]=time;


  event.player = player;
  eventex.events.emit(event.info.signEvent,event);
});

/* Event setters */

function onClickBlock(callback,priority){
  //console.log("!!!!!!! eventex.onClickBlock");
  eventex.events.on('onClickBlock',callback,priority);
};

function onClickSign(callback,priority){
  //console.log("!!!!!!! eventex.onClickSign");
  eventex.events.on('onClickSign',callback,priority);
};

function onSignBreak(callback,priority){
  //console.log("!!!!!!! eventex.onSignBreak");
  eventex.events.on('onSignBreak',callback,priority);
};

function onSignPlace(callback,priority){
  //console.log("!!!!!!! eventex.onSignPlace");
  eventex.events.on('onSignPlace',callback,priority);
};

function onClickSignEvent(event,callback,priority){
  //console.log("!!!!!!! eventex.onSignPlace");
  eventex.events.on(event,callback,priority);
};


function onBeforeClickSign(callback,priority){
  //console.log("!!!!!!! eventex.onSignPlace");
  eventex.events.on("onBeforeClickSign",callback,priority);
};




function now(){
  var now = Date.now;
  if(now)
    now = new Date().getTime();
  return now;
}



// onSignPlace(function(event){
//   if( event.player.name == 'lastuniverse' ){
//     console.log("!!!!!! onSignPlaceHandler block "+event.block.getType()+" "+event.blockAgainst.getType());  
//   }
// });


exports.hasSign = hasSign;
exports.events = {
  onSignPlace: onSignPlace,
  onSignBreak: onSignBreak,
  onClickBlock: onClickBlock,
  onBeforeClickSign: onBeforeClickSign,
  onClickSign: onClickSign,
  onClickSignEvent: onClickSignEvent
};
