/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Интерфейс для работы с локалями
 *
 * Данный модуль содержит в себе основные функции загрузки локализаций.
 *
 * **зависимости:**
 *
 * @module last/locales
 *
 * @example
 *
 * //   подключаем модуль
 * var  locales = require('last/locales');
 *
 * // загружаем локаль. первый параметр - путь, второй - название модуля, третий - язык модуля по умолчанию
 * var locale = locales.init("./scriptcraft/data/locales/plugins/skills/", "growl_skill", Skill.locale);
 *
 * // отправка сообщений
 * // предположим что в файле локализации значение для ключа "msg.key" будет "123"
 * locale.print(sender, "bla-bla ${msg.key} bla-bla" ); // выведет игроку sender сообщение "bla-bla 123 bla-bla"
 * locale.print(sender, ["bla-bla","${msg.key}","bla-bla"] ); // выведет игроку sender сообщение "bla-bla 123 bla-bla"
 *
 * locale.print(sender, "bla-bla ${msg.key} bla-bla ${msg.key}" ); // выведет игроку sender сообщение "bla-bla 123 bla-bla 123"
 * locale.print(sender, ["bla-bla","${msg.key}","bla-bla","${msg.key}"] ); // выведет игроку sender сообщение "bla-bla 123 bla-bla 123"
 *
 * locale.print(sender, "bla-bla ${msg.key} bla-bla" ); // выведет игроку sender сообщение "bla-bla 123 bla-bla"
 * locale.print([sender], "bla-bla ${msg.key} bla-bla" ); // выведет игроку sender сообщение "bla-bla 123 bla-bla"
 * locale.print({"1":sender}, "bla-bla ${msg.key} bla-bla" ); // выведет игроку sender сообщение "bla-bla 123 bla-bla"
 * locale.print("sender_nickname", "bla-bla ${msg.key} bla-bla" ); // выведет игроку sender_nickname сообщение "bla-bla 123 bla-bla" (если он онлайн)
 *
 * // более подробно ознакомится с возможностями модуля вы можете прочитав описание его функций.
 *
 */


 'use strict';
/*
 * Зависимости этого модуля:
 * - modiles/utils
 */

var utils = require('utils');
var find = require('find');
var color = require('last/color').color;

// назначем цвета для типов сообщений
var event_color = color("brightgreen","");
var echo_color = color("darkgreen","");
var warn_color = color("red","");
var help_color = color("aqua","");

/**
 * Функция создает объект с локалью
 * @param {string} path   путь к папке с локалями
 * @param {string} module имя модуля
 * @param {string} lang   язык по умолчанию
 * @return  {object}    Экземпляр класа Locales содержащий методы для работы со скилом
 */
