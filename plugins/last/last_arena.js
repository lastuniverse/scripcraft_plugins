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
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 *
 * @module last/paty
 *
 * @example
 * //   подключаем модуль
 * var  containers = require('last/last_arena');
 *
 */


'use strict';

var utils = require('utils');
var users = require('last/users');
var locales = require('last/locales');
var completer = require('last/completer');


// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/arena.json");
if(!config.enable)
	return console.log("plugins/last/last_arena DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_arena", config.locale||"ru_ru");


var arenas = persist('data/modules/last/arenas', {
	list: {}
});


var point_arena = completer.addPlayerCommand('arena');
    point_arena.addComplete('help',cmd_arena_help);

    point_arena.addComplete('test',cmd_arena_test);



function cmd_arena_help( params, sender ) {
	locale.help( sender,  "${help}" );
};

function cmd_arena_test( params, sender ) {
  locale.help( sender,  "params: /" + params.join(" ")  );
};
