'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}

var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var utils = require('utils');
var sounds = require('sounds');

var permissions = require('last/permissions');
var completer = require('last/completer');
var color =  require('last/color').color;
var expfix = require('last/expfix');

var redtext = color('red','');




// обработчик всех видов телепортации кроме системных
// permission: last_teleport.teleport (пока отсутствутет)
// permission param: last_teleport.cost 

exports.teleport = teleport;
function teleport(player,target_loc,sender){
    if(!sender)
        sender = player;

    player = utils.player(player);

	var ploc = utils.locationToJSON( player.location );
	var tloc = utils.locationToJSON( target_loc );

    var permission = permissions.getUserPermissions(sender);
    //if ( !permission.isPermission("last_warp.warp") ){
    var cost = permission.getParam("last_teleport.cost");

    var need_exp = calc(ploc,tloc,cost);

    var exp = expfix.getTotalExperience(sender);
    if ( exp < need_exp )
      return echo( sender, redtext + "У вас нехватает экпы. Вам требуется не менее " + need_exp + " экпы" );

    console.log("EXP: "+exp+'-'+need_exp+'='+(exp-need_exp));

    // player.setLevel(0);
    // player.setExp(0);
    // player.setTotalExperience(0);
    // player.giveExp(exp-need_exp);

    expfix.setTotalExperience(sender, exp-need_exp);


    
    player.teleport(target_loc, bkTeleportCause.PLUGIN);
    if( sender != player){
        echo( sender, redtext + player.name + " был успешно перемещены к точке назначения за " + need_exp+" экпы");
        echo( player, redtext + "вы были успешно перемещены к точке назначения");
    }else{
        echo( sender, redtext + "вы были успешно перемещены к точке назначения за " + need_exp+" экпы");
    }

    sounds.play( Packages.org.bukkit.Sound.ITEM_CHORUS_FRUIT_TELEPORT , player.location, 0.3, 0 );
    sounds.play( Packages.org.bukkit.Sound.ITEM_CHORUS_FRUIT_TELEPORT , target_loc, 0.3, 0 );
    

    //sounds.play( Packages.org.bukkit.Sound.ENTITY_ENDERMEN_TELEPORT , target_loc, 0.2, 0 );
    //sounds.play( Packages.org.bukkit.Sound.ENTITY_SHULKER_TELEPORT , target_loc, 1, 0 );
    //sounds.play( Packages.org.bukkit.Sound.BLOCK_PORTAL_TRAVEL , target_loc, 1, 0 );
    //sounds.play( Packages.org.bukkit.Sound.BLOCK_PORTAL_AMBIENT , target_loc, 0.5, 0 );
    //sounds.play( Packages.org.bukkit.Sound.BLOCK_PORTAL_TRIGGER  , target_loc, 0.5, 0 );    
    return true;
}



// var permission = permissions.getUserPermissions(player);
// var need_exp = permission.getParam("last_warp.exp");

//var cost = 300; // максимальная_цена
var dway = 720; //128; // ширина_наклонной_части
var sway = 3000; //700; // граница_дальности

function calc(ploc,tloc,cost){
    var way = Math.floor(Math.sqrt(Math.pow(ploc.x-tloc.x,2) + Math.pow(ploc.z-tloc.z,2)));
    var exp = Math.floor((1-(1/(1+Math.exp((way-sway)/dway))))*cost);
    return exp;
}


function teleportToUser(params,sender){
    var source = params[1];
    var target = params[2];
    if(!source )
        return;

    if(!target ){
        target = source;
        source = sender;
    }

    source = utils.player(source);
    target = utils.player(target);



    teleport(source,target.location,sender);
}



var point_tp = completer.addPlayerCommand('tp')
                         .addComplete('@user',teleportToUser)
                         .addComplete('@user',teleportToUser);
