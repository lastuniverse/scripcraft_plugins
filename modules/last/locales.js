/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Interface for working with locales
 * This module contains the basic functions of downloading localizations and sending localized messages to users
 * @module modules/last/locales
 * @example
 * configuration file for the module locales.js: data/config/modules/locales.json
 * {
 * 	"enable": true,
 *     "default": "ru_ru", // default locale.
 *     "colors":{
 *     	"event":"brightgreen",	// the color of messages sent by the event function
 *     	"warn":"darkgreen",		// the color of messages sent by the warn function
 *     	"warn":"red",			// the color of messages sent by the warn function
 *     	"help":"aqua"			// the color of messages sent by the help function
 *     }
 * }
 * 
 * file with messages in English: data/locales/plugin/test/en_us.json
 * {
 * 	"msg":{
 * 		"test1": "test1 message",
 * 		"test2": "test3 message",
 * 	},
 * 	"help" [
 * 		"help1 message",
 * 		"help2 message"
 * 	],
 * 	"test": "test message ${key1} ${key2}"
 * }
 * 
 * file with messages in Russian: data/locales/plugins/test/ru_ru.json
 * {
 * 	"msg":{
 * 		"test1": "тест1 сообщение",
 * 		"test2": "тест2 сообщение",
 * 	},
 * 	"help" [
 * 		"хелп1 сообщение",
 * 		"хелп2 сообщение"
 * 	],
 * 	"test": "тест сообщение ${key1} ${key2}"
 * }
 * 
 * example of a plugin using locales.js: plugins/test.js
 *  
 * // connect the module
 * var  locales = require('last/locales');
 * // load the locale. The first parameter is the path, the second is the module name, the third is the default language of the plug-in
 * var locale = locales.init("./scriptcraft/data/locales/plugins/", "test", "ru_ru");
 * ...
 * 
 * // !!! suppose that the default locale of the plugin is "ru_ru". And the user in his minecraft client exposed English
 * locale.help(player,"${help}"); 
 * // output to chat:
 * //   <playername> help1 message
 * //   <playername> help2 message
 * locale.echo(player,"${msg.test1}"); 
 * // output to chat:
 * //   <playername> test1 message
 * locale.echo(player,"${msg.test2}"); 
 * // output to chat:
 * //   <playername> test2 message
 * locale.echo(player,"${test}",{"key1": 11111, "key2": "abcdef" }); 
 * // output to chat:
 * //   <playername> test message 11111 abcdef
 * 
 * locale.warn(player,"${help.0}"); 
 * // output to chat:
 * //   <playername> help1 message
 * locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc"); 
 * // output to chat:
 * //   <playername> aaa help1 message bbb test1 message ccc
 * locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc ${test} ddd",{"key1": 11111, "key2": "value of key2" }); 
 * // output to chat:
 * //   <playername> aaa help1 message bbb test1 message ccc test message 11111 value of key2 ddd
 * // if there is no localization file for the player's language, the messages will be displayed in the language specified when calling locales.init(...)
 * // locale.warn(...), locale.help(...), locale.echo(...) and locale.event(...) differ only in text messages, otherwise their functionality is identical.
 * // more details on the capabilities of the module, you can read the description of its functions.
 */


 'use strict';

var utils = require('utils');
var find = require('find');

// Loading config
var config = scload("./scriptcraft/data/config/modules/last/locales.json");
if(!config.enable)
  return console.log("modules/last/locales  DISABLED");;


/**
 * The function creates an object with a locales
 * @param {string} path    path to the folder with locales
 * @param {string} module  module name
 * @param {string} lang    default language
 * @return {object} A sample of the Locales class containing methods for working with skill 
 */
