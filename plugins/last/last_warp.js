/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин варпов
 * 
 * Позволяет создавать и удалять варпы, делать их публичными:
 *
 * ### Команды
 *
 * - базовые команды
 *   - /warp {warpname} : переместится на варп с именем {warpname}
 *   - /warp public {warpname}: дать разрешение посещать ваш варп с именем {warpname}
 *   - /warp private {warpname}: запретить всем посещать ваш варп с именем {warpname}
 * - информационные команды
 *   - /warp help : показать справку по командам группы /warp
 *   - /warp : показать список доступных варпов
 * - административные команды 
 *   - /warp listall : показать список всех варпов
 *   - /warp set {warpname} : установить точку варпа с именем {warpname}
 *   - /warp remove {warpname} : удалить точку варпа с именем {warpname}
 * 
 * ### Настройки модуля modules/last/permissions
 * 
 * ***Права доступа:***
 * - last_warp.sign.place - разрешение на установку табличек телепортации.
 * - last_warp.sign.use - разрешение на телепортацию при ПКМ по табличке с варпом.
 * - last_warp.manage - разрешение на установку и удаление варпов
 * - last_warp.access - разрешение, дающее открывать или закрывать варп для посещения
 * - last_warp.warp - разрешение на телепортацию по команде /warp {warp_name}.
 *
 * ***Параметры:***
 * - last_warp.max - максимальное количество варпов разрешенных для установки пользователю или группе пользователей.
 * 
 * ### Установка варпа
 * - встать на точку, в которую должны попадать будущие посетители варпа
 * - ввсести команду /warp set {warpname}, где {warpname} это уникальное в рамках всего сервера имя варпа
 *
 * ### Установка таблички варпа
 * - поставить табличку с надписями:
 *   - 1-3 строки - любой текст
 *   - 4 строка - команда тп на варп /warp {warpname}
 * 
 * ### Использование табличек варпов
 *  - ПКМ - переход на варп указанный в последней строке
 *  
 * ### Важно
 *  За телепортацию на варпы взымается плата опытом, стоимость ТП устанавливается в настройках модуля modules/last/teleport
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - sounds - стандартный модуль ScriptCraft для вывода звуковых эффектов
 * - modules/last/signs       - модуль событий связанных с табличками
 * - modules/last/teleport    - модуль обеспечивающий единый интерфейс телепортации, имееб настройки цены телепортации
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/locales     - модуль локализации
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/color       - модуль цвета
 * 
 * @module plugins/last/last_warp
 */

'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}


var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var utils = require('utils');
var sounds = require('sounds');
var signs = require('last/signs');
var teleport = require('last/teleport');
var eventex = require('last/eventex');

var permissions = require('last/permissions');
var completer = require('last/completer');
var color =  require('last/color').color;

var store = persist('data/plugins/last/warps', {
    warps: { },
    players: { }
});

var redtext = color('red','');
/*
*/

exports.getNearWarpDistance = getNearWarpDistance;
function getNearWarpDistance(loc){
  if ( !loc )
    return 0;

  var result = {
    warp: false,
    warp_name: "",
    dist: 9999999
  };
  for (var i in store.warps ) {
    var warp = store.warps[i];
    var wloc = warp.loc;
    if ( !wloc )
      continue;

    if( loc.world !== wloc.world )
      continue;

    var dx = Math.abs(wloc.x - loc.x);
    var dz = Math.abs(wloc.z - loc.z);
    var d = dx;
    if( dx < dz )
      d = dz;

    if( result.dist > d ){
      result.dist = d;
      result.warp = warp;
      result.warp_name = i;
    }
  }
  return result;
}

signs.events.onBeforeClickSign(function(event){
  var list = event.sign.getLine(3).split(/ /);
  var first = list.shift();
  if( first != '/warp')
    return;
  event.info = {
    signEvent:'onClickWarp',
    signType:'warp',
    signTarget: list.shift()
  };
});


// permission: last_warp.sign.use
signs.events.onClickSignEvent("onClickWarp",function (event){
  //console.log("!!! onClickWarp")
  var player = event.native.getPlayer();
  var action = event.native.getAction();
  if( action == 'RIGHT_CLICK_BLOCK'){
    var permission = permissions.getUserPermissions(player);
    if ( !permission.isPermission("last_warp.sign.use") ){
      echo( player, redtext + "вам не разрешено перемещятся на варпы через таблички!");
      if ( permission.isPermission("last_warp.warp") )
        echo( player, redtext + "Но вы все еще можете перемещятся командой /warp {warpname}!");
      return;
    }
    warps.go( event.info.signTarget, player);
  } 
});

