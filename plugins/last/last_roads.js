/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин Строитель дорог
 * 
 * Позволяет автоматически строить дорогу просто идя по поверхности
 *      
 * ### Команды
 * - `/road help` : эта справка
 * - `/road set {name} {block list}` : создает именованый набор блоков из которых будет строится дорога
 * - `/road start {name}` : запускает создание дороги из блоков из именованого сета {name}
 * - `/road stop {name}` : закончить дорожное строительство
 * - `/road help : эта справка
 * - `/road new {name}` : создает именованый набор блоков из которых будет строится дорога
 * - `/road del {name}` : удаляет именованый набор блоков
 * - `/road list` : выводит список именованых наборов блоков
 * - `/road preset {name} add {block} {priority}` : добавляет в набор с именем {name} блок {block}. {priority} - приоритет с которым данный блок будет встречатся в наборе.
 * - `/road preset {name} del {block}` : удаляет из набора с именем {name} блок {block}
 * - `/road preset {name} list` : выводит список блоков из набора с именем {name}
 * - `/road start {setname1} {setname2} {radius}` : Теперь, когда вы будете идти, в радиусе {radius} блоки из набора {setname1} будут подменятся на блоки из набора {setname2}
 * - `/road stop {name}` : закончить дорожное строительство
 * 
 * ### Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_roads.use` - разрешение на использование команд плагина
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/users       - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * - modules/last/locales     - модуль локализации
 * 
 * @module plugins/last/last_roads
 */

'use strict';

if (__plugin.canary){
	console.warn('last_roads not yet supported in CanaryMod');
	return;
}

var utils = require('utils');

var permissions = require('last/permissions');
var completer = require('last/completer');
var eventex =  require('last/eventex');
var users = require('last/users');
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/roads.json");
if(!config.enable)
	return console.log("plugins/last/last_roads  DISABLED");;

var blocks = config.blocks;

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_roads", config.locale||"ru_ru");

// загружаем пользовательские пресеты
var sets = persist('data/plugins/last/roads', {});

var players = {};


function _toInt(number){
  //var result = Math.floor(Number(number));
  var result = Math.floor(parseInt(''+number,10));
  if( isNaN(result) ) result = 0;
  return result;
}


/**
 * далее следуют обработчики команд
 */

function cmd_road_help( params, sender ) {
	locale.help( sender,  "${help}" );
};

function cmd_road_new( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		sets[UUID] = {};

	var name = params.shift();
	if( sets[UUID][name] )
		return locale.warn( sender,  "${msg.set_is_exist}", {name: name} );

	sets[UUID][name] = {};
	locale.warn( sender,  "${msg.new_set}", {name: name} );

}

function cmd_road_del( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );


	var name = params.shift();
	if( !sets[UUID][name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: name} );

	delete sets[UUID][name];
	locale.warn( sender,  "${msg.del_set_success}", {name: name} );

}

function complete_road_del( sender,patern ) {
	var UUID = ''+sender.getUniqueId();
	if( sets[UUID] )
		return sets[UUID];
	
	return {};
}


function cmd_road_list( params, sender ) {
	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	var list = Object.keys(sets[UUID]).join(", ");
	locale.warn( sender,  "${msg.list_sets} "+list );
}

function complete_road_preset( params, sender ) {
	return blocks;
}

function cmd_road_preset_add( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	var name = params.shift();
	if( !sets[UUID][name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: name} );

	params.shift();

	var block = params.shift();
	if( !blocks[block] )
		return locale.warn( sender,  "${msg.block_is_epsent}", {block: block} );


	var priority = Math.abs(_toInt(params.shift()))||1;

	sets[UUID][name][block] = priority;
	locale.warn( sender,  "${msg.add_block_success}", {block: block, name: name} );
}


function cmd_road_preset_del( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	var name = params.shift();
	if( !sets[UUID][name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: name} );

	params.shift();

	var block = params.shift();
	if( !blocks[block] )
		return locale.warn( sender,  "${msg.block_is_epsent}", {block: block} );

	if( !sets[UUID][name][block] )
		return locale.warn( sender,  "${msg.sets_hasnt_block}", {block: block, name: name} );

	delete sets[UUID][name][block];
	locale.warn( sender,  "${msg.del_block_success}", {block: block, name: name} );
}

function complete_road_preset_del( sender, patern, paterns ) {
	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return {};

	var name = paterns[2];
	if( !sets[UUID][name] )
		return {};

	return sets[UUID][name];
}


