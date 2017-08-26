/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ## Плагин для спавна агрессивных к игроку мобов при его удалении от безопасных зон
 *
 * ## Принцип действия:
 * 1. раз в `last_mobterror.time` секунд плагин проверяет расстояние до ближайшего варпа, если это расстояние больше чем `last_mobterror.offset` плагин инициирует спавн мобов
 * 2. перед тем как заспавнить мобов плагин проверяет:
 *    - игрок находится на расстоянии до ближайшего варпа большем чем `last_mobterror.offset`
 *    - игровой режим игрока "SURVIVAL"
 *    - игрок находится не выше 2-х блоков над землей
 *    - освещенность под ногами у игрока не выше чем в настройках для моба
 *    - в радиусе 8 блоков от игрока есть подходящее место для спавна моба
 * 3. если все условия соблюдены то плагин спавнит мобов. Их количество зависит от расстояния до ближайшего варпа. на расстоянии `last_mobterror.offset` блоков это будет 1 моб, при увеличении расстояния количество мобов также будет возрастать, пока не достигнет значения указанного в `last_mobterror.max`.
 * 4. мобы выбираются рандомно из следующих типов указанных в наcтройках разрешений для пользователей и групп `last_mobterror.mobs` или файле конфига `mobs` 
 * 5. спавн мобов происходит в произвольных местах на расстоянии до 8 блоков от игрока
 * 6. алгоритм поиска мест спавна производит поиск возможных мест спавна для сухопутных, воздушных и водных типов мобов
 * 7. в случае если вы убили моба, то примерно через время `last_mobterror.time` вместо него доспавнится другой.
 * 9. в случае если вы убежали от мобов, примерно через время `last_mobterror.time` они вас догонят.
 * 10. мобы будут удалены если:
 *     - игрок умер
 *     - игрок добежал до безопасной зоны
 *     - игрок телепортировался на варп или в портал
 *     - игрок сменил игровй режим отличный от "SURVIVAL"
 *     - игрок вышел из игры
 *
 * ## Файл конфигурации плагина `data/config/plugins/last/mobterror.json`
 * 
 * - `enable` - настройка включает (`true`) или выключает (`false`) плагин
 * - `locale` - настройка содержит локаль указывающую на файл с переводом сообщений, по умолчанию это `ru_ru`
 * - `max` - максимальное количество мобов для спавна на 1 игрока. Используется по умолчанию если не задано иного в `modules/last/permissions`
 * - `q` - коэффициент регулирующий скорость возрастания количества мобов в зависимости от расстояния до ближайшего варпа. Используется по умолчанию если не задано иного в `modules/last/permissions`
 * - `offset` - безопасный радиус вокруг точек варпов. внутри этого радиуса спавн мобов не происходит. Используется по умолчанию если не задано иного в `modules/last/permissions`
 * - `time` - циклический счетчик. Используется по умолчанию если не задано иного в `modules/last/permissions`. (в разработке)
 * - `mobs` - списки допустимых мобов для каждого из миров игры. Используется по умолчанию если не задано иного в `modules/last/permissions`
 * - `options` - список настроек для каждого моба из списка `mobs`. Содержат следующие значения:
 * 	  - `type` - тип моба, и соответсвенно допустимое места его спавна, может принимать значения - наземный `ground`, летающий `air` и плавающий `water`
 * 	  - `light` - максимально допустимый уровень освещения, допускающий спавн данного моба
 *
 * **в настоящее время файл конфигурации выглядит так:**
 * ```
 * {
 *     "locale": "ru_ru",
 *     "enable": true,
 *     "max": 10,
 *     "q": 50,
 *     "offset": 150,
 *     "time": 60,
 * 	"mobs": {
 * 		"world": ["EVOKER","SPIDER","CAVE_SPIDER", "ZOMBIE", "SKELETON", "CREEPER", "WITCH","VEX","GUARDIAN","ELDER_GUARDIAN"],
 * 		"world_nether": ["SKELETON", "WITHER_SKELETON", "PIG_ZOMBIE", "VEX", "BLAZE" ],
 * 		"world_the_end": [ "VEX", "ENDERMAN", "SHULKER"]
 * 	},
 * 	"options": {
 * 		"SHULKER": {"type": "ground", "light": 15},
 * 		"ENDERMAN": {"type": "ground", "light": 15},
 * 		"EVOKER": {"type": "ground", "light": 3},
 * 		"SPIDER": {"type": "ground", "light": 5},
 * 		"CAVE_SPIDER": {"type": "ground", "light": 5},
 * 		"ZOMBIE": {"type": "ground", "light": 6},
 * 		"SKELETON": {"type": "ground", "light": 6},
 * 		"CREEPER": {"type": "ground", "light": 4},
 * 		"WITCH": {"type": "ground", "light": 5},
 * 		"WITHER_SKELETON": {"type": "ground", "light": 3},
 * 		"PIG_ZOMBIE": {"type": "ground", "light": 4},
 * 		"VEX": {"type": "air", "light": 4},
 * 		"BLAZE": {"type": "air", "light": 5},
 * 		"GUARDIAN": {"type": "water", "light": 15},
 * 		"ELDER_GUARDIAN": {"type": "water", "light": 15}
 * 	}
 * }
 * ```
 * 
 * ## Настройки модуля `modules/last/permissions`
 * 
 * **Права доступа:**
 * 
 * **Параметры:** *могут быть выставленны персонально для разных групп и отдельных пользователей*
 * - `last_mobterror.max` - максимальное количество мобов для спавна на 1 игрока.
 * - `last_mobterror.q` - коэффициент регулирующий скорость возрастания количества мобов в зависимости от расстояния до ближайшего варпа
 * - `last_mobterror.offset` - безопасный радиус вокруг точек варпов. внутри этого радиуса спавн мобов не происходит.
 * - `last_mobterror.time` - циклический счетчик. (в разработке)
 * - `last_mobterror.mobs` - список допустимых мобов для спавна. в по умолчанию выставленны следующие мобы:
 *   - в обычном мире - ["EVOKER","SPIDER","CAVE_SPIDER", "ZOMBIE", "SKELETON", "CREEPER", "WITCH","VEX","GUARDIAN","ELDER_GUARDIAN"]
 *   - в аду - ["SKELETON", "WITHER_SKELETON", "PIG_ZOMBIE", "VEX", "BLAZE" ]
 *   - в енде - [ "VEX", "ENDERMAN", "SHULKER"]
 *
 * ## Важно:
 * - Расчеты количества мобов производятся по формуле логистической кривой (сигмоиде) `Math.floor((1-(1/(1+Math.exp((dist-offset-q*2.5)/q))))*max_mobs)`. Такие харрактеристики как `N_START` и `N_MAX` охарактеризовывают точки минимума и максимума сигмоиды.
 * 
 * ## зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - entities - стандартный модуль для управления entities (мобы и активные эременты)
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - plugins/last/last_warp - плагин варпов
 * 
 * @module plugins/last/last_mobterror
 */

