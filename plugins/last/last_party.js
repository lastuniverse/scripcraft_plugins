/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * Плагин для создания и управления ПАТИ игроков. Пати предназначены для выполнения групповых миссий и участия в групповых эвентах
 * 
 * ## Возможности:
 * - Создание пати.
 * - Удаление пати.
 * - Смена лидера пати.
 * - Установка/снятие пароля на вход в пати.
 * - Добавление/удаление игроков.
 * 
 * ## Команды
 * - `/party help` : эта справка.
 * - `/party create {name} {max} {description}` : создать пати с названием `{name}`. `{max}` - максимальное количество игроков. `{description}` - описание пати.
 * - `/party remove {name}` : распустить пати с названием `{name}`.
 * - `/party protect {name}` : закрыть паролем вход в пати с названием `{name}`.
 * - `/party public {name}` : разрешить всем игрокам вход в пати с названием `{name}`.
 * - `/party leader {name} {player}` : назначить игрока `{player}` новым лидером пати с названием `{name}`.
 * - `/party invite {name} {player}` : пригласить игрока `{player}` в пати с названием `{name}`.
 * - `/party kick {name} {player}` : прогнать игрока `{player}` из пати с названием `{name}`.
 * - `/party accept {name}` [password] : принять приглашение вступить в пати с названием `{name}`. Если пати закрытая - Вам понадобится пароль `[password]`.
 * - `/party leave {name}` : покинуть пати с названием `{name}`.
 * - `/party info` : показать информацию о пати членом которой вы являетесь.
 * - `/party info {name}` : показать информацию о пати с названием `{name}`.
 * - `/party list` : показать все пати в открытые для вступления.
 * - `@{...}` : написать сообщение `{...}` членам пати.
 * 
 * ## Файл конфигурации data/config/plugins/last/chat.json
 * - `locale` : Язык по умолчанию `ru_ru`
 * - `enable` : Включить/выключить плагин `true`/`false`
 * - `password` : Настройки генерации паролядля входа в пати. Включает подпункты:
 *   - `sumbols`: Набор символов из которых будет генерироватся пароль. По умолчанию "0123456789".
 *   - `length`: Длина генерируемого пароля. По умолчанию 5.
 * 
 * ## Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * (отсутствуют)
 * 
 * **Параметры:** *могут быть выставленны персонально для разных групп и отдельных пользователей*
 * (отсутствуют)
 * 
 * ## Важно
 * - Пользователь при создании пати автоматически становится его членом.
 * - Пользователь не может быть членом сразу нескольких пати.
 * - Если пати закрытая, то при отправке инвайта игроку на вступление в пати, ему так-же автоматически будет выслан пароль.
 * 
 * ## зависимости:
 * > - utils - стандартный модуль ScriptCraft
 * > - modules/last/party       - модуль управления пати. Пердставляет из себя программный API.
 * > - modules/last/locales     - модуль локализации.
 * > - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения.
 * > - plugins/last/last_chat   - плагин управления чатами.
 * 
 * @module last/last_paty
 *
 * @example
 *
 */


'use strict';

var utils = require('utils');
var party = require('last/party');
var locales = require('last/locales');
var completer = require('last/completer');
var chat = require('./scriptcraft/plugins/last/last_chat.js');






chat.registerChat("party", "#", "Чат для пати",
	function(msg){
	//console.log("!!!!!!!!!! registerChat #");

	//msg.player.color = "".indigo();
	msg.message.color = "".gray();
	msg.chat = {
		icon: "●",//➟
		color: "".indigo()
	}

	var p = party.getPartyForUser(msg.sender);
	if(!p)
		return;
	var players = [];
	for(var i in p.players){
		var player = utils.player(i);
		if(player)
			players.push(player);
	}

	chat.broadcastMsg(msg, players);
});



// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/party.json");
if(!config.enable)
	return; // console.log("plugins/last/last_party DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_party", config.locale||"ru_ru");



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

function partyForOwner(user){
	var list = {};
	var p = party.getPartyForOwner(user);
	if( p )
		list[p.name]=true;
	return list;
}

function partyForUser(user){
	var list = {};
	var p = party.getPartyForUser(user);
	if( p )
		list[p.name]=true;
	return list;
}

var point_chat = completer.addPlayerCommand('p', cmd_party_chat);

function cmd_party_chat( params, sender ) {
	var p = party.getPartyForUser(sender);
	if(!p)
		return;

	var list = [];
	for(var i in p.players){
		var player = utils.player(i);
		if(player)
			list.push(player);
	}
	var msg = "<"+p.name+" : "+sender.name + "> "+ params.slice(1).join(" ");
	locale.echo( list,  msg );
};

