'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}

var MAX_WARP_COUNT = 4;

var completer = require('last/completer');
var color =  require('last/color').color;
var utils = require('utils');
var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var bkBukkit = org.bukkit.Bukkit;

var _store = {
    warps: { },
    players: { }
};

var redtext = color('red','');
/*
*/

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
    if( _store.warps[warpname] ){
      echo( sender, redtext + "варп " + warpname + " уже существует");
      return false;
    }

    return true;
  },

  warp_notpresent: function( warpname, sender) {
    if( !_store.warps[warpname] ){
      echo( sender, redtext + "варп " + warpname + " не существует");
      return false;
    }

    return true;
  },

  warp_public: function( warpname, sender) {
    if( !_store.warps[warpname].public ){
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
    var player = utils.player( sender );

    if( _store.warps[warpname].owner != player.name ){
      echo( sender, redtext + "варп " + warpname + " вам не принадлежит");
      return false;
    }
    return true;
  }
}



var warps =  plugin( 'last_warps', { 

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

    var player = utils.player( sender );
    var loc = player.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.warp_public(warpname, sender) && !test.owner(warpname, sender) )
      return;


    loc = _store.warps[warpname].loc;

    if ( !loc ) {
      echo( sender, redtext + "данные о варпе " + warpname + " повреждены");
      return;
    }

    var warpLoc = utils.locationFromJSON( loc );
    player.teleport(warpLoc, bkTeleportCause.PLUGIN);
    echo( sender, redtext + "вы успешно перемещены на варп " + warpname);

  },

  set: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var player = utils.player( sender );
    var loc = player.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_present(warpname, sender) )
      return;
    
    if( _store.players[player.name] >= MAX_WARP_COUNT  ){
      echo( sender, redtext + player.name + " вы уже зарегестрировали мацсимально допустимое количество варпов");
      return;
    }

    _store.warps[warpname] = {
      owner: player.name,
      public: true,
      loc: utils.locationToJSON( loc )
    };

    if( _store.warps[player.name] ){
      _store.players[player.name] += 1;
    }else{
      _store.players[player.name] = 1;
    }

    echo( sender, redtext + "варп " + warpname + " успешно зарегестрирован");
  },


  remove: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var player = utils.player( sender );
    var loc = player.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    if( _store.warps[player.name] ){
      _store.warps[player.name] -= 1;
    }else{
      _store.warps[player.name] = 0;
    }

    delete _store.warps[warpname];

    echo( sender, redtext + "варп " + warpname + " успешно удален");
  },

  /* ========================================================================
   social functions
   ======================================================================== */

  open: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var player = utils.player( sender );
    var loc = player.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    _store.warps[warpname].public = true;

    echo( sender, redtext + "варп " + warpname + " открыт для публичного доступа");
  },

  close: function( warpname, sender ) {
    if( !test.player(sender) )
      return;

    var player = utils.player( sender );
    var loc = player.location;

    if( !test.warp(warpname, sender) )
      return;

    warpname = warpname.toLowerCase();

    if( !test.warp_notpresent(warpname, sender) )
      return;

    if( !test.owner(warpname, sender) )
      return;

    _store.warps[warpname].public = false;
    
    echo( sender, redtext + "варп " + warpname + " теперь закрыт для публичного доступа");
  },
  
  /* 
   list warps which the player can visit
   */
  list: function( ) {
    var result = {};
    for ( var warp in _store.warps ) {
      if( _store.warps[warp].public )
        result[warp] = true;
    }
    return result;
  },

  list_by_owner: function( owner ) {
    var result = {};
    for ( var warp in _store.warps ) {
      if( _store.warps[warp].owner == owner )
        result[warp] = true;
    }
    return result;
  },

  /* ========================================================================
   admin functions
   ======================================================================== */
  listall: function( ) {
    var result = {};
    for ( var warp in _store.warps ) {
        result[warp] = true;
    }
    return result;
  },
  store: _store
}, true );



exports.warps = warps;

var optionList = [];

/*
 Expose a set of commands that players can use at the in-game command prompt
 */


function cmd_warp_goto( params , sender) {
  warps.go( params[0], sender );
};
exports.goto_warp = cmd_warp_goto;


function cmd_warp( params , sender) {
  warps.go( params[1], sender );
};
function cmd_warp_help(params , sender){
  echo( sender,  redtext + warps.help() );
};
function cmd_warp_set(params , sender){
  warps.set( params[2], sender ); 
};
function cmd_warp_remove(params , sender){
  warps.remove( params[2], sender );
};
function cmd_warp_public(params , sender){
    warps.open( params[2], sender );
};
function cmd_warp_private(params , sender){
    warps.close( params[2], sender );
};
function cmd_warp_list(params , sender){
  var opened = Object.keys(warps.list(sender)).sort();
  if ( opened.length == 0 ) {
    echo( sender, redtext + "в настоящее время нет ни одного варпа открытого для посещений");
    return;
  } else {
    echo( sender, redtext + "вы можете посетить эти варпы: " + opened.join(" "));
  }
};
function cmd_warp_listall(params , sender){
  var opened = Object.keys(warps.listall(sender)).sort();
  if ( opened.length == 0 ) {
    echo( sender, redtext + "в настоящее время не зарегестрированно ни одного варпа");
    return;
  } else {
    echo( sender, redtext + "зарегестрированние варпы: " + opened.join(" "));
  }
}


function myWarps(sender,patern){ return completer.customFindCompletions(patern, warps.list_by_owner(sender.name)) };
function publicWarps(sender,patern){ return completer.customFindCompletions(patern, warps.list(sender.name)) };
//

var warp = completer.addPlayerCommand('warp',cmd_warp_list,publicWarps);
    warp.addComplete('help',cmd_warp_help);
    warp.addComplete('set')
        .addComplete('@any',cmd_warp_set);
    warp.addComplete('remove',undefined,myWarps)
        .addComplete('@any',cmd_warp_remove);
    warp.addComplete('public',undefined,myWarps)
        .addComplete('@any',cmd_warp_public);
    warp.addComplete('private',undefined,myWarps)
        .addComplete('@any',cmd_warp_private);
    warp.addComplete('list',cmd_warp_list);
    warp.addComplete('listall',cmd_warp_listall);
    warp.addComplete('@any',cmd_warp);

