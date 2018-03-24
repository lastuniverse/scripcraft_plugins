/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ## Плагин мобофем
 * 
 * Позволяет создавать и удалять мобофермы. Ферма мобов представляет собой заранее установленную именованную точку спавна мобов определенного типа и табличку управления фермой, позволяющую приостановить и продолжить респавн мобов в установленной точке.
 *
 * ## Команды
 *
 * - `/farm help` : эта справка
 * - `/farm list` : список установленных вами ферм
 * - `/farm set {farmname} {mob} [hp]`: установить ферму с именем `{farmname}` спавнящую мобов `{mob}` с количеством жизней `[hp]`. точка спавна будет в точке где вы стоите
 * - `/farm remove {farmname}` : удалить ферму с именем `{farmname}`
 * 
 * 
 * ## Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_farm.set` - разрешение на установку ферм командой `/farm set ...`.
 * - `last_farm.use` - разрешение на включение/выключение установленной мобофермы по ПКМ на табличке управления.
 * 
 * **Параметры:** ***могут быть выставленны персонально для разных групп и отдельных пользователей***
 * - `last_farm.max` - максимальное количество ферм доступных для установки 
 * - `last_farm.mobs` - список допустимых мобов для мобоферм. в настоящее время для использования на фермах разрешены следующие мобы `[PIG, BLAZE, WITHER, WITCH, WITHER_SKELETON, WITHER_SKULL, EVOKER, CREEPER, SKELETON, SPIDER, ZOMBIE, PIG_ZOMBIE, ENDERMAN, CAVE_SPIDER]`
 * 
 * ## Установка мобофермы
 * - встать на точку, в которой должен происходить спавн мобов.
 * - ввести команду `/farm set {farmname} {mob} [hp]`
 * - оформить точку спавна так, чтобы была возможность бить мобов, но мобы не могли выбратся наружу.
 *
 * ## Установка таблички включения/выключения мобоферм
 * - поставить табличку с надписями:
 *   - 1 строка - `farm`
 *   - 2 строка - `{farmname}`
 *   - 3-4 строки - пустые, будут заполнены автоматически
 * 
 * ## Использование табличек включения/выключения мобоферм
 *  - ПКМ - последовательно включает/выключает соответствующую табличке мобоферму
 *  
 * ## Важно
 *  Добавлена группа игроков - `holder`. Члены этой группы выставлены оба разрешения и дана возможность устанавливать 1 ферму
 * 
 * ## зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - entities - стандартный модуль для управления entities (мобы и активные эременты)
 * - modules/last/signs       - модуль событий связанных с табличками
 * - modules/last/economy     - модуль управления экономикой и финансами игрока
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/locales     - модуль локализации
 * - modules/last/users       - модуль доступа к персональному хранилищу данных пользователей
 * - modules/last/eventex     - модуль заглушка для последовательного вызова слушателей события onJoin
 * 
 * @module plugins/last/last_farm
 */





'use strict';

if (__plugin.canary){
  console.warn('last_warp not yet supported in CanaryMod');
  return;
}
var utils = require('utils');
var entities = require('entities');
var signs = require('last/signs');
var economy = require('last/economy');
var completer = require('last/completer');
var permissions = require('last/permissions');
var users = require('last/users');
var eventex = require('last/eventex');
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/farm.json");
if(!config.enable)
  return console.log("plugins/last/last_farm  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_farm", config.locale||"ru_ru");



var mobs = {};
// "WITHER" сушка трехглавая
// "WITHER_SKULL" сушкина башка
// "WITHER_SKELETON" сушка обычная
// "EVOKER" - иллюзионисть (дроп - тотем бессмертия)



function serializeLocation(loc){
	loc.x = Math.floor(loc.x)+0.5;
	loc.y = Math.floor(loc.y)+0.5;
	loc.z = Math.floor(loc.z)+0.5;
	loc.yaw = Math.floor(loc.yaw);
	loc.pitch = 0;
	return loc;
}

eventex.events.on("onPlayerJoin", function ( event ) {
	var player = users.getPlayer(event.player);
	if( !player.data["last_farm"] )
		player.data["last_farm"] = {}
});

// обработчик установки таблички управления фермой
// permission: last_farm.set
eventex.events.on("onSignPlace", function ( event ) {
  var lines = event.native.getLines();

  if( !lines || lines[0] != 'farm' )
	return;
  var farm_name = lines[1];
  if( !farm_name )
  	return;
  
  var player = event.native.getPlayer()
  var permission = permissions.getUserPermissions(player);
  if ( !permission.isPermission("last_farm.set") ){
    lines[0] = locale.findMsg("sign.set_deny.0");
    lines[1] = locale.findMsg("sign.set_deny.1");
    lines[2] = locale.findMsg("sign.set_deny.2");
    lines[3] = locale.findMsg("sign.set_deny.3");
  	return;
  }
    

  var user = users.getPlayer(player);
  var farm = user.data["last_farm"][farm_name];
  if( !farm ){
    lines[0] = locale.findMsg("sign.farm_name_epsent.0");
    lines[1] = locale.findMsg("sign.farm_name_epsent.1");
    lines[2] = locale.findMsg("sign.farm_name_epsent.2");
    lines[3] = locale.findMsg("sign.farm_name_epsent.3");
  	return;
  }

  lines[2] = farm.type;
  lines[3] = player.name;
});

