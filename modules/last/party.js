/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Интерфейс для регистрации игроков в пати
 *
 *
 * **зависимости:**
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/users - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * - modules/last/locales     - модуль локализации
 *
 * @module last/paty
 *
 * @example
 * //   подключаем модуль
 * var  containers = require('last/party');
 *
 */


'use strict';

var utils = require('utils');
var users = require('last/users');
var locales = require('last/locales');

// Глобальный для всех скилов евент эмиттер
// var Events = new Eventemitter();

// загружаем config
var config = scload("./scriptcraft/data/config/modules/last/party.json");
if(!config.enable)
  return console.log("plugins/last/last_chestshop  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/modules/last/", "party", config.locale||"ru_ru");


var parties = persist('data/modules/last/parties', {
	list: {}
});

/*
	+ создать пати
	- завершить пати
	+ сделать пати публичным/закрытым
	+ установить пароль на пати
	+ сменить лидера пати
	+ пригласить в пати
	+ выгнать из пати
	+ вступить в пати
	+ выйти из пати
	- получить список членов пати
	- статистика в пати
	+ получить пати по названию
	+ получить все имеющиеся на сервере пати
	+ получить все имеющиеся на сервере пати в которых открыт набор участников
	+ получить все имеющиеся на сервере пати в которых уже закрыт набор участников
	+ функция генерации пароля
 */


exports.createParty = createParty;
function createParty(username, partyname, maxplayers, description, pub){
	var player = utils.player(username);
	if( !player )
		return locale.warn(player,"${msg.no_player}");

	var p = getPartyForOwner(username);
	if( p )
		return locale.warn(player,"${msg.you_is_owner_1}",{name: p.name});

	p = getPartyForUser(username);
	if( p )
		return locale.warn(player,"${msg.you_is_member_1}",{name: p.name});

	if( !partyname || typeof partyname !== "string" || partyname.length < 3 )
		return locale.warn(player,"${msg.no_partyname}");

	if( parties.list[partyname] )
		return locale.warn(player,"${msg.party_exist}",{name: partyname});

	if( !maxplayers || maxplayers<2 )
		return locale.warn(player,"${msg.no_maxplayers}");

	var UUID = ''+player.getUniqueId();

	var players = {};
	players[player.name] = {
		name: player.name,
		UUID: UUID,
		kills: 0,
		score: 0
	};

	parties.list[partyname] = {
		owner: player.name,
		UUID: UUID,
		status: "opened",
		name: partyname,
		description: (description||"undescription"),
		maxplayers: maxplayers,
		password: (pub ? false : generatePassword() ),
		players: players
	};
	locale.warn(player,"${msg.create_successfully}");
}

exports.protectParty = protectParty;
function protectParty(username,partyname,protect){
	var isOwner = testPartyLeader(username, partyname)
	if( !isOwner )
		return;

	var player = utils.player(username);
	var UUID = ''+player.getUniqueId();

	if( !protect ){
		delete parties.list[partyname].password;
		return locale.warn(player,"${msg.party_published}",{name: partyname});
	}

	var pass = generatePassword();
	parties.list[partyname].password = pass;
	locale.warn(player,"${msg.party_protected}",{name: partyname, pass: pass});

}

exports.generatePassword  = generatePassword;
function generatePassword() {
    var length = config.password.length,
        charset = config.password.sumbols;
    var retVal = "";
    var len = charset.length;
    for (var i = 0; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * len));
    }
    console.log("!!!! PASS: ["+retVal+"]");
    return retVal;
}

exports.testPartyLeader  = testPartyLeader;
function testPartyLeader(username, partyname) {
	var player = utils.player(username);
	if( !player ){
		locale.warn(player,"${msg.no_player}");
		return false;
	}

	if( !partyname || typeof partyname !== "string" || partyname.length < 3 ){
		locale.warn(player,"${msg.no_partyname}");
		return false;
	}

	if( !parties.list[partyname] ){
		locale.warn(player,"${msg.party_no_exist}",{name: partyname});
		return false;

	}

	var UUID = ''+player.getUniqueId();
	if( parties.list[partyname].UUID != UUID ){
		locale.warn(player,"${msg.no_owner}");
		return false;
	}
	return true;
}