exports.init = init;
function init(path, module, lang) {
	lang=lang||config.default;
	path = path.replace(/\/*$/,'/');
	module = module.replace(/\/+$/,'').replace(/^\/+/,'');

	var locale = new Locales(path, module, lang);
	return locale;
};



/**
 * Constructor of class Locales. Initializes an instance of the class by loading all the locales for the specified module into it.
 * @constructor
 * @param {string} path    path to the folder with locales
 * @param {string} module  module name
 * @param {string} lang    default language
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
 * The function sets the debugging mode. In this mode, if there are no keys, special notifications will be inserted
 * @param {boolean} value  true/false
 */
Locales.prototype.setDebugMode = function(value) {
	this.debug = value||false;
};


/**
 * The function loads all available locales
 * @param {string} path     path to the folder with locales
 * @param {string} module   module name
 */
Locales.prototype.load = function(path, module) {

	this.fullpath = path+module+"/";
	var jsFiles = find(this.fullpath, function(dir,name){
	    return name.match(/\.json$/);
	});
	var locales = {};
	for(var i in jsFiles){
		var key = jsFiles[i].replace(/^.*?\/(\w+)\.json$/,"$1")
		var data = scload(this.fullpath+key+".json");
		locales[key] = data;
	}
	return locales;
};



/**
 * The function searches for a phrase by key for the specified language, if the language is not specified or there is no localization, the language specified in this.lang is used
 * @param {string} key  complex key to the desired phrase
 * @param {string} lang default language
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
 * the function sends a message message to the user {player} if it is online.
 * @param {object} player	Object containing player data, including the selected localization.
 * @param {string} message	message text.
 */
Locales.prototype.sendMsg = function(player,message) {
	if(!player || !player["name"] )
		return;

	if(!message || typeof message !== 'string' )
		return;

	if( player.sendMessage )
		echo(player,message);
}

/**
 * the function returns a message in the user's language (if there is a localization file for this language)
 * @param {object} player    Object containing player data, including the selected localization
 * @param {string} message   text, can contain special inserts of type "$ {complex .key}" which will be replaced with values from the localization file
 * @param {object} keys      associative array with values
 * @return {string} message in the user's language.
 */
Locales.prototype.getMessage = function(player, message, keys) {
	if(!message || typeof message !== 'string' )
		return "";

	var sender_lang = this.lang;
	if( player && player["spigot"] )
	   sender_lang = player.spigot().getLocale().toString();

	// заменить каждое вхождение ${key} на результат вызова функции
    var self = this;
	var msg = message.replace(/\$\{(.*?)\}/g, function(str,key) {
  		return self.findMsg(key, sender_lang, keys);
	});
	return msg;
}


/**
 * This function sends a message message to the user (users) player, after replacing all lines of the form $ {name} with values ​​of the associative array keys.
 * @param {string/object/array} player A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name
 * @param {string} color color. See scriptcraft/modules/utils/string-exts.js
 * @param {string/object/array} message is a string, an array or an associative array containing strings that can contain special inserts of type "$ {complex .key}" that will be replaced with values ​​from the localization file
 * @param {object} keys associative array with values
 */
Locales.prototype.printf = function(player, color, message, keys) {
	//console.log("printf:\t"+(typeof player) + "\t" + message + "\t" + (keys||"undef") );
	
	if( !player || (typeof player !== "object") || !player["name"] )
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
		this.sendMsg(users[i], ""[color]() + msg);
	}
}

/**
 * This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.
 * @param {string/object/array} player A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name.
 * @param {string/object/array} message is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file.
 * @param {object} keys associative array with values.
 */
Locales.prototype.echo = function(player, message, keys) {
	this.printf(player,config.colors.echo,message, keys);
}

/**
 * This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.
 * @param {string/object/array} player A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name.
 * @param {string/object/array} message is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file.
 * @param {object} keys associative array with values.
 */
Locales.prototype.warn = function(player, message, keys) {
	this.printf(player,config.colors.warn,message, keys);
}

/**
 * This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.
 * @param {string/object/array} player A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name.
 * @param {string/object/array} message is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file.
 * @param {object} keys associative array with values.
 */
Locales.prototype.event = function(player, message, keys) {
	this.printf(player,config.colors.event,message, keys);
}

/**
 * This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.
 * @param {string/object/array} player A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name.
 * @param {string/object/array} message is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file.
 * @param {object} keys associative array with values.
 */
Locales.prototype.help = function(player, message, keys) {
	this.printf(player,config.colors.help,message, keys);
}




