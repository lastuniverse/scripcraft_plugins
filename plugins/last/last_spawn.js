/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин Спавн
 * 
 * Позволяет устанавливать точку спавна и использовать команду или табличку для перемещения в эту точку. Следует обратить внимание, что точка спавна одна на весь сервер.
 *      
 * ### Команды
 * - `/spawn set` : устанавливает текущую точку как точку спавна
 * - `/spawn` : перемещает в точку спавна
 * 
 * ### Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_spawn.set` - разрешение на установку общесерверной точки спавна.
 * - `last_spawn.spawn` - разрешение на телепортацию на спавн по команде `/spawn`.
 * - `last_spawn.sign.place` - разрешение на установку табличек телепортации на спавн.
 * - `last_spawn.sign.use` - разрешение на телепортацию на спавн при ПКМ по табличке.
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/signs       - модуль событий связанных с табличками
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/teleport    - модуль обеспечивающий единый интерфейс телепортации, имееб настройки цены телепортации
 * - modules/last/locales     - модуль локализации
 * - modules/last/color       - модуль цвета
 * 
 * @module plugins/last/last_spawn
 */

'use strict';
/*
  spawn teleporting plugin.
  Adds a new `/spawn` command
*/
if (__plugin.canary){
  console.warn('last_spawn not yet supported in CanaryMod');
  return;
}

var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var utils = require('utils');
var signs = require('last/signs');

var permissions = require('last/permissions');
var teleport = require('last/teleport');
var completer = require('last/completer');
var color =  require('last/color').color;

var store = persist('data/plugins/last/spawn', {});
var redtext = color('red','');


signs.events.onBeforeClickSign(function(event){
  var comand = event.sign.getLine(3);
  if( comand != '/spawn')
    return;
  event.info = {
    signEvent:'onClickSpawn',
    signType:'spawn'
  };
});

// permission: last_spawn.sign.use
signs.events.onClickSignEvent("onClickSpawn",function (event){
  //console.log("!!! onClickSpawn");
  var player = event.native.getPlayer();
  var action = event.native.getAction();
  if( action == 'RIGHT_CLICK_BLOCK'){
    var permission = permissions.getUserPermissions(player);
    if ( !permission.isPermission("last_spawn.sign.use") ){
      echo( player, redtext + "вам не разрешено перемещятся на спавн через таблички!");
      if ( permission.isPermission("last_spawn.spawn") )
        echo( player, redtext + "Но вы все еще можете перемещятся командой /spawn!");
      return;
    }
    goto_spawn(player);
  } 
});

// permission: last_spawn.sign.place
signs.events.onSignPlace(function(event){
  var lines = event.native.getLines();
  if( lines[3] != '/spawn')
    return;

  var player = utils.player( event.native.getPlayer() );
  var permission = permissions.getUserPermissions(player);
  if ( permission.isPermission("last_spawn.sign.place") )
    return;

  lines[0] = 'Увы';
  lines[1] = 'вам не разрешено';
  lines[2] = 'устанавливать таблички';
  lines[3] = 'перемещения на спавн!!!';
    
});



function goto_spawn(player){
  var loc = store.spawn;

  if ( !loc )
    return echo( player, redtext + 'На сервере не установленна точка спавна. Чтобы ее установить нужно быть оператором и выполнить команду /spawn set.');

  var spawn_loc = utils.locationFromJSON( loc );
  teleport.teleport(player, spawn_loc);
}



var spawn_help = [
  /* basic functions */
  '/spawn : переместится на спавн\n',
  '/spawn set: установить точку терепорта по команде /spawn, не влияет на спавн после смерти (доступна только самому главному администратору)\n',
  '/spawn help : эта справка\n'
];
function cmd_spawn_help( params, sender ) {
  echo( sender,  redtext + spawn_help );
};

// обработчик команды /spawn
function cmd_spawn( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_spawn.spawn") ){
    echo( sender, redtext + "вам не разрешено использовать эту команду");
    if ( permission.isPermission("last_spawn.sign.use") )
      echo( sender, redtext + "Но вы все еще можете перемещятся на спавн через таблички!");
    return;
  }
  goto_spawn(sender);
};

// обработчик команды /spawn set
// permission: last_spawn.set
function cmd_spawn_set( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( permission.isPermission("last_spawn.set") ) {
    var player = utils.player( sender );
    var loc = player.location;
    store.spawn = utils.locationToJSON( loc );
    echo( sender,  redtext + 'Точка спавна установленна!');
  } else {
    echo( sender, redtext + 'Команда /setspawn только для операторов!'  );
  }
};

var spawn = completer.addPlayerCommand('spawn',cmd_spawn);
    spawn.addComplete('set',cmd_spawn_set);
    spawn.addComplete('help',cmd_spawn_help);


