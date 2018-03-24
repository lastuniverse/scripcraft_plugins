/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Модуль для создания различных разрешений и настроек для пользователей и групп, и отслеживания их выполнения
 * 
 * Данный модуль содержит в себе основные функции для проверки предустановленных в файлах концигурации разрещений и получения заданных тамже параметров для плагинов.
 * По сути не в полной мере дублирует функционал плагина PermissionEx. Разработана из-за невозможности получить доступ к данным PermissionEx.
 *
 * В целях ускорения работы при первом вызове, модуль загружает данные из файлов конфигурации и разворативает их в удобный для машинной обработки формат.
 * 
 * **Файлы конфигурации:**
 * - minecraft_server_folder/scriptcraft/data/config/modules/last/permissions/groups.json - настройки групп пользователей.
 * - minecraft_server_folder/scriptcraft/data/config/modules/last/permissions/users.json - индивидуальные настройки пользователей.
 *
 * **секции и параметры фала конфигурации групп:**
 * - isEnable [true|false] - если установленно в false, модуль игнорирует эту группу как будто ее нет в файле коныигурации.
 * - priotity [number] - выжный параметр указывающий приоритет группы. Если пользователь является членом двух или более групп и все они или некоторые из них содержат одинаковые названия разрешений и/или параметров но с разными значениями установленными для них, модуль будет использовать значения из группы с наивысшим приоритетом. Так же следует отметить, что наивысшим приоритетом обладают разрешения и параметры указанные в персональных настройках пользователя.
 * - default - [true|false] - если установленно в true, то разрешения и параметры этой группы будут использоватся по умолчанию если запрашиваемое значение или параметр не описан ни в одной из групп, членом которых является пользователь. Такое поведение гарантируется даже если параметр isEnable для дефолтной группы выставлен в false.
 * - permissions - секция содержит разрешения для различных плагинов. смотрите примеры использования.
 * - options - секция содержит параметры для различных плагинов. смотрите примеры использования.
 * 
 * @example 
 * 	...
 * 	"guest": {							// описание группы "guest"
 * 		"isEnable": true,					// группа включена
 * 		"default": true, 					// группа по умолчанию
 * 		"priotity": 10,						// приоритет группы
 * 		"permissions": {					// разрешения группы
 * 			"last_warp.warp": false
 * 		},
 * 		"options": {						// параметры группы
 * 			"last_warp.max":0,
 *	 		"last_teleport.cost": 300
 * 		}
 *	},
 *	"player": {							// описание группы "player"
 *		"isEnable": true,					// группа включена
 *		"priotity": 20,						// приоритет группы
 *		"permissions": {					// разрешения группы
 *			"last_elitra.slap": false,  	// разрешение отключено, как если бы его вообще небыло
 *			//"last_spawn.spawn": true,		// разрешение отключено, как если бы его вообще небыло
 *			"last_spawn.sign.use": true,
 *			"last_spawn.sign.place": true,
 *			"last_warp.sign.use": true,
 *			"last_warp.sign.place": true,
 *			"last_warp.access": true,
 *		},
 *		"options": {						// параметры группы
 *			"last_warp.max":0,
 *			"last_teleport.cost": 300
 *		}
 *	},
 *	...
 * 
 * **секции и параметры фала конфигурации пользователей:**
 * - name - содержит никнэйм игрока
 * - groups - секция содержит названия групп членом которых является пользователь
 * - permissions - секция содержит разрешения для различных плагинов. смотрите примеры использования
 * - options - секция содержит параметры для различных плагинов. смотрите примеры использования
 *
 * @example 
 * 	...
 *	"2f8a6ef2-e971-4b9a-90b9-f54db65dc4b7":{
 *		"name": "Serrgy",
 *		"groups": {
 *			"player": true
 *		},
 *		"permissions":{
 *		},
 *		"options": {
 *		}
 *	},
 *
 *
 * 
 * **зависимости:**
 *      utils - стандартный модуль ScriptCraft
 *      
 * 
 * @module modules/last/permission
 */


