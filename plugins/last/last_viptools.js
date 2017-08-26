/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин Вип-утилиты
 * 
 * Позволяет использовать команды полета, бессмертия и ускорения
 *      
 * ### Команды
 * - `/fly` : включает/выключает возможность левитации (полет как в креативе)
 * - `/god` : включает/выключает режим бессмертия
 * - `/slap` : дает сильного пинка под зад тому кто ввел команду в направлении взгляда
 * 
 * ### Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_viptools.fly` - разрешение на использование команды `/fly`
 * - `last_viptools.god` - разрешение на использование команды `/god`
 * - `last_viptools.slap` - разрешение на использование команды `/slap`
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/users       - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * - modules/last/locales     - модуль локализации
 * 
 * @module plugins/last/last_viptools
 */

'use strict';

if (__plugin.canary){
  console.warn('last_viptools not yet supported in CanaryMod');
  return;
}

var bkBukkit = org.bukkit.Bukkit;
var utils = require('utils');

var permissions = require('last/permissions');
var completer = require('last/completer');
var eventex =  require('last/eventex');
var users = require('last/users');
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/viptools.json");
if(!config.enable)
  return console.log("plugins/last/last_viptools  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_viptools", config.locale||"ru_ru");


function isOnGround(player) {
    // return ((!player.isFlying()) || (!player.getLocation().subtract(0,1,0).getBlock().getType() == Material.AIR));
    // console.log("Material: ("+player.getLocation().subtract(0,1,0).getBlock().getType()+")")
    return !(player.getLocation().subtract(0,1,0).getBlock().getType() == "AIR");
}

// обработчик команды /fly
// permission: last_viptools.fly
function cmd_fly( params, sender ) {
  if ( !config.allow_fly )
    return locale.warn(sender, "${msg.fly_restrict}" );

  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_viptools.fly") )
    return locale.warn(sender, "${msg.fly_deny}" );

  var player = users.getPlayer(sender);
  if( player.data.isFly ){
    player.data.isFly = false;
    sender.setAllowFlight( false );
    locale.warn(sender, "${msg.fly_off}" );
  }else{
    player.data.isFly = true;
    sender.setAllowFlight( sender.name );
    locale.warn(sender, "${msg.fly_on}" );
  }
};


// обработчик команды /slap
// permission: last_viptools.slap
function cmd_slap( params, sender ) {
  if ( !config.allow_slap )
    return locale.warn(sender, "${msg.slap_restrict}" );

  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_viptools.slap") )
    return locale.warn(sender, "${msg.slap_deny}" );
    

  var player = utils.player( sender );
  var loc = player.location;
  var dir = player.location;
  //Main.instance.getConfig().getDouble("velocity_multiplier")
  //.setY(Main.instance.getConfig().getInt("Y_axis"))
  var vect = player.getLocation().getDirection().multiply(1000);
  //player.setAllowFlight(true);
  player.setVelocity(vect);
  locale.warn(sender, "${msg.slap}" );
};



// обработчик команды /god
// permission: last_viptools.god
function cmd_god( params, sender ) {
  if ( !config.allow_god )
    return locale.warn(sender, "${msg.god_restrict}" );

  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_viptools.god") )
    return locale.warn(sender, "${msg.god_deny}" );

  var player = users.getPlayer(sender);
  if( player.data.isGod ){
    player.data.isGod = false;
    locale.warn(sender, "${msg.god_off}" );
  }else{
    player.data.isGod = true;
    locale.warn(sender, "${msg.god_on}" );
  }
};


eventex.events.on("onPlayerJoin", function ( event ) {
  if ( !config.allow_fly && !config.allow_god )
    return;

  var player = users.getPlayer(event.player);
  var permission = permissions.getUserPermissions(event.player);


  var isFly = permission.isPermission("last_viptools.fly");
  var isGod = permission.isPermission("last_viptools.god");

  if ( !isFly && !isGod )
    return;

  _initPlayer(player);

  if ( isFly ) {
    if( player.data.isFly  ){
      locale.warn(event.player, "${msg.fly_on}" );
      event.player.setAllowFlight( true );
      if( !isOnGround(event.player) )
        event.player.setFlying(true);
    }else{
      locale.warn(event.player, "${msg.fly_off}" );
      event.player.setAllowFlight( false );
    }
  }
  if ( isGod ) {
    if( player.data.isGod ){
      locale.warn(event.player, "${msg.god_on}" );
    }else{
      locale.warn(event.player, "${msg.god_off}" );
    }
  }  
});

events.entityDamage( function(event){
  if( !config.allow_god )
    return;
  
  if( event.entity.getType() != 'PLAYER' )
    return;

  var player = utils.player( event.entity );
  var user = users.getPlayer(player);
  var permission = permissions.getUserPermissions(player);
  if ( !permission.isPermission("last_viptools.god") )
    return;

  if( !user.data.isGod )
    return;
      
  event.setCancelled(true);
  event.setDamage(0);

});


function _initPlayer(player){
  if( !player.data.isFly )
    player.data.isFly=false;
  if( !player.data.isGod )
    player.data.isGod=false;
  return player.UUID;
}


if(config.allow_fly)
  completer.addGlobalCommand('fly',cmd_fly);

if(config.allow_god)
  completer.addPlayerCommand('god',cmd_god);

if(config.allow_slap)
  completer.addPlayerCommand('slap',cmd_slap);