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
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/warp.json");
if(!config.enable)
  return console.log("plugins/last/last_warp DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_warp", config.locale||"ru_ru");


var store = persist('data/plugins/last/warps', {
    warps: { },
    players: { }
});

var redtext = "".red();
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
      locale.warn(player, "${msg.sign_deny}" );
      if ( permission.isPermission("last_warp.warp") )
        locale.warn(player, "${msg.warp_allow}" );
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
      locale.warn(sender, "${msg.warp_name_error} 1", {name: "undefined"});
      return false;
    }

    if( typeof warpname != 'string'){
      locale.warn(sender, "${msg.warp_name_error} 2", {name: typeof warpname});
      return false;
    }

    if( warpname.length < 2){
      locale.warn(sender, "${msg.warp_name_error} 3", {name: warpname});
      return false;
    }

    return true;
  },

  warp_present: function( warpname, sender) {
    if( store.warps[warpname] ){
      locale.warn(sender, "${msg.warp_name_exist}", {name: warpname});
      return false;
    }

    return true;
  },

  warp_notpresent: function( warpname, sender) {
    if( !store.warps[warpname] ){
      locale.warn(sender, "${msg.warp_name_epsent}", {name: warpname});
      return false;
    }

    return true;
  },

  warp_public: function( warpname, sender) {
    if( !store.warps[warpname].public ){
      locale.warn(sender, "${msg.warp_name_closed}", {name: warpname});
      return false;
    }

    return true;
  },

  player: function( sender ) {
    if( !sender ){
      locale.warn(sender, "${msg.not_player}");
      return false;
    }
    return true;
  },

  owner: function( warpname, sender ) {
    var UUID = sender.getUniqueId();
    if( store.warps[warpname].UUID != UUID ){
      locale.warn(sender, "${msg.not_owner}", {name: warpname});
      return false;
    }
    return true;
  }
}



var warps = { 
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
      return locale.warn(sender, "${msg.warp_data_error}", {name: warpname});

    var warpLoc = utils.locationFromJSON( loc );

    if( teleport.teleport(sender, warpLoc) )
      eventex.events.emit("onPlayerWarped",{
        player: sender,
        warp: warp,
        warpname: warpname
      });

  },

  set: function( warpname, sender ) {
    var permission = permissions.getUserPermissions(sender);
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


    
    
    var warp_max = permission.getParam("last_warp.max")
    if( store.players[UUID].count >= warp_max  )
      return locale.warn(sender, "${msg.warp_reg_limit}", {limit: warp_max});
   
    store.warps[warpname] = {}
    store.warps[warpname].UUID = ''+UUID;
    store.warps[warpname].owner = sender.name;
    store.warps[warpname].public = true;
    store.warps[warpname].loc = utils.locationToJSON( loc );

    store.players[UUID].count += 1;
    locale.warn(sender, "${msg.warp_reg_success}", {name: warpname});
  },

  remove: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var loc = sender.location;

    if( !test.warp(warpname, sender) )
      return locale.warn(sender, "${msg.warp_name_epsent}", {name: warpname});

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return locale.warn(sender, "${msg.warp_name_epsent}", {name: warpname});

    if( !test.owner(warpname, sender) )
      return locale.warn(sender, "${msg.not_owner}", {name: warpname});

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

    locale.warn(sender, "${msg.warp_del_success}", {name: warpname});
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
    locale.warn(sender, "${msg.warp_now_opened}", {name: warpname});
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
    locale.warn(sender, "${msg.warp_now_closed}", {name: warpname});
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

  if ( !permission || !permission.isPermission || !permission.isPermission("last_warp.warp") ){
    locale.warn(sender, "${msg.warp_deny}");
    if ( permission && permission.isPermission && permission.isPermission("last_warp.sign.use") )
      locale.warn(sender, "${msg.sign_allow}");
    return;
  }
  warps.go( params[1], sender );
};

// обработчик команды /warp help
function cmd_warp_help(params , sender){
  locale.help( sender,  "${help}" );
};

// обработчик команды /warp set
// permission: last_warp.manage
function cmd_warp_set(params , sender){
  var permission = permissions.getUserPermissions(sender);

  if ( !permission.isPermission("last_warp.manage") )
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  warps.set( params[2], sender );
};

// обработчик команды /warp remove
// permission: last_warp.manage
function cmd_warp_remove(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.manage") )
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  warps.remove( params[2], sender );
};

// обработчик команды /warp public
// permission: last_warp.access
function cmd_warp_public(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.access") )
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  warps.open( params[2], sender );
};

// обработчик команды /warp private
// permission: last_warp.access
function cmd_warp_private(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.access") )
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  warps.close( params[2], sender );
};

// обработчик команды /warp list
// permission: last_warp.warp || last_warp.sign.place
function cmd_warp_list(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.warp") && !permission.isPermission("last_warp.sign.place"))
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  var opened = Object.keys(warps.list(sender)).sort();
  if ( opened.length == 0 )
    return locale.warn(sender, "${msg.warp_epsent_opened}");
  locale.warn(sender, "${msg.warp_opened}" + opened.join(" "));
};


// обработчик команды /warp listall
// permission: last_warp.moderator
function cmd_warp_listall(params , sender){
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_warp.moderator") )
    return locale.warn(sender, "${msg.warp_cmd_deny}");

  var opened = Object.keys(warps.listall(sender)).sort();
  if ( opened.length == 0 )
    return locale.warn(sender, "${msg.warp_epsent_registered}");
  locale.warn(sender, "${msg.warp_registered}" + opened.join(" "));
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