'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}

var utils = require('utils');
var Users = require('last/users');

var users = scload("./scriptcraft/data/config/modules/last/permissions/users.json");
var groups = scload("./scriptcraft/data/config/modules/last/permissions/groups.json");

var permissions = {
	groups:{},
	players:{}
};



var DEFAULT_GROUP_NAME = 'guest';

exptractPermissions();

// scsave(permissions.groups, './scriptcraft/config/test_group_permissions.json');
// var perm = getUserPermissions('lastuniverse');
// scsave(perm, './scriptcraft/config/test_last_permissions.json');
//console.log("!!!!!!!!!! last_permissions: "+JSON.stringify(store));





exports.addUser = addUser;
function addUser(user){
	var player = utils.player(user);
	var UUID = player.getUniqueId();
	if(!users[UUID]){
		var data = {
			"name": player.name,
			"groups":{},
			"permissions":{},
			"options": {}
		};
		data.groups[DEFAULT_GROUP_NAME] = true;
		users[UUID] = data;
		scsave(users,"./scriptcraft/data/config/modules/last/permissions/users.json");
	}
}

/**
 * Функция возвращает объект класса Permission, содержащий разрешения и параметры пользователя (групповые и индивидуальные), а также функции их проверки и получения
 * @param  {object} user объект, содержащий данные пользователя
 * @return {object}      возвращает объект класса Permission, содержащий разрешения и параметры пользователя (групповые и индивидуальные), а также функции их проверки и получения
 */
exports.getUserPermissions = getUserPermissions;
function getUserPermissions(user){
	var player = utils.player(user);
	var UUID = "";

	if(player)
		UUID = player.getUniqueId();

	if(!player)
		player = user;

	if( !UUID )
		Users.getUUIDByName(user);

	if( !permissions.players[UUID] )
		permissions.players[UUID] = {
			permissions: calcUserPermissions(UUID),
			options: calcUserOptions(UUID)
		};
	//console.log("getUserPermissions:\n" + JSON.stringify(permissions.players[UUID]) );

	//scsave(permissions.players[UUID], './scriptcraft/data/config/modules/last/permissions/test.json);

	//return permissions.players[UUID];
	var result = {};
	result.isPermission = function(permission){
		if(!permission)
			return false;
		return getUserPermission(UUID,permission);
	}
	result.isGroup = function(group_name){
		if( !groups[group_name].isEnable)
			return false;
		var user_groups = users[UUID].groups;
		if( !user_groups[group_name])
			return false;
		return user_groups[group_name];
	}
	result.getParam = function(param_name){
		return getUserParam(UUID,param_name)
	}	

	return result;
}

exports.getGroupPriority = getGroupPriority;
function getGroupPriority(groupname){
	if( !groups[groupname] )
		return 0;
	return groups[groupname].priotity||0;
};

exports.getUserPriority = getUserPriority;
function getUserPriority(username){
	var UUID = Users.getUUIDByName(username);
	if( !UUID || !users[UUID] || !users[UUID].groups )
		return 0;

	var grouplist = users[UUID].groups;
	if( typeof grouplist !== "object" )
		return 0;
	
	var priotity = 0
	for (var groupname in grouplist) {
		if( !grouplist[groupname] )
			continue;
		//var groupname = grouplist[i];
		if( !groups[groupname] )
			continue;
		
		var group = groups[groupname];

		if( !group.priotity )
			continue;

		if( priotity < group.priotity )
			priotity = group.priotity;
	}
	return priotity;
};








function exptractPermissions(){
	//console.log("**********************************************************");
	for(var group_name in groups){
		if( groups[group_name].isEnable ){
			if( groups[group_name].default ) DEFAULT_GROUP_NAME = group_name;
			permissions.groups[group_name] = parsePermissions(groups[group_name].permissions);
		}

	}	
	//scsave(permissions.groups, './scriptcraft/data/config/modules/last/permissions/groups.json');
	
};

