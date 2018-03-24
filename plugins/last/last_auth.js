/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин аутентификации
 * 
 * Добавляет аутентификацию командами при работе сервера в offline mode:
 *
 * ### Команды
 *
 * - базовые команды
 *   - /auth help : вывести справку
 *   - /auth {youpassword} {youpassword} : зарегестрироватся под текущим ником с паролем {youpassword} указанным 2 раза
 *   - /auth {youpassword} : войти под текущим ником с паролем {youpassword}
 *   - /auth password {youpassword} {newpassword} : сменить ваш пароль с {youpassword} на {newpassword}
 *   - /auth remove {youpassword} : удалить регистрацию под текущим ником с паролем {youpassword}
 *   
 * ### Настройки модуля modules/last/permissions
 * 
 * ***Права доступа:***
 * - last_auth.auth - разрешение на регистрацию/аутентификацию.
 * - last_auth.password - смена пароля
 * - last_auth.remove - удаление аккаунта
 *
 * ***Параметры:***
 * 
 * ### Регистрация/аутентификация
 * - при входе в игру ввести команду /auth {вашпароль}
 *
 * ### Удаление учетной записи
 * - ввести команду /auth remove {вашпароль}
 * 
 * ### Важно
 *  Ни кому не говорите ваш пароль
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - slash - стандартный модуль ScriptCraft
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/locales     - модуль локализации
 * - modules/last/teleport    - модуль обеспечивающий единый интерфейс телепортации, имееб настройки цены телепортации
 * - modules/last/timetools   - модуль для работы со таймером
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * 
 * @module plugins/last/last_auth
 */


'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}

var utils = require('utils');
var slash = require('slash');
var users = require('last/users');
var eventex = require('last/eventex');
var locales = require('last/locales');
var teleport = require('last/teleport');
var timetools = require('last/timetools');
var completer = require('last/completer');
var permissions = require('last/permissions');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/auth.json");
if(!config.enable)
	return console.log("plugins/last/last_auth DISABLED");;

var modulename = "last_auth";

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_auth", config.locale||"ru_ru");


/**
 * запускает функцию, требующую авторизации
 */
eventex.events.on("onPlayerJoin", function ( event ) {
	var user = event.player;
	onNewPlayer(user);
});

/**
 * 
 */
function onNewPlayer(user){
	var player = users.getPlayer(user);
	var loc = user.location;

	Spectrator(user);
	addRecord(player);
    
	if( player.data[modulename].loc ){
		loc = utils.locationFromJSON( player.data[modulename].loc );;
		teleport.freeTeleport(user, loc);
	}else{
		player.data[modulename].loc = utils.locationToJSON( user.location );
	}

	player.data[modulename].isAuth = false;

	
	
	if( !player.data[modulename].isRegisted ){
		locale.warn( user, "${msg.register}");
	}else{
		locale.warn( user, "${msg.identify}", { time: config.timeout } );
	}

	// 	Отправляет сообщение об оставшемся времени
	function next() { 
		//console.log("next");
		var time = timetools.now() - joinTime;
		var timeout = config.timeout-Math.floor(time/1000);
		locale.warn( user, "${msg.timeout}", { time: timeout } );
		teleport.freeTeleport(user, loc);
	}

	var joinTime = timetools.now();
	// 	Проверяет зарегестрировался/авторизировался ли пользователь, и продолжает цикл если время не вышло
	function hasNext() { 
		//console.log("hasNext");
		var timeout = timetools.now() - joinTime;
		if ( timeout >= config.timeout*1000 ){
			if( !player.data[modulename] || !player.data[modulename].isRegisted || !player.data[modulename].isAuth ){
				teleport.freeTeleport(user, loc);
				timetools.callAfterTime(function(){
					kickUser(user);
					delRecord(player);
				},500);
			}
			return false;
		}
		if( player.data[modulename] && player.data[modulename].isRegisted && player.data[modulename].isAuth )
			return false;	
		return true;
	}

	var self = this;
	utils.nicely( next, hasNext, function(){
		//console.log("callback");
		//locale.warn( user, "${msg.timeout}", { time: config.timeout } );
	}, config.refresh*1000 );	
}

/**
 * 
 */
function kickUser(user){
	var cmd = "kick "+user.name;
	slash(cmd);
}

/**
 * 
 */