// педварительный обработчик команды клика по табличке
// permission: last_farm.use
eventex.events.on("onBeforeClickSign", function ( event ) {
  var lines = event.sign.getLines();
  var data = testLines(lines)
  if( !data )
  	return;

  var player = event.native.getPlayer();
  var permission = permissions.getUserPermissions(player);
  if ( !permission.isPermission("last_farm.use") )
    return locale.warn( sender, "${msg.on_of_perm_deny}");


  event.data = data;
  event.permission = permission;
  event.info = {
  	signEvent:'onClickFarm',
  	signType:'farm'
  };
});

eventex.events.on("onSignBreak", function ( event ) {
  var block = event.block || event.getBlock();
  var lines = block.getState().getLines();
  var data = testLines(lines)
  if( !data )
  	return;

  //console.log("!!! onSignFarmBreak ");
  //delete data.user.data["last_farm"][data.name];
  if( !data.user.data["last_farm"][data.name] )
  	return;

  data.user.data["last_farm"][data.name].isStarted = false;
});

function testLines(lines){
  var data = {};

  if( !lines || lines[0] != 'farm' )
	return false;

  data.name = lines[1];
  if( !data.name )
  	return false;

  // data.type = lines[2];
  // if( !mob_hash[data.type])
  //   return false;

  data.owner = lines[3];

  data.user = users.getPlayer(data.owner);
  if( !data.user.isPresent )
    return false;

  data.farm = data.user.data["last_farm"][data.name];
  if( !data.farm )
  	return false;

  return data;
}

eventex.events.on("onClickFarm",function (event){
  var action = event.native.getAction();
  if( action == 'RIGHT_CLICK_BLOCK'){
  	var farm = event.data.farm;
    var player = event.native.getPlayer();
	//var key = event.data.owner+' '+farm.name;
	if( farm.isStarted ){
	  locale.warn(player, "${msg.farm_off}");
      farm.isStarted = false;

	  if(farm.EID)
	    if( mobs[farm.EID] )
	      mobs[farm.EID].mob.setHealth(0);
	}else{
      if( !farm.isSleep ){
      	locale.warn(player, "${msg.farm_on}");
        farm.isSleep = true;
        farm.isStarted = true;
        var mob = spawn(farm);
        var EID = ''+mob.getEntityId();
        farm.EID = EID;
        mobs[EID] = {
          mob: mob,
          farm: farm
        };
      }else{
      	locale.warn(player, "${msg.farm_freq_error}");
      }
      var mobs_allow = event.permission.getParam("last_farm.mobs");
      var time = mobs_allow[farm.type];
      callAfterTime(time,function(){ farm.isSleep = false; });
    }
  }
});

events.entityDeath(function(event){
	var entity = event.getEntity();
	var EID = ''+entity.getEntityId();
	if( !mobs[EID] )
		return;


	var farm = mobs[EID].farm;
	delete mobs[EID];

	
	function onCompletion() {
		var mob = spawn(farm);
  		var newEID = ''+mob.getEntityId();
        farm.EID = newEID;
  		mobs[newEID] = {
			mob: mob,
			farm: farm
		};
	}	
	if( farm.isStarted ){
		var player = entity.getKiller();
		if( !player )
			return;
		var permission = permissions.getUserPermissions(player);
		var type =  entity.getType();
		var mobs_allow = permission.getParam("last_farm.mobs");
		var time = mobs_allow[type];
		if( !time || time<300 ) time = 300;
		callAfterTime(time,onCompletion);
	}

	if( farm.isRemoved )
  		delete mobs[newEID]
});


function callAfterTime(time,callback){
	var isNext = true;
	function next() { isNext = false; }
	function hasNext() { return isNext;	}
	utils.nicely( next, hasNext, callback, time );
}

function spawn(farm){
	//console.log("!!!!! spawn entity");
	var location = utils.locationFromJSON( farm.spawn );
	var world = location.world;
	var entityTypeFn = entities[farm.type.toLowerCase()];
	var entityType = entityTypeFn();
	var entity = world.spawnEntity( location, entityType);
	entity.setHealth(farm.hp);
	return entity;
}


function cmd_farm_help( params, sender ) {
  locale.help( sender,  "${help}" );
};