function parsePermissions(list){
	var result = {};
	for(var permission_name in list ){
		if( list[permission_name] ){
			var current = result;
			var parent = {
				point: result,
				key: undefined
			};
			var permission_path = permission_name.split(/\./);
			while(permission_path.length){
				var item = permission_path.shift();

				if( typeof current != 'object' )
					current = parent.point[parent.key] = {};

				if( current[item] ){

				}else{
					if( permission_path.length ){
						current[item] = {};	
					}else{
						current[item]=list[permission_name];			
					}
				}
				parent.point = current;
				parent.key = item;
				current = current[item];
			}
		}
	}
	return result;
};



function getUserParam(UUID,param_name){
	var current = permissions.players[UUID].options;
	if( current.hasOwnProperty(param_name) )
		return current[param_name];
	return 0;
};

function calcUserOptions(UUID){
	if( !users[UUID] )
		return groups[DEFAULT_GROUP_NAME].options;

	var user_options = {};
	var priotity = {};
	var cur_priotity = groups[DEFAULT_GROUP_NAME].priotity;
	for(var item in groups[DEFAULT_GROUP_NAME].options ){
		user_options[item] = groups[DEFAULT_GROUP_NAME].options[item];
		priotity[item] = cur_priotity;
	}			

	

	for(var group_name in users[UUID].groups){
		if( users[UUID].groups[group_name] ){
			cur_priotity = groups[group_name].priotity;
			var options = groups[group_name].options;
			for(var item in options ){
				if( !user_options.hasOwnProperty(item) || cur_priotity > priotity[item] ){
					user_options[item] = options[item];
					priotity[item] = cur_priotity;
				}
			}			
		}
	}

	if(users[UUID].options)
		for(var item in users[UUID].options ){
			//if( !user_options[item] || user_options[item] < users[UUID].options[item] )
			user_options[item] = users[UUID].options[item];
		}			

	return user_options;
};

exports.gertUserGroups = gertUserGroups;
function gertUserGroups(user){
	var player = utils.player(user);
	var UUID = player.getUniqueId();
	if( !users[UUID] || !users[UUID].groups )
		return {};
	return users[UUID].groups;
}

function getUserPermission(UUID,permission){
	var permission_path = permission.split(/\./);
	var result = false;

	var current = permissions.players[UUID].permissions;
	if(current["*"])
		return true;
	while(permission_path.length){
		var item = permission_path.shift();
		if( current[item] ){
			if( current[item]["*"] ){
				result = true;
				break;
			}
			// тут я пока решил, что если есть более глубоко вложенное разрешение, то оно разрешает все по своему пути
			if( permission_path.length == 0 ){
				result = true;	
				break;
			}
			current = current[item];
		}else{
			break;
		}
	}
	return result;
};

function calcUserPermissions(UUID){

	var user_permissions = {};
	
	user_permissions = _merge(user_permissions, permissions.groups[DEFAULT_GROUP_NAME]);

	if( !users[UUID] )
		return user_permissions;

	if(users[UUID].permissions)
		user_permissions = _merge(user_permissions, parsePermissions(users[UUID].permissions));
	for(var group_name in users[UUID].groups){
		if( users[UUID].groups[group_name] ){
			var group = permissions.groups[group_name];
			user_permissions = _merge(user_permissions, group);
		}
	}
	return user_permissions;
};

function _merge(target, source) {
    if ( typeof target !== 'object' ) {
        target = {};
    }
    for (var property in source) {
        if ( source.hasOwnProperty(property) ) {
            var sourceProperty = source[ property ];
            if ( typeof sourceProperty === 'object' ) {
                target[ property ] = _merge( target[ property ], sourceProperty );
                continue;
            }

            if ( target.hasOwnProperty(property) ){
            	//if ( typeof target[ property ] === 'object' )
          		continue;
            }
            
            target[ property ] = sourceProperty;
        }
    }
    for (var a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    return target;
};