exports.init = init;
function init(path, module, lang) {
	path = path.replace(/\/*$/,'/');
	module = module.replace(/\/+$/,'').replace(/^\/+/,'');

	var locale = new Locales(path, module, lang);
	return locale;
};



/**
 * Конструктор класса Locales. Инициализирует экземпляр класса загружая в него нужную локаль для указаного модуля
 * @constructor
 * @param {string} path   путь к папке с локалями
 * @param {string} module имя модуля
 * @param {string} lang   язык по умолчанию
 */
function Locales(path, module, lang) {
	// далее пересохраняем в объект данные о локали
	this.path = path;
	this.module = module;
	this.lang = lang;
	this.debug = false;
	// и загружаем ее
	this.locales = this.load(path, module, lang)||{};

}

/**
 * Функция устанавливает режим отладки. В этом режиме при отсутствии ключей будут вставлятся специальные уведомления
 * @param {boolean} value  true или false
 */
Locales.prototype.setDebugMode = function(value) {
	this.debug = value||false;
};


/**
 * Функция загружает указанную локаль
 * @param {string} path   путь к папке с локалями
 * @param {string} module имя модуля
 */
Locales.prototype.load = function(path, module) {

	this.fullpath = path+module+"/";
	//console.log("!!!!!!!! Locales load path: " + this.fullpath);
	var jsFiles = find(this.fullpath, function(dir,name){
	    return name.match(/\.json$/);
	    //return "1",name.replace(/^.*?\/(\w+)\.json$/,"$1");
	});
	var locales = {};
	for(var i in jsFiles){
		var key = jsFiles[i].replace(/^.*?\/(\w+)\.json$/,"$1")
		var data = scload(this.fullpath+key+".json");
		locales[key] = data;
	}
	//console.log("\n\n\n!!!!!!!! Locales load files " + JSON.stringify(locales) );
	return locales;
};



/**
 * Функция ищет фразу по ключу для указанного языка, если язык не указан или остутствует локализация, используется язык указанный в this.lang
 * @param {string} key 	комплексный ключ к нужной фразе
 * @param {string} lang язык по умолчанию
 */
Locales.prototype.findMsg = function(msgkey, lang, keys) {
	if(!lang) lang = this.lang;

	if(!this.locales[lang] )
		lang = this.lang;

	if(!this.locales[lang] )
		return "(file epsent for ["+lang+"] languages)";

	var point = this.locales[lang];

	var point_keys = msgkey.split(/\./);

	while(point_keys.length){
		var key = point_keys.shift();
		if(!point[key] )
			return "(Key ["+msgkey+"] is epsent in ["+lang+"] file)";
		point=point[key];
	}

	return this.recursiveParse(point,keys);
};

Locales.prototype.recursiveParse = function(point, keys) {
	if( typeof point === "object" ){
		var str = "";
		for (var i in point){
			str += this.recursiveParse(point[i], keys);
		}
		return str;
	}

	if( typeof point === "function" )
		return "";

	return this.keysParse(point, keys);
}

Locales.prototype.keysParse = function(str, keys) {
	var self = this;
	var text = ""+str;
	return text.replace(/\$\{(.*?)\}/g, function(str1,key) {
		return self.findKey(key, keys);
	});
}

Locales.prototype.findKey = function(key,point){
	var p = point;

	if(!p || typeof p !== "object"){
		if(self.debug)
			return "(keys object undefined)";
		return "";
	}

	var keys = key.split(/\./);

	while(keys.length){
		var k = keys.shift();
		if(!p[k] )
			return "(Key ["+key+"] is epsent in object )";
		p=p[k];
	}

	if( !p){
		if(self.debug)
			return "(key:"+key+" undefined in object)";
		return "";
	}
	if( typeof p === "object" ){
		if( Array.isArray(p) ){
			return p.join(", ");
		}else{
			return Object.keys(p).join(", ");
		}
	}
	return p;
}

/**
 * Функция определяет локализацию игрока(игроков) и отправляет им сообщение в родной для игрока локализации
 * @param  {object} player  строка с именем или объект игрока, или массив строк или объектов, или ассоциатывный массив строк или объектов
 * @param  {string} message строка или массив строк, может содержать спец вставки типа"${комплексный.ключ}" которые будут заменены на значения из файла локализации
 */
Locales.prototype.print = function(player,message) {
	var users = {};
	if(typeof player === 'string'){
		var user = utils.player(player);
		users[user.name] = user;
	}
	if(typeof player === 'object'){
		if( player.name ){
			users[player.name] = player;
		}else{
			for(var i in player){
				var p = player[i];
				if( typeof p === 'string' )
					p = utils.player(p);
				if(p && p.name )
					users[p.name] = p;
			}
		}
	}

	var messages = [];
	if(typeof message === 'string'){
		messages.push(message);
	}
	if(typeof message === 'object'){
		if( Array.isArray(message) ){
			messages = message;
		}else{
			for(var i in message){
				messages.push(message[i]);
			}
		}
	}
	message = messages.join(" ");

	for(var i in users){
		this.sendMsg(users[i], message);
	}



};
/**
 * функция .....
 * @param  {[type]} player  [description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
Locales.prototype.sendMsg = function(player,message) {
	if(!player || !player["name"] )
		return;

	if(!message || typeof message !== 'string' )
		return;

	var sender_lang = this.lang;
	if( player.spigot ){
	   sender_lang = player.spigot().getLocale().toString();
	}else{
		//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+player.name);
	}
	// заменить каждое вхождение "ой" на результат вызова функции
    var self = this;
	var msg = message.replace(/\$\{(.*?)\}/g, function(str,key) {
  		return self.findMsg(key,sender_lang);
	});
	if( player.sendMessage )
		echo(player,msg);

}

/**
 * функция .....
 * @param  {[type]} player  [description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
Locales.prototype.getMessage = function(player, message, keys) {
	if(!message || typeof message !== 'string' )
		return "";

	var args = Array.prototype.slice.call(arguments, 2);

	var sender_lang = this.lang;
	if( player.spigot )
	   sender_lang = player.spigot().getLocale().toString();

	// заменить каждое вхождение "ой" на результат вызова функции
    var self = this;
	var msg = message.replace(/\$\{(.*?)\}/g, function(str,key) {
  		return self.findMsg(key, sender_lang, keys);
	});
	return msg;
}

Locales.prototype.printf = function(player, color, message, keys) {
	if( !player && !player["name"] )
		return;

	var users = {};
	if(typeof player === 'string'){
		var user = utils.player(player);
		users[user.name] = user;
	}
	if(typeof player === 'object'){
		if( player.name ){
			users[player.name] = player;
		}else{
			for(var i in player){
				var p = player[i];
				if( typeof p === 'string' )
					p = utils.player(p);
				if(p && p.name )
					users[p.name] = p;
			}
		}
	}

	var messages = [];
	if(typeof message === 'string'){
		messages.push(message);
	}
	if(typeof message === 'object'){
		if( Array.isArray(message) ){
			messages = message;
		}else{
			for(var i in message){
				messages.push(message[i]);
			}
		}
	}
	message = messages.join(" ");

	if(!message || typeof message !== 'string' )
		return;

	for(var i in users){
		var msg = this.getMessage(users[i], message, keys);
		this.sendMsg(users[i], color + msg);
	}
}

Locales.prototype.echo = function(player, message, keys) {
	this.printf(player,echo_color,message, keys);
}
Locales.prototype.warn = function(player, message, keys) {
	this.printf(player,warn_color,message, keys);
}
Locales.prototype.event = function(player, message, keys) {
	this.printf(player,event_color,message, keys);
}
Locales.prototype.help = function(player, message, keys) {
	this.printf(player,help_color,message, keys);
}