if (__plugin.canary){
  console.warn('last_mobterror not yet supported in CanaryMod');
  return;
}

var utils = require('utils');
var entities = require('entities');
var eventex = require('last/eventex');
var permissions = require('last/permissions');
var warps = require('./scriptcraft/plugins/last/last_warp.js');



// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/mobterror.json");
if(!config.enable)
  return console.log("plugins/last/last_mobterror  DISABLED");;


// сюда сохраняем заспавненых мобов
var mobs = {};

var online = {};




function calc(event, dist){
    var value = Math.floor((1-(1/(1+Math.exp((dist-event.offset-event.q*2.5)/event.q))))*event.max);
    if(value < 0)
    	value=0;
    return value;
}

function isOnGround(location) {
	var a = location.subtract(0,1,0).getBlock().getType() == "AIR"?true:false;
	var b = location.subtract(0,2,0).getBlock().getType() == "AIR"?true:false
    return !(b&&a);
}

function testDistance(loc1,loc2) {
	if( Math.abs(loc1.x-loc2.x)>16 )
		return false;
	if( Math.abs(loc1.z-loc2.z)>16 )
		return false;
	return true;
}

function findSpawnPlaces(location) {
	var places = {
		"air":[],
		"ground":[],
		"water":[]
	};
	for (var x = -6; x < 6; x++ ) {
	for (var z = -6; z < 6; z++ ) {
		var preparent = "";
		var parent = "";
		for (var y = -4; y < 4; y++ ) {
			var loc = utils.locationToJSON(location);
			loc.x+=x;
			loc.z+=z;
			loc.y+=y;
			var tloc = utils.locationFromJSON(loc);
			var current = ''+tloc.getBlock().getType();
			if( current != "AIR" && current != "STATIONARY_WATER" ) current = "GRND";

			if( preparent == "GRND" && parent == "AIR" && current == "AIR" ){
				loc.y--;
				places.ground.push(loc);
			}else if( preparent == "AIR" && parent == "AIR" && current == "AIR" ){
				loc.y--;
				places.air.push(loc);
			}else if( preparent == "STATIONARY_WATER" && parent == "STATIONARY_WATER" && current == "STATIONARY_WATER" ){
				loc.y--;
				places.water.push(loc);
			}
			preparent = parent;
			parent = current;
		}
	}}
    return places;
}


