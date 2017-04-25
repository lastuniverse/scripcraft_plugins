if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}


var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var spawn = require('./last_spawn.js');
var warp = require('./last_warp.js');
var utils = require('utils');

var eventex = require('last/events-extenshion');
eventex = require('last/events-extenshion');



events.signChange(function (event){
  var text = event.getLine(2)||'';
  if( text.toLowerCase() == 'lift' ){
    event.setLine(3,'ЛКМ-вниз | ПКМ-вверх');
  }
});


eventex.onClickSign(onClickSignHandler);
function onClickSignHandler(event){
  var player = event.getPlayer();
  var block = event.getClickedBlock();
  var sign = block.getState();

  var list = sign.getLine(3).split(/ /);
  var first = list.shift();
  var action = event.getAction();
  if( action == 'RIGHT_CLICK_BLOCK'){
    if( first == '/spawn'){
      spawn.goto_spawn(player);
    }else if( first == '/warp'){
      warp.goto_warp(list, player);
    }else if( sign.getLine(2).toLowerCase() == 'lift' ){
      search_sign(player,sign,'up');
    }
  }else if( action ==  'LEFT_CLICK_BLOCK'){
    if( sign.getLine(2).toLowerCase() == 'lift' ){
      var item_type  = player.getItemInHand().getType();
      if(  item_type == 'STONE_AXE'
        || item_type == 'DIAMOND_AXE '
        || item_type == 'GOLD_AXE '
        || item_type == 'IRON_AXE'
        || item_type == 'WOOD_AXE' ){

      }else{
        event.setCancelled(true);
        event.setUseInteractedBlock(org.bukkit.event.Event.Result.DENY);
        search_sign(player,sign,'down');
      }
    }
  }    
};


function search_sign(player,sign,direction){
  var step = -1;
  if(direction == 'up')
    step = 1;

  //.subtract(0,1,0).getBlock().getType()
  var loc = sign.getLocation();
  var world = loc.getWorld();
  //loc = utils.locationToJSON( loc );
  //console.log("!!!!! search_sign_up "+JSON.stringify(loc));
  console.log("---------------------------------");
  for (var i = loc.y+step; i > 0 && i < 256; i+=step) {
    var block = world.getBlockAt(loc.x, i, loc.z);
    var type = block.getType();
    console.log("!!!!! search_sign_up (y: "+i+" ) "+type);
    if( type == 'WALL_SIGN' || type == 'SIGN_POST' ){
      if( test_sign(block) ){
        var block_loc = block.getLocation();
        var player_loc = player.getLocation();
        player_loc.y=block_loc.y;
        var target = search_place(world,player_loc);
        if( target ){
          player.teleport(target, bkTeleportCause.PLUGIN);
          break;  
        }
      }
      
    }
  }
  
};


function test_sign(block){
  var sign = block.getState();
  if( sign.getLine(2).toLowerCase() == 'lift' )
    return true;
  return false;
};

function search_place(world,target){
  for (var i = 0; i < 4 ; i++) {
    target.y--;
    var block = world.getBlockAt(Math.round(target.x), target.y-i, Math.round(target.z));
    var type = block.getType();
    if( type != 'AIR' ){
      target.y+=2;
      return target;
    }
  }
  return false;
};






// // events.playerInteractAtEntity( function (event){
// //   //console.log("!!!!!!!! playerInteractAtEntity");
// // });


// // events.playerItemDamage( function (event){
// //   // console.log("!!!!!!!! playerItemDamage");
// // });




