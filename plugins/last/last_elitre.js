'use strict';

if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}

var color =  require('last/color').color;
var utils = require('utils');
var completer = require('last/completer');

//var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
//var bkBukkit = org.bukkit.Bukkit;

/*
  set storage
*/
var store = persist('last_elitre', { 
  fly:{
   isFly: {},
   isAllow: {}
  },
  god:{
   isgod: {},
   isAllow: {}
  } 
});

var redtext = color('red','');


function isOnGround(player) {
    // return ((!player.isFlying()) || (!player.getLocation().subtract(0,1,0).getBlock().getType() == Material.AIR));
    // console.log("Material: ("+player.getLocation().subtract(0,1,0).getBlock().getType()+")")
    return !(player.getLocation().subtract(0,1,0).getBlock().getType() == "AIR");
}


// обработчики группы команд /fly
function cmd_fly_allow( params, sender ) {
  if ( sender.isOp() ) {
    store.fly.isAllow[ params[2] ] = true;
    echo( sender, redtext+'Вы разрешили летать игроку '+params[2] );
  }else{
    echo( sender, redtext+'У вас нет прав использовать команду /fly allow' );
  }
};
function cmd_fly_deny( params, sender ) {
  if ( sender.isOp() ) {
    delete store.fly.isAllow[ params[2] ];
    delete store.fly.isFly[ params[2] ];
    //player.setAllowFlight( false );
    echo( sender, redtext+'Вы отключили возможность полетов игроку '+params[2] );
  }else{
    echo( sender, redtext+'У вас нет прав использовать команду /fly deny' );
  }
};
function cmd_fly( params, sender ) {
  var player = utils.player( sender );
  if( store.fly.isAllow[ player.name ] ){
    if( !store.fly.isFly[ player.name ] ){
      store.fly.isFly[ player.name ] = true;
      player.setAllowFlight( true );
    echo( player, redtext+'Режим полета включен.');
    }else{
      store.fly.isFly[ player.name ] = false;
      player.setAllowFlight( false );
      echo( player, redtext+'Режим полета отключен.');
    }
  }else{
    echo( player, redtext+'У вас нет разрешения на полеты.');
  } 
};
var fly = completer.addGlobalCommand('fly',cmd_fly);
var fly_allow = fly.addComplete('allow')
    fly_allow.addComplete("@user",cmd_fly_allow);
var fly_deny = fly.addComplete('deny');
    fly_deny.addComplete("@user",cmd_fly_deny);


// обработчик команды /slap
function cmd_slap( params, sender ) {
  var player = utils.player( sender );
  var loc = store.spawn;
  var loc = player.location;
  var dir = player.location;
//Main.instance.getConfig().getDouble("velocity_multiplier")
//.setY(Main.instance.getConfig().getInt("Y_axis"))
  var vect = player.getLocation().getDirection().multiply(1000);
  //player.setAllowFlight(true);
  player.setVelocity(vect);
};
completer.addPlayerCommand('slap',cmd_slap);


// обработчики группы команд /god
function cmd_god_allow( params, sender ) {
  if ( sender.isOp() ) {
    store.god.isAllow[ params[2] ] = true;
    echo( sender, redtext+'Вы разрешили игроку '+params[2]+' применять команду бессмертия' );
  }else{
    echo( sender, redtext+'У вас нет прав использовать команду /god allow' );
  }
};
function cmd_god_deny( params, sender ) {
  if ( sender.isOp() ) {
    delete store.god.isAllow[ params[2] ];
    delete store.god.isGod[ params[2] ];
    echo( sender, redtext+'Вы запретили игроку '+params[2]+'применять команду бессмертия' );
  }else{
    echo( sender, redtext+'У вас нет прав использовать команду /god deny' );
  }
};
function cmd_god( params, sender ) {
  var player = utils.player( sender );
  if( store.god.isAllow[ player.name ] ){
    if( !store.god.isGod[ player.name ] ){
      store.god.isGod[ player.name ] = true;
      echo( player, redtext+'Режим бессмертия включен.');
    }else{
      store.god.isGod[ player.name ] = false;
      echo( player, redtext+'Режим бессмертия отключен.');
    }
  }else{
    echo( player, redtext+'У вас нет разрешения на использование бессмертия.');
  } 
};

var god = completer.addPlayerCommand('god',cmd_god);
var god_allow = god.addComplete('allow');
    god_allow.addComplete("@user",cmd_god_allow);
var god_deny = god.addComplete('deny');
    god_deny.addComplete("@user",cmd_god_deny);



events.playerJoin(function ( event ) {
  var player = utils.player( event.player );
  if( store.fly.isAllow[ player.name ] ){
    if( store.fly.isFly[ player.name ] ){
      echo( event.player , redtext+player.name+', у вас включен режим полета' );
      player.setAllowFlight( true );
      if( !isOnGround(player) ){
        player.setFlying(true);
      }
    }else{
      echo( event.player, redtext+player.name+', у вас отключен режим полета' );
      player.setAllowFlight( false );
    }
  }
  if( store.god.isAllow[ player.name ] ){
    if( store.god.isGod[ player.name ] ){
      echo( event.player , redtext+player.name+', у вас включен режим бессмертия' );
    }else{
      echo( event.player, redtext+player.name+', у вас отключен режим полета' );
    }
  }  
});

events.entityDamage( function(event){
  var type = event.entity.getType();
  if( type = 'PLAYER' ){
    var player = utils.player( event.entity );
    if( store.god.isGod[ player.name ] ){
      event.setCancelled(true);
      event.setDamage(0);
    }
  }
  
});