// permission: last_warp.sign.place
signs.events.onSignPlace(function(event){
  var lines = event.native.getLines();
  var list = lines[3].split(/ /);
  var first = list.shift();
  if( first != '/warp')
    return;

  var player = utils.player( event.native.getPlayer() );
  var permission = permissions.getUserPermissions(player);
  if ( permission.isPermission("last_warp.sign.place") )
    return;

  lines[0] = 'Увы';
  lines[1] = 'вам не разрешено';
  lines[2] = 'устанавливать таблички';
  lines[3] = 'перемещения на варпы!!!';
    
});

var test = {
  warp: function( warpname, sender ) {
    if( !warpname ){
      echo( sender, redtext + warpname + " не допустимое имя варпа 1");
      return false;
    }

    if( typeof warpname != 'string'){
      echo( sender, redtext + warpname + " не допустимое имя варпа 2 "+typeof warpname);
      return false;
    }

    if( warpname.length < 2){
      echo( sender, redtext + warpname + " не допустимое имя варпа 3");
      return false;
    }

    return true;
  },

  warp_present: function( warpname, sender) {
    if( store.warps[warpname] ){
      echo( sender, redtext + "варп " + warpname + " уже существует");
      return false;
    }

    return true;
  },

  warp_notpresent: function( warpname, sender) {
    if( !store.warps[warpname] ){
      echo( sender, redtext + "варп " + warpname + " не существует");
      return false;
    }

    return true;
  },

  warp_public: function( warpname, sender) {
    if( !store.warps[warpname].public ){
      echo( sender, redtext + "варп " + warpname + " закрыт для посещений");
      return false;
    }

    return true;
  },

  player: function( sender ) {
    if( !sender ){
      console.log( "эту команду может использовать только игрок");
      return false;
    }
    return true;
  },

  owner: function( warpname, sender ) {
    var UUID = sender.getUniqueId();
    if( store.warps[warpname].UUID != UUID ){
      echo( sender, redtext + "варп " + warpname + " вам не принадлежит");
      return false;
    }
    return true;
  }
}



var warps = { 
  help: function( ) {
    return [
      /* basic functions */
      '/warp set {warpname} : установить точку варпа с именем {warpname}',
      '/warp {warpname} : переместится на варп с именем {warpname}',
      '/warp public {warpname}: дать разрешение посещать ваш варп с именем {warpname}',
      '/warp private {warpname}: запретить всем посещать ваш варп с именем {warpname}',

      /* информационные команды */
      '/warp : показать список доступных варпов',

      /* команды администраторов */
      '/warp listall : показать список всех варпов',
      '/warp remove {warpname} : удалить точку варпа с именем {warpname}'
    ];
  },
  /* ========================================================================
   basic functions
   ======================================================================== */
  go: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;
    var userLoc = utils.locationFromJSON( loc );

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.warp_public(warpname, sender) && !test.owner(warpname, sender) )
      return;


    var warp = store.warps[warpname];
    loc = store.warps[warpname].loc;

    if ( !loc )
      return echo( sender, redtext + "данные о варпе " + warpname + " повреждены");

    var warpLoc = utils.locationFromJSON( loc );

    if( teleport.teleport(sender, warpLoc) )
      eventex.events.emit("onPlayerWarped",{
        player: sender,
        warp: warp,
        warpname: warpname
      });

  },

  set: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_present(warpname, sender) )
      return;
    
    var UUID = sender.getUniqueId();
    if( !store.players[UUID] )
      store.players[UUID] = {
        name: sender.name,
        count: 0
      }


    var permission = permissions.getUserPermissions(sender);
    var warp_max = permission.getParam("last_warp.max")
    if( store.players[UUID].count >= warp_max  ){
      echo( sender, redtext + sender.name + " вы уже зарегестрировали мацсимально допустимое количество варпов. Вам доступно всего "+warp_max+" варпов для установки");
      return;
    }

    store.warps[warpname] = {}
    store.warps[warpname].UUID = ''+UUID;
    store.warps[warpname].owner = sender.name;
    store.warps[warpname].public = true;
    store.warps[warpname].loc = utils.locationToJSON( loc );

    store.players[UUID].count += 1;

    echo( sender, redtext + "варп " + warpname + " успешно зарегестрирован");
  },

  remove: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    var UUID = sender.getUniqueId();

    if( !store.players[UUID] ){
      store.players[UUID] = {
        name: sender.name,
        count: 0
      };
    }

    store.players[UUID].count -= 1;
    if( store.players[UUID].count == 0 )
      delete store.players[UUID];

    else{
    }

    delete store.warps[warpname];

    echo( sender, redtext + "варп " + warpname + " успешно удален");
  },

  /* ========================================================================
   social functions
   ======================================================================== */

  open: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    store.warps[warpname].public = true;

    echo( sender, redtext + "варп " + warpname + " открыт для публичного доступа");
  },

  close: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    store.warps[warpname].public = false;
    
    echo( sender, redtext + "варп " + warpname + " теперь закрыт для публичного доступа");
  },
  
  /* 
   list warps which the player can visit
   */
  list: function( ) {
    var result = {};
    for ( var warp in store.warps ) {
      if( store.warps[warp].public )
        result[warp] = true;
    }
    return result;
  },

  list_by_owner: function( owner ) {
    var result = {};
    var player = utils.player( owner );
    var UUID = player.getUniqueId();
    for ( var warp in store.warps ) {
      if( store.warps[warp].UUID == UUID  )
        result[warp] = true;
    }
    return result;
  },

  /* ========================================================================
   admin functions
   ======================================================================== */
  listall: function( ) {
    var result = {};
    for ( var warp in store.warps ) {
        result[warp] = true;
    }
    return result;
  }
};