function cmd_road_preset_list( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	var name = params.shift();
	if( !sets[UUID][name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: name} );

	var list = [];
	for( var block in sets[UUID][name] ){
		var str = block+"["+sets[UUID][name][block]+"]";
		list.push(str);
	}
	locale.warn( sender,  "${msg.list_set_blocks} "+list.join(", "), {name: name} );
}



function cmd_road_start( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	var src_name = params.shift();
	if( !sets[UUID][src_name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: src_name} );

	var dst_name = params.shift();
	if( !sets[UUID][dst_name] )
		return locale.warn( sender,  "${msg.set_is_epsent}", {name: dst_name} );

	var radius = Math.abs(_toInt(params.shift()))||1;
	if( radius > 3 )
		radius = 3;

	players[UUID] = {
		src: sets[UUID][src_name],
		dst: sets[UUID][dst_name],
		radius: radius
	};

	locale.warn( sender, "${msg.start}");
}


function cmd_road_stop( params, sender ) {
	params.shift();
	params.shift();

	var UUID = ''+sender.getUniqueId();
	if( !sets[UUID] )
		return locale.warn( sender,  "${msg.you_hasnt_sets}" );

	delete players[UUID];

	locale.warn( sender, "${msg.stop}");
}


events.playerMove(function(event){
	var UUID = ''+utils.player(event.player).getUniqueId();
	var options = players[UUID];
	if( !options )
		return;

	if( Math.floor(event.from.x) == Math.floor(event.to.x) && Math.floor(event.from.z) == Math.floor(event.to.z) )
		return;

	var loc = event.to.clone();
	console.log("!!! "+loc.x + " " + loc.y + " " + loc.z);
	terraform(loc, options);

});

var bkMaterial = Packages.org.bukkit.Material;



function terraform(loc, options){
	var D = options.radius>>>1;

	var list = Object.keys(options.dst);

	var p = loc.clone();
	for( var x = 0; x < options.radius; x++ ){
	loc.setX(p.x+x-options.radius);
	for( var z = 0; z < options.radius; z++ ){
	loc.setZ(p.z+z-options.radius);
		var parent = "AIR";
		for( var y = 4; y >= 0; y-- ){
			loc.setY(p.y+y-2);

			var block = loc.getBlock();
			var type = block.getType().toString();
			if( (x-D == 0) && (z-D == 0) )
				console.log(type);

			//continue;


			if( options.src[type] && config.air[parent]){
				var len = list.length;
				var rnd = Math.floor(Math.random() * len);
				var name = list[rnd];
				block.setType(bkMaterial[name]);
				block.data = Math.floor(Math.random() * 4);
				//console.log(type+" -> "+name);
				break;

			}
			parent = type;
		}
	}}

}

// function putBlock( x, y, z, blockId, metadata, world, update ) {
// 	if ( typeof metadata == 'undefined' )
// 		metadata = 0;

// 	var block = world.getBlockAt( x, y, z );

// 	block.setTypeIdAndData( blockId, metadata, false );
// 	block.data = metadata;
// 	return block;
// }

// 	var list = params;
// 	var preset = [];
// 	for(var i in list ){
// 		var block = list[i];
// 		if( blocks[block] )
// 			preset.push(block);
// 	}
// 	sets[name] = preset;
// 	locale.warn( sender,  "${new_set}", {name: name} );
// };






/**
 * далее регистрируем команды
 */

var point_road = completer.addPlayerCommand('road');
    point_road.addComplete('help',cmd_road_help);

    point_road.addComplete('new')
    		  .addComplete('@any', cmd_road_new );

    point_road.addComplete('del', undefined, complete_road_del )
    		  .addComplete('@any', cmd_road_del );

    point_road.addComplete('list', cmd_road_list)

var poin_preset = point_road.addComplete('preset', undefined, complete_road_del )
	.addComplete('@any');

	poin_preset.addComplete('add', undefined, complete_road_preset)
			   .addComplete('@any', cmd_road_preset_add );

	poin_preset.addComplete('del', undefined, complete_road_preset_del)
			   .addComplete('@any', cmd_road_preset_del );

	poin_preset.addComplete('list', cmd_road_preset_list);


var point_start = point_road.addComplete('start', undefined, complete_road_del)
	.addComplete('@any', undefined, complete_road_del)
	.addComplete('@any', cmd_road_start);


var point_stop = point_road.addComplete('stop', cmd_road_stop);
			   