exports.getPartyForOwner  = getPartyForOwner;
function getPartyForOwner(username) {
	var list = false;

	var player = utils.player(username);
	if( !player )
		return list;

	var UUID = ''+player.getUniqueId();
	for( var i in parties.list ){
		var party = parties.list[i];
		if( UUID == party.UUID )
			return party;
	}
    return list;
}

exports.getPartyForUser  = getPartyForUser;
function getPartyForUser(username) {
	var list = false;

	var player = utils.player(username);
	if( !player )
		return list;

	var UUID = ''+player.getUniqueId();
	for( var i in parties.list ){
		var party = parties.list[i];
		if( party.players[player.name] && party.players[player.name].UUID == UUID )
			return party;
	}
    return list;
}

exports.getPartyMembers  = getPartyMembers;
function getPartyMembers(partyname) {
	if( !partyname || typeof partyname !== "string" || partyname.length < 3 )
		return {};

	if( !parties.list[partyname] )
		return {};

    return parties.list[partyname].players;
}

exports.getParty  = getParty;
function getParty(partyname) {
	if( !partyname || typeof partyname !== "string" || partyname.length < 3 )
		return false;

	if( !parties.list[partyname] )
		return false;

    return parties.list[partyname];
}

exports.getAllParty  = getAllParty;
function getAllParty() {
    return parties.list;
}

exports.getUncomplatedParty  = getUncomplatedParty;
function getUncomplatedParty() {
	var list = {};
	for (var i in parties.list ) {
		var party = getParty(i);
		if( party && party.status === "opened" )
			list[i]=party;
	}
    return list;
}

exports.getComplatedParty  = getComplatedParty;
function getComplatedParty() {
	var list = {};
	for (var i in parties.list ) {
		var party = getParty(i);
		if( party && party.status === "closed" )
			list[i]=party;
	}
    return list;
}

exports.changePartyLeader = changePartyLeader;
function changePartyLeader(username,partyname,leadername){
	var isOwner = testPartyLeader(username, partyname)
	if( !isOwner )
		return;

	var player = utils.player(username);
	var UUID = ''+player.getUniqueId();

	var leader = utils.player(leadername);
	if( !leader )
		return locale.warn(player,"${msg.no_player}");

	var party = getParty(partyname);

	if( !party.players[leader.name] )
		return locale.warn(player,"${msg.no_member}",{playername: leader.name, name: partyname});



	var l_UUID = ''+leader.getUniqueId();
	parties.list[partyname].owner = leader.name;
	parties.list[partyname].UUID = l_UUID;

	for(var i in party.players){
		var p = utils.player(i);
		if(p)
			locale.warn(p,"${msg.change_leader_success}",{playername: leader.name, name: partyname});
	}

}


exports.inviteToParty = inviteToParty;
function inviteToParty(username,partyname,addplayer){
	var isOwner = testPartyLeader(username, partyname)
	if( !isOwner )
		return;

	var player = utils.player(username);
	var party = getParty(partyname);

	var newplayer = utils.player(addplayer);
	if( !newplayer )
		return locale.warn(player,"${msg.no_player}");

	if( parties.list[partyname].players[newplayer.name] )
		return locale.warn(player,"${msg.member_exist}",{playername: newplayer.name, name: partyname});

	locale.warn(newplayer,"${msg.invite}",{leader: player.name, name: partyname, pass: party.password});
	locale.warn(player,"${msg.invite_success}",{playername: newplayer.name, name: partyname});
}