exports.warps = warps;

var optionList = [];

/*
 Expose a set of commands that players can use at the in-game command prompt
 */

// обработчик команды /warp {warpname}
// permission: last_warp.warp
function cmd_warp( params , sender) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.warp") ){
    echo( sender, redtext + "вам не разрешено использовать эту команду");
    if ( permission.isPermission("last_warp.sign.use") )
      echo( sender, redtext + "Но вы все еще можете перемещятся на варпы через таблички!");
    return;
  }
  warps.go( params[1], sender );
};

// обработчик команды /warp help
function cmd_warp_help(params , sender){
  echo( sender,  redtext + warps.help().join("/n") );
};

// обработчик команды /warp set
// permission: last_warp.manage
function cmd_warp_set(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.manage") )
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  warps.set( params[2], sender ); 
};

// обработчик команды /warp remove
// permission: last_warp.manage
function cmd_warp_remove(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.manage") )
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  warps.remove( params[2], sender );
};

// обработчик команды /warp public
// permission: last_warp.access
function cmd_warp_public(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.access") )
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  warps.open( params[2], sender );
};

// обработчик команды /warp private
// permission: last_warp.access
function cmd_warp_private(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.access") )
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  warps.close( params[2], sender );
};

// обработчик команды /warp list
// permission: last_warp.warp || last_warp.sign.place
function cmd_warp_list(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.warp") && !permission.isPermission("last_warp.sign.place"))
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  var opened = Object.keys(warps.list(sender)).sort();
  if ( opened.length == 0 ) {
    echo( sender, redtext + "в настоящее время нет ни одного варпа открытого для посещений");
    return;
  } else {
    echo( sender, redtext + "вы можете посетить эти варпы: " + opened.join(" "));
  }
};


// обработчик команды /warp listall
// permission: last_warp.moderator
function cmd_warp_listall(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.moderator") )
    return echo( sender, redtext + "вам не разрешено использовать эту команду");

  var opened = Object.keys(warps.listall(sender)).sort();
  if ( opened.length == 0 ) {
    echo( sender, redtext + "в настоящее время не зарегестрированно ни одного варпа");
    return;
  } else {
    echo( sender, redtext + "зарегестрированние варпы: " + opened.join(" "));
  }
}



var warp = completer.addPlayerCommand('warp',cmd_warp_list,warps.list);
    warp.addComplete('help',cmd_warp_help);
    warp.addComplete('set')
        .addComplete('@any',cmd_warp_set);
    warp.addComplete('remove',undefined,warps.list_by_owner)
        .addComplete('@any',cmd_warp_remove);
    warp.addComplete('public',undefined,warps.list_by_owner)
        .addComplete('@any',cmd_warp_public);
    warp.addComplete('private',undefined,warps.list_by_owner)
        .addComplete('@any',cmd_warp_private);
    warp.addComplete('list',cmd_warp_list);
    warp.addComplete('listall',cmd_warp_listall);
    warp.addComplete('@any',cmd_warp);