// обработчик команды /farm mobs
// permission: last_farm.set
function cmd_farm_mobs( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_farm.set") )
    return locale.warn( sender, "${msg.cmd_use_deny}");

  var mobs_allow = permission.getParam("last_farm.mobs");


  locale.warn( sender, Object.keys(mobs_allow) );
//PIG,COW,SHEEP,CHICKEN,MUSHROOM_COW,HORSE,RABBIT
//OCELOT,WOLF
//BLAZE,WITHER,WITCH,WITHER_SKELETON,WITHER_SKULL,EVOKER,CREEPER,SKELETON,SPIDER,ZOMBIE,PIG_ZOMBIE,ENDERMAN,CAVE_SPIDER
//GIANT
//ENDERMITE,SHULKER,SQUID,SNOWMAN,IRON_GOLEM,POLAR_BEAR,LLAMA,SLIME,
//SKELETON_HORSE,ZOMBIE_HORSE,GHAST,MAGMA_CUBE,ENDER_DRAGON,GUARDIAN,ELDER_GUARDIAN,VILLAGER,
}


function get_farm_list( sender ) {
  var data = users.getPlayer(sender);
  var farms = data.data["last_farm"];
  var list = {};
  for(var farm in farms){
  	list[farm] = true;
  }
  return list;
}


// обработчик команды /farm list
// permission: last_farm.set
function cmd_farm_list( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_farm.set") )
    return locale.warn( sender, "${msg.cmd_use_deny}");

  var data = users.getPlayer(sender);
  var farms = data.data["last_farm"];
  var list = [];
  for(var farm in farms){
  	var str = farm + ": " +farms[farm].type + " (" + farms[farm].hp + " HP)";
  	list.push(str);
  }
  locale.warn( sender, "${msg.you_farms}\n" + list.join("\n") );
}


// обработчик команды /farm set
// permission: last_farm.set
function cmd_farm_set( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_farm.set") )
    return locale.warn( sender, "${msg.cmd_use_deny}");

  var data = {};
  data.type = params[3].toUpperCase();
  //console.log("!!!!! mob_hash "+JSON.stringify(mob_hash));
  var mobs_allow = permission.getParam("last_farm.mobs");
  if( !mobs_allow[data.type])
  	return locale.warn( sender, "${msg.mob_type_deny} ${msg.mob_list}", { mobtype: data.type } );

  
  data.hp = economy.toInt(''+params[4]);
  console.log("!!!!!!!!!!!!! HP " + data.hp + "  "+ params);
  if( !data.hp || data.hp<1 ) data.hp = 1
  if( data.hp>20 ) data.hp = 20;
  	

  data.name = params[2];
  
  var user_data = users.getPlayer(sender);
  var farms = user_data.data["last_farm"];

  var farm_max = permission.getParam("last_farm.max");
  var farm_count = Object.keys(farms).length;
  if( farm_count >= farm_max  )
	  return locale.warn( sender, "${msg.farm_max_error}", { playername: sender.name, max: farm_max });

  if( farms[data.name] )
  	return locale.warn( sender, "${msg.farm_name_error} ${msg.farm_list}", { farmname: data.name } );

  data.spawn = serializeLocation( utils.locationToJSON( sender.getLocation() ) );
  data.UIID = ""+sender.getUniqueId();
  data.owner = sender.name;

  user_data.data["last_farm"][data.name] = data;
  locale.warn( sender, "${msg.farm_set_success}", { farmtype: data.type } );
};

// обработчик команды /farm remove
// permission: last_farm.set
function cmd_farm_remove( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_farm.set") )
    return locale.warn( sender, "${msg.cmd_use_deny}" );

  var data = {};
  var name = params[2];
  if( !name )
  	return locale.warn( sender, "${msg.farm_name_undefined} ${msg.farm_list}" );

  var data = users.getPlayer(sender);
  var farms = data.data["last_farm"];
  if( !farms[name] )
  	return locale.warn( sender, "${msg.farm_name_undefined} ${msg.farm_list}", { farmname: name } );

  farms[name].isStarted = false;
  farms[name].isRemoved = true;
  delete farms[name];
  locale.warn( sender, "${msg.farm_remove_success}", { farmname: name } );
};



var point_farm = completer.addPlayerCommand('farm');
    point_farm.addComplete('help',cmd_farm_help);
    point_farm.addComplete('mobs',cmd_farm_mobs);
    point_farm.addComplete('list',cmd_farm_list);
    point_farm.addComplete('remove',undefined,get_farm_list)
    		  .addComplete('@any',cmd_farm_remove);

var farm_set = point_farm.addComplete('set')
						 .addComplete('@any',undefined,function(player){
						 	var permission = permissions.getUserPermissions(player);
						 	var mobs_allow = permission.getParam("last_farm.mobs");
						 	return mobs_allow;
						 })
						 .addComplete('@any',cmd_farm_set)
						 .addComplete('@re/[0-9]+/',cmd_farm_set);
//	farm_set.addComplete('@re/[0-9]+/',cmd_farm_set);


