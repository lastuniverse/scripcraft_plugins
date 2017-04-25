if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}

var eventex = {};


function on(eventname,callback,priority){
  console.log("!!!!!!! eventex.on");
  priority = priority||999999999;
  eventex[eventname]=eventex[eventname]||[];
  eventex[eventname].push({
    callback: callback,
    priority: priority
  });
  eventex[eventname] = eventex[eventname].sort(function(a, b) {
    if (a.priority > b.priority) return -1;
    if (a.priority < b.priority) return 1;
  });
  console.log("!!!!!!! eventex.on "+eventex[eventname].length);
}
exports.on = on;

function emit(eventname,event){
  // console.log("!!!!!!! eventex.emit 0");
  if( !eventex.hasOwnProperty(eventname) ) 
    return;
  var handlers = eventex[eventname];
  //console.log("!!!!!!! eventex.emit 1.1");
  if( !handlers.length )
    return;
  //console.log("!!!!!!! eventex.emit 1.2");
  for (var i = handlers.length - 1; i >= 0; i--) {
    //console.log("!!!!!!! eventex.emit 2");
    handlers[i].callback(event);
  }
  //console.log("!!!!!!! eventex.emit 3");
}
exports.emit = emit;



events.playerInteract( function (event){
  var action = event.getAction(); //RIGHT_CLICK_BLOCK, LEFT_CLICK_BLOCK, RIGHT_CLICK_AIR, LEFT_CLICK_AIR
  if( action == 'RIGHT_CLICK_BLOCK' || action ==  'LEFT_CLICK_BLOCK'){
    emit('onClickBlock',event);
  }
});



function onClickBlock(callback,priority){
  console.log("!!!!!!! eventex.onClickBlock");
  on('onClickBlock',callback,priority);
};
exports.onClickBlock = onClickBlock;



onClickBlock(function (event){
  var block = event.getClickedBlock();
  var type = block.getType(); // WALL_SIGN - табличка на стене, SIGN_POST - табличка на палке
  if( type == 'WALL_SIGN' || type == 'SIGN_POST'){
    //var action = event.getAction(); //RIGHT_CLICK_BLOCK, LEFT_CLICK_BLOCK, RIGHT_CLICK_AIR, LEFT_CLICK_AIR
    emit('onClickSign',event);
  }
});

function onClickSign(callback,priority){
  console.log("!!!!!!! eventex.onClickSign");
  on('onClickSign',callback,priority);
};
exports.onClickSign = onClickSign;




// function onSignPlace(callback,priority){
//   console.log("!!!!!!! eventex.onSignPlace");
//   on('onSignPlace',callback,priority);
// };
// exports.onSignPlace = onSignPlace;
//
// WALL_SIGN SIGN_POST
// TRAPPED_CHEST CHEST
// events.blockPlace(function (event){
//   var block = event.getBlockPlaced();
//   var type = block.getType();
//   if( type == "WALL_SIGN" || type == "SIGN_POST"){
//     var subevent = {};
//     subevent.player = event.getPlayer();
//     subevent.blockAgainst = event.getBlockAgainst();
//     subevent.block = block;
//     subevent.table = subevent.block.getState();
//     subevent.text = [];
//     subevent.text[0] = subevent.table.getLine(0)||'';
//     subevent.text[1] = subevent.table.getLine(1)||'';
//     subevent.text[2] = subevent.table.getLine(2)||'';
//     subevent.text[3] = subevent.table.getLine(3)||'';
//     subevent.event = event;
//     emit('onSignPlace',subevent);
//   }
// });


// onSignPlace(function(event){
//   if( event.player.name == 'lastuniverse' ){
//     console.log("!!!!!! onSignPlaceHandler block "+event.block.getType()+" "+event.blockAgainst.getType());  
//   }
// });



// events.signChange(function (event){
//   //subevent.blockAgainst = event.getBlockAgainst();
//   var text = [];
//   text[0] = event.getLine(0)||'';
//   text[1] = event.getLine(1)||'';
//   text[2] = event.getLine(2)||'';
//   text[3] = event.getLine(3)||'';
//   // if( text[1].toLowerCase() == 'lift' )
//   //   emit('onSetLift',event);

// });