function spawn(event,places){
	var world = event.player.location.getWorld();
	var ploc = utils.locationToJSON(event.player.location);
//console.log("++++++++++++++++++++ SPAWN 01 "+ploc.world);	
	var mob_list = event.mobs[ploc.world];
	var n = Math.floor( Math.random() * mob_list.length );
	var mob = mob_list[n];
	var mobs_opt = config.options;
//console.log("++++++++++++++++++++ SPAWN 02 проверка на настройки моба "+mob);
	if(!mobs_opt[mob])
		return false;


	//var light = player.location.subtract(0,1,0).getBlock().getLightLevel();
	var light = event.player.location.getBlock().getLightLevel();
//console.log("++++++++++++++++++++ SPAWN 03 проверка на освещенность "+light);
	if( mobs_opt[mob].light < light)
		return false;

//console.log("++++++++++++++++++++ SPAWN 04 проверка на наличие места спавна "+mobs_opt[mob].type);
	if( !places[mobs_opt[mob].type].length )
		return false;


	var locs = places[mobs_opt[mob].type];
	var m = Math.floor( Math.random() * locs.length );
	var loc = locs[m];
	var tloc = utils.locationFromJSON(loc);

 	var entityTypeFn = entities[mob.toLowerCase()];
 	var entityType = entityTypeFn();
 	
 	var entity = world.spawnEntity( tloc, entityType);
//console.log("++++++++++++++++++++ SPAWN 05 проверка на успешность спавна ");
 	if(!entity){
 		return false;
 	}
//console.log("++++++++++++++++++++ SPAWN 06");
 	entity.setTarget(event.player);
 	return entity;
}


// удаляем мобов если ТП на варп
eventex.events.on("onPlayerWarped",function(event){
	removeMobs(event.player);
});

// удаляем мобов если Игрок добрался до безопасной зоны вокруг варпа
eventex.events.on("onPlayerInWarpArea",function(event){
	removeMobs(event.player);
});

// удаляем мобов если игрок погиб
events.playerDeath(function(event){
	var player = event.getEntity();
	removeMobs(player);
});

// удаляем мобов если игрок ТП в портал
events.playerPortal(function(event){
	var player = event.getPlayer();
	removeMobs(player);
});

// удаляем мобов если игрок вышел из игры
events.playerQuit(function(event){
	var player = event.getPlayer();
	removeMobs(player);
});

// удаляем мобов если игрок ТП кудалибо
events.playerTeleport(function(event){
	// var player = event.getPlayer();
	// removeMobs(player);
});


// удаляем мобов если игрок не в выживании
events.playerGameModeChange(function(event){
	var gm = ""+event.getNewGameMode()
	if( gm != "SURVIVAL"){
		var player = event.getPlayer();
		removeMobs(player);
	}
});

function removeMobs(player){
	// получаем UUID игрока
	var UUID = ''+player.getUniqueId();
	if( !mobs[UUID] )
		return;

	for (var i in mobs[UUID]) {
		var mob = mobs[UUID][i];
		if( mob && !mob.isDead() )
			mob.remove();
		delete mobs[UUID][i];
	}	
}


