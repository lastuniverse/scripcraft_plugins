'use strict';

/* Global requires */
var utils = require('utils');
var color =  require('last/color').color;
var eventex =  require('last/eventex');
var permissions = require('last/permissions');

var redtext = color('red','');


var users = persist('data/modules/last/users', {
  byName:{},
  byUUID:{}
});

var cache = {
  byName:{},
  byUUID:{}
};

exports.getAllUsers = getAllUsers;
function getAllUsers(){
  return users.byUUID;
}

exports.getUUIDByName = getUUIDByName;
function getUUIDByName(player_name){
  var UUID = cache.byName[player_name];
  if(!UUID){
  	UUID = users.byName[player_name];
  	cache.byName[player_name] = UUID;
  }
  return UUID;
}

exports.getDataByUUID = getDataByUUID;
function getDataByUUID(UUID){
  var data = cache.byUUID[UUID];
  if(!data){
  	data = users.byUUID[UUID];
  	cache.byUUID[UUID] = data;
  }
  return data;
}

exports.getPlayer = function(player_name){
  var player = utils.player( player_name );
  if( player ){
    var UUID = ''+player.getUniqueId();
    return {
      name: player.name,
      player: player,
      UUID: UUID,
      isOnline: true,
      isPresent: true,
      data: getDataByUUID(UUID),
      sendMsg: function(msg){
        echo( player, msg );
      }
    };
  }

  var ret = {
    name: player_name,
    isOnline: false,
    isPresent: false,
    data: {},
    sendMsg: function(msg){}
  }

  var	UUID = getUUIDByName(player_name);
  if( UUID ){
  	var data = getDataByUUID(UUID);
  	ret.name = data.name;
  	ret.isPresent = true;
  	ret.UUID = UUID;
  	ret.data = data;
  }

  return ret;
};


function onJoin( event ){
  var player = event.player;
  var UUID = ''+player.getUniqueId();
  users.byName[player.name]=UUID;
  cache.byName[player.name]=UUID;
  permissions.addUser(player);
  
  if( !users.byUUID[UUID] ){
    var money = 10000;
    cache.byUUID[UUID] = users.byUUID[UUID]={
    	name: player.name,
      coins: money
    };
    echo( player, redtext + 'Порывшись по своим карманам, вы нашли '+money+' случано завалявшихся коинов!' );  
  }
  eventex.events.emit("onPlayerJoin",event);
}
events.playerJoin( onJoin );