exports.kickFromParty = kickFromParty;
function kickFromParty(username,partyname,addplayer){
	var isOwner = testPartyLeader(username, partyname)
	if( !isOwner )
		return;

	var player = utils.player(username);
	var UUID = ''+player.getUniqueId();
	var party = getParty(partyname);

	var newplayer = utils.player(addplayer);
	var n_UUID = undefined;
	if( !newplayer ){
		newplayer = users.getPlayer(addplayer);
		n_UUID = users.getUUIDByName(addplayer);
	}else{
		n_UUID = ''+newplayer.getUniqueId()
	}

	if( !newplayer || !n_UUID )
		return locale.warn(player,"${msg.no_player}");

	if( UUID == n_UUID )
		return locale.warn(player,"${msg.is_owner}");

	if( !parties.list[partyname].players[newplayer.name] )
		return locale.warn(player,"${msg.no_member}",{playername: newplayer.name, name: partyname});

	delete parties.list[partyname].players[newplayer.name];
	locale.warn(newplayer,"${msg.kiсk}",{leader: player.name, name: partyname, pass: party.password});
	locale.warn(player,"${msg.kisk_success}",{playername: newplayer.name, name: partyname});
}

exports.acceptParty = acceptParty;
function acceptParty(username, partyname, password){
	var player = utils.player(username);
	if( !player )
		return locale.warn(player,"${msg.no_player}");

	var p = getPartyForOwner(username);
	if( p )
		return locale.warn(player,"${msg.you_is_owner_2}",{name: p.name});

	p = getPartyForUser(username);
	if( p )
		return locale.warn(player,"${msg.you_is_member_2}",{name: p.name});


	if( !partyname || typeof partyname !== "string" || partyname.length < 3 )
		return locale.warn(player,"${msg.no_partyname}");

	if( !parties.list[partyname] )
		return locale.warn(player,"${msg.party_no_exist}",{name: partyname});

	var party = parties.list[partyname];
	if( party.players[player.name] )
		return locale.warn(player,"${msg.is_member}",{playername: player.name, name: partyname});

	if( party.password && !password )
		return locale.warn(player,"${msg.no_password}",{name: partyname});

	if( party.password && party.password !== password )
		return locale.warn(player,"${msg.party_no_exist}",{name: partyname});

	for(var i in party.players){
		var p = utils.player(i);
		if(p)
			locale.warn(p,"${msg.new_accept}",{playername: player.name, name: partyname});
	}

	var UUID = ''+player.getUniqueId();
	party.players[player.name] = {
		name: player.name,
		UUID: UUID,
		kills: 0,
		score: 0
	};

	locale.warn(player,"${msg.accept}",{name: partyname});
}

exports.leaveParty = leaveParty;
function leaveParty(username, partyname){
	var player = utils.player(username);
	if( !player )
		return locale.warn(player,"${msg.no_player}");

	if( !partyname || typeof partyname !== "string" || partyname.length < 3 )
		return locale.warn(player,"${msg.no_partyname}");

	if( !parties.list[partyname] )
		return locale.warn(player,"${msg.party_no_exist}",{name: partyname});

	var party = parties.list[partyname];
	if( !party.players[player.name] )
		return locale.warn(player,"${msg.is_no_member}",{playername: player.name, name: partyname});

	var UUID = ''+player.getUniqueId();

	if( UUID == party.UUID )
		return locale.warn(player,"${msg.is_owner}");


	delete parties.list[partyname].players[player.name];

	var players = parties.list[partyname].players;
	for(var i in players){
		var p = utils.player(i);
		if(p)
			locale.warn(p,"${msg.new_leave}",{playername: player.name, name: partyname});
	}
	locale.warn(player,"${msg.leave}",{name: partyname});
}


exports.removeParty = removeParty;
function removeParty(username, partyname){
	var isOwner = testPartyLeader(username, partyname)
	if( !isOwner )
		return;

	var player = utils.player(username);

	var players = parties.list[partyname].players;
	for(var i in players){
		var p = utils.player(i);
		if(p)
			locale.warn(p,"${msg.remove_party}",{name: partyname});
	}

	delete parties.list[partyname];
	locale.warn(player,"${msg.remove}",{name: partyname});
}