function Spectrator(user){
	var cmd = "gamemode 3 "+user.name;
	slash(cmd);
}

/**
 * 
 */
function Survival(user){
	var cmd = "gamemode 0 "+user.name;
	slash(cmd);
}

/**
 * 
 */
function addRecord(player){
	if( !player.data[modulename] ){
		player.data[modulename] = { 
			password: "",
			isAuth: false,
			isRegisted: false
		};
	}else{
		player.data[modulename].isAuth = false;
	}
}
function delRecord(player){
	if( player && player.data && player.data[modulename] ){
		player.data[modulename].isAuth = false;
		player.data[modulename].isRegisted = false;
		player.data[modulename].password = "";
		//delete	player.data[modulename];
	}
	// delete	player.data[modulename];
}




/**
 * далее следуют обработчики команд
 */

function cmd_auth_help( params, sender ) {
  locale.help( sender,  "${help}" );
}

function cmd_auth_remove( params, sender ) {
	var user = users.getPlayer(sender);
	if( !user || !user.data  || !user.data[modulename])
		return locale.warn( sender, "${msg.no_userdata}");
	var pass = params[1];

	if( pass !== user.data[modulename].password )
		return locale.warn( sender, "${msg.pass_is_wrong}", {len: config.password.min});

	delRecord(user);

	locale.warn( sender, "${msg.undegister_comlete}");
	onNewPlayer(sender);
}

function cmd_auth_password( params, sender ) {
	var user = users.getPlayer(sender);
	if( !user || !user.data  || !user.data[modulename])
		return locale.warn( sender, "${msg.no_userdata}");
	var pass1 = params[2];
	var pass2 = params[3];

	if( pass1 !== user.data[modulename].password )
		return locale.warn( sender, "${msg.pass_is_wrong}", {len: config.password.min});


	if( pass2.length < config.password.min )
		return locale.warn( sender, "${msg.pass_is_smoll}", {len: config.password.min});

	if( pass2.length > config.password.max )
		return locale.warn( sender, "${msg.pass_is_large}", {len: config.password.max});

	user.data[modulename].password = pass2;
	locale.warn( sender, "${msg.password_comlete}");
}

function cmd_auth_identify( params, sender ) {
	var user = users.getPlayer(sender);
	if( !user || !user.data  || !user.data[modulename])
		return locale.warn( sender, "${msg.no_userdata}");
	var pass = params[1];

	if( pass !== user.data[modulename].password )
		return locale.warn( sender, "${msg.pass_is_wrong}", {len: config.password.min});

	var loc = utils.locationFromJSON( user.data[modulename].loc );;
	teleport.freeTeleport(sender, loc);
	Survival(sender);

	delete user.data[modulename].loc;
	user.data[modulename].isAuth = true;
	locale.warn( sender, "${msg.identify_comlete}");
}

function cmd_auth_register( params, sender ) {
	var user = users.getPlayer(sender);
	if( !user || !user.data  || !user.data[modulename])
		return locale.warn( sender, "${msg.no_userdata}");
	var pass1 = params[1];
	var pass2 = params[2];

	if( pass1 !== pass2 )
		return locale.warn( sender, "${msg.not_equal_pass}");

	if( pass1.length < config.password.min )
		return locale.warn( sender, "${msg.pass_is_smoll}", {len: config.password.min});

	if( pass1.length > config.password.max )
		return locale.warn( sender, "${msg.pass_is_large}", {len: config.password.max});

	var loc = utils.locationFromJSON( user.data[modulename].loc );;
	teleport.freeTeleport(sender, loc);
	delete user.data[modulename].loc;
	
	Survival(sender);
	user.data[modulename] = { 
		password: pass1,
		isAuth: true,
		isRegisted: true
	};
	locale.warn( sender, "${msg.register_comlete}");
};


/**
 * далее регистрируем команды
 */

var point_auth = completer.addPlayerCommand('auth');
    point_auth.addComplete('help',cmd_auth_help);
    point_auth.addComplete('remove',undefined)
			  .addComplete('@any', cmd_auth_remove);
    point_auth.addComplete('password',undefined)
			  .addComplete('@any',undefined)
			  .addComplete('@any', cmd_auth_password);
	point_auth.addComplete('@any', cmd_auth_identify)
			  .addComplete('@any', cmd_auth_register);