// при входе игрока на сервер запускаем для него персональный таймер
eventex.events.on("onPlayerJoin", function ( event ) {
	var permission = permissions.getUserPermissions(event.player);
	var UUID = ''+event.player.getUniqueId();
	if( online[UUID] )
		return;
	online[UUID] = true;
	setMobTerrorHandler({
		player: event.player,
		UUID: UUID,
		permission: permission,
		offset: permission.getParam("last_mobterror.offset")||config.offset,
		time: permission.getParam("last_mobterror.time")||config.time,
		mobs: permission.getParam("last_mobterror.mobs")||config.mobs,
		max: permission.getParam("last_mobterror.max")||config.max,
		q: permission.getParam("last_mobterror.q")||config.q
	});
});


function callAfterTime(callback,time){
	var isNext = true;
	function next() { isNext = false; }
	function hasNext() { return isNext;	}
	var self = this;
	utils.nicely( next, hasNext, function(){
		callback.call(self);
	}, time );
}

function setMobTerrorHandler(event){
	if( !event.player.isOnline() ){
		delete online[event.UUID];
		return;
	}
	event.player = utils.player(event.player.name);
	var next_time = Math.floor( Math.random() * event.time * 500 );
	callAfterTime(function(){
		eventex.events.emit('onMobTerror',event); 
	}, event.time * 500 + next_time );
console.log("!!!!! next STATR after " + event.player.name + " - " + (event.time * 500 + next_time) );
}


// вераем слушателя на eventex.events.onMobTerror
eventex.events.on('onMobTerror', function (event){
	// вызываем повторно
	setMobTerrorHandler(event);

//console.log("------- EVENT 00");

	// если режим игрока не "SURVIVAL" отменяем спавн мобов
	var gm = ""+event.player.getGameMode();
	if( gm != "SURVIVAL")
		return;
	
//console.log("------- EVENT 01");
	// если выше чем 2 блока от "земли" отменяем спавн мобов
	if( !isOnGround(event.player.getLocation()) )
		return;

	// получаем координаты игрока
	var loc = utils.locationToJSON( event.player.location );

	// получаем дистанцию до ближайшего варпа игрока
	var warp = warps.getNearWarpDistance(loc);
//console.log("------- EVENT 02 "+warp.warp_name);
	// если до варпа ближе чем offset то отменяем спавн мобов
	if(warp.dist < event.offset )
		return  eventex.events.emit("onPlayerInWarpArea",{
			player: event.player,
			warp: warp.warp
		});
	

	// рандомно выбираем координату перед игроком
	var dx = (Math.random() * 5 + 3);
	var dz = (Math.random() * 5 + 3);
	loc.x+=dx;
	loc.z+=dz;
	var location = utils.locationFromJSON( loc );

//console.log("------- EVENT 03");
	// получаем список доступных локаций для спавна в радиусе 5 блоков от координат
	var places = findSpawnPlaces(event.player.location);
	// если в округе нет места для спавна то отменяем спавн мобов
	if( !places.air.length && !places.ground.length && !places.water.length )
		return;

	// в зависимости от дальности до ближайшего варпа вычисляем количество мобов
	var count = calc(event, warp.dist);

	// получаем хранилище мобов по UUID игрока
	if( !mobs[event.UUID] )
		mobs[event.UUID] = {};

	for (var i in mobs[event.UUID]) {
		var mob = mobs[event.UUID][i];
		if( mob.isDead() ){
			delete mobs[event.UUID][i];
			continue;
		}

		var mob_loc = utils.locationToJSON(mob.location);
		var loc_test = testDistance(mob_loc,loc);
		if( loc_test )
			continue;
		mob.teleport(event.player);
		mob.setTarget(event.player);
	}

	// вычисляем количество еще живых мобов
	var live_count = Object.keys(mobs[event.UUID]).length;
//console.log("------- EVENT 04");
	// если мобы живы в количестве большем чем можно спавнить то отменяем спавн мобов
	count = count - live_count;
	if( count <= 0 )
		return;

//console.log("------- EVENT 05");
	// спавним мобов
	for (var i = 0; i < count; i++) {
		var mob = spawn(event,places);
		if( mob ){
			var EID = ''+mob.getEntityId();
			mobs[event.UUID][EID] = mob;
		}
	}
}); 