var point_party = completer.addPlayerCommand('party');
    point_party.addComplete('help',cmd_party_help);

var point_info = point_party.addComplete('info', cmd_party_info, function(sender,patern){
						return party.getAllParty();
					})
					.addComplete('@any', cmd_party_info )


var point_create = point_party.addComplete('create')
					.addComplete('@any', cmd_party_create )
					.addComplete('@re/[0-9]+/', cmd_party_create)
					.addComplete('@any' , cmd_party_create);

var point_remove = point_party.addComplete('remove', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', cmd_party_remove);

var point_protect = point_party.addComplete('protect', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', cmd_party_protect);

var point_public  = point_party.addComplete('public', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', cmd_party_public);

var point_leader  = point_party.addComplete('leader', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', undefined, function(sender,patern){
						//console.log("!!! patern "+patern);
						return party.getPartyMembers(patern);
					})
					.addComplete('@any', cmd_party_leader);

var point_invite  = point_party.addComplete('invite', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any')
					.addComplete('@user', cmd_party_invite);

var point_kick    = point_party.addComplete('kick', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', undefined, function(sender,patern){
						var p = party.getPartyForOwner(sender);
						return p.players;
					})
					.addComplete('@any', cmd_party_kick);

var point_accept  = point_party.addComplete('accept', undefined, function(sender,patern){
						return party.getUncomplatedParty();
					})
					.addComplete('@any', cmd_party_accept)
					.addComplete('@re/[0-9]+/', cmd_party_accept);

var point_leave   = point_party.addComplete('leave', undefined, function(sender,patern){
						return partyForOwner(sender);
					})
					.addComplete('@any', cmd_party_leave);

var point_list   = point_party.addComplete('list',cmd_party_list);

// var point_members= point_party.addComplete('members', undefined, function(sender,patern){
// 						return party.getAllParty();
// 					})
// 					.addComplete('@any', cmd_party_members);


// var farm_set = point_farm.addComplete('set')
// 						 .addComplete('@any',undefined,function(player){
// 						 	var permission = permissions.getUserPermissions(player);
// 						 	var mobs_allow = permission.getParam("last_farm.mobs");
// 						 	return mobs_allow;
// 						 })
// 						 .addComplete('@any',cmd_farm_set)
// 						 .addComplete('@re/[0-9]+/',cmd_farm_set);
//	farm_set.addComplete('@re/[0-9]+/',cmd_farm_set);







function cmd_party_help( params, sender ) {
	locale.help( sender,  "${help}" );
};
function cmd_party_create( params, sender ) {
	params = params.slice(2);
	var name = params.shift();
	var max = params.shift();
	var description = params.join(" ");
	party.createParty(sender, name, max, description );
};
function cmd_party_remove( params, sender ) {
	party.removeParty(sender, params[2]);
};
function cmd_party_protect( params, sender ) {
	party.protectParty(sender, params[2], true);
};
function cmd_party_public( params, sender ) {
	party.protectParty(sender, params[2], false);
};
function cmd_party_leader( params, sender ) {
	party.changePartyLeader(sender, params[2], params[3]);
};
function cmd_party_invite( params, sender ) {
	party.inviteToParty(sender, params[2], params[3]);
};
function cmd_party_kick( params, sender ) {
	party.kickFromParty(sender, params[2], params[3]);
};

function cmd_party_accept( params, sender ) {
	party.acceptParty(sender, params[2], params[3]);
};

function cmd_party_leave( params, sender ) {
	party.leaveParty(sender, params[2]);
};
function cmd_party_list( params, sender ) {
	var list = party.getUncomplatedParty();
	locale.warn(sender, "${msg.party_opened}" + Object.keys(list).map(function(o){
		var p = list[o];
		return p.name + " ("+p.owner+") "+Object.keys(p.players).length+"/"+p.maxplayers+ " - "+p.description;
	}).join("\n"));
};
function cmd_party_info( params, sender ) {
	if( params[2] ){
		var p = party.getParty(params[2]);
		if(p)
			return locale.warn(sender, "${msg.party_info}", p);
		locale.warn(sender, "${msg.party_is_epsent}", {name: params[2]} );
	}else{
		var p = party.getPartyForUser(sender);
		if(p)
			return locale.warn(sender, "${msg.party}", p);
		locale.warn(sender, "${msg.no_party}");
	}
};





