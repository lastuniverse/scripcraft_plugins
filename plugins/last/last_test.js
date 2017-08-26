var completer = require('last/completer');
var permissions = require('last/permissions');
var color =  require('last/color').color;
var slash = require('slash');

// загружаем конфиг
var config = scload("./scriptcraft/data/config/plugins/last/test.json");
if(!config.enable)
  return console.log("plugins/last/last_test  DISABLED");;



var utils = require('utils');
var inventory = require('last/inventory');
var bkMaterial = Packages.org.bukkit.Material;
var bkBlock = org.bukkit.block;
function cmd_test(params, sender){
	echo(sender,params);
	var item = inventory.itemStackFromJSON({
		"type": (""+params[1]||"COBBLESTONE").toUpperCase(), 
		"damage": params[2]||0,
		"amount": 1
	});
	
	//var item = bkBlock.stone;

	//item.setType(bkMaterial.getMaterial("stone_slab"));
	//item.setData(0);	

	var player = utils.player(sender);
	var inv = player.getInventory();
	inv.addItem(item);
}

function cmd_pisec(params, sender){
	// var itemstack = {
	// 	"type": "DIAMOND_CHESTPLATE",
	// 	"meta": {
	// 		"meta-type": "UNSPECIFIC",
	// 		"enchants": {
	// 			"PROTECTION_FIRE": 10,
	// 			"DURABILITY": 10,
	// 			"MENDING": 1,
	// 			"THORNS": 10
	// 		}
	// 	},
	// 	"amount": 1,
	// 	"damage": 0
	// };	
	var player = utils.player(sender);
	// var inv = player.getInventory();
	// var item = inventory.itemStackFromJSON(itemstack);
	// inv.addItem(item);
	var data = {
		display:{
			Name:"LegsOfGOD"},
			// Прочность-10лвл Острота-10лвл Урон_нежити-10лвл Бич_членистоногих-10лвл Отбрасывание-10лвл Поджог-10лвл Мародерство-10лвл
			ench:[
				{id:0,lvl:100},	// Защита
				{id:1,lvl:100},	// Защита от огня
				{id:2,lvl:100},	// Мягкое приземление
				{id:3,lvl:100},	// Защита от взрыва
				{id:4,lvl:100},	// Защита от снаряда
				{id:5,lvl:100},	// Дыхание
				{id:6,lvl:100},	// Родство с водой
				{id:7,lvl:100},	// Шипы
				{id:34,lvl:100},	// Прочность
				// Оружие
//				{id:16,lvl:10},	// Острота
//				{id:17,lvl:10},	// Урон нежити
//				{id:18,lvl:10},	// Бич членистоногих
//				{id:19,lvl:10},	// Отбрасывание
//				{id:20,lvl:10},	// Поджог
//				{id:21,lvl:10},	// Мародерство
				// Инструменты
//				{id:32,lvl:10},	// Эффективность
//				{id:33,lvl:10},	// Шелковое касание
//				{id:35,lvl:3},		// Удача
				// Лук
//				{id:48,lvl:10},	// Сила
//				{id:49,lvl:10},	// Отбрасывание
//				{id:50,lvl:10},	// Воспламенение
//				{id:51,lvl:10}	// Бесконечность
				// Удочка
//				{id:61,lvl:10},	// Прикормка
//				{id:62,lvl:10}	// Морская удача
				// Дополнительно
				{id:70,lvl:1}	// Починка
				// Проклятья
//				{id:71,lvl:1}	// Проклятье утраты
			]
		};
	var str = JSON.stringify(data).replace(/\"/g,"");
	// var cmd = "give "+player.name+" minecraft:DIAMOND_SWORD 1 0 "+str;
	var cmd = "give "+player.name+" minecraft:DIAMOND_BOOTS 1 0 "+str;
	// leather_boots
	console.log("!!! CMD: "+cmd);
	slash(cmd);
}

completer.addPlayerCommand('test',cmd_test,undefined,"last_test.use")
		 .addComplete("@any",cmd_test,undefined,"last_test.use")
		 .addComplete("@re/[0-9]+/",cmd_test,undefined,"last_test.use");


completer.addPlayerCommand('pisec',cmd_pisec,undefined,"last_test.use");

// function cmd_test(params, sender ) {
// 	//var str = params.pop();
// 	echo(sender,text+"это работает /"+params.join(" "));
// }

// var point = completer.addPlayerCommand('test',cmd_test,undefined,"last_test.use");
// 	point.addComplete('test1',cmd_test);
// 	point.addComplete('test2',cmd_test,undefined,"last_test.test2.use");
// 	point.addComplete('test3',cmd_test);

// var utils = require('utils');
// var list = {};
// for(var p in utils.players()){
//   list[p]=true;
// }




// var bkMaterial = Packages.org.bukkit.Material;
// var materials = bkMaterial.values();
// var items = {};
// for (var i in list ){
//   var name = list[i];
//   if(!name)
//   	name = i;

//   name = ''+name;
  
//   //console.log(name);

//   items[name] =  {};
// }

//var store = persist('items', items);
//scsave('items', items);

















var bukkit2minecraft = {};
var minecraft2bukkit = {};

function cmd_mygive(params, sender){
	//var cost = require('last/cost');
	var key_list = scload("./scriptcraft/data/config/modules/last/cost/key_list.json");
	for( var key in key_list){
		var result = key.match(/(.*?):(\d+)/);
		//console.log("KEY: "+ key + " - " + JSON.stringify(result) );
		var mat = {
			key: key,
			name: result[1],
			data: result[2]
		}
		var cmd = "give lastuniverse "+mat.name+" 1 "+mat.data;
		//console.log(cmd);
		slash(cmd);
		//give <игрок> <предмет> [количество] [данные] 
		var player = utils.player(sender);
		var inv = player.getInventory();
		var item = inv.getItem(0);
	  	material_key = item.type;
	  	bukkit2minecraft[""+material_key] = ""+mat.name;
	  	minecraft2bukkit[""+mat.name] = ""+material_key;
	  	inv.removeItem(item);
	}
	//scsave(bukkit2minecraft,"./scriptcraft/data/config/modules/last/cost/bukkit2minecraft.json");
	//scsave(minecraft2bukkit,"./scriptcraft/data/config/modules/last/cost/minecraft2bukkit.json");
}

completer.addPlayerCommand('mygive',cmd_mygive);














function cmd_gson(params, sender){
	var test = server.pluginManager.getPlugin('PermissionsEx');

  	// var inv = sender.getInventory();
  	// var itemstack = inv.getItemInMainHand();
  	// var nbti = test(itemstack);
  	// var keys = nbti.getKeys();
  	// console.log("NBT: "+ JSON.stringify(keys) );
  	
 	console.log("!!!! "+typeof test);

  	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");
  	nbt_parse(test,"");
  // 	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");
  // 	nbt_parse(global,"global");
  // 	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");
  // 	nbt_parse(this,"this");
}

var test_repit = {};

function nbt_parse(point, path){
	console.log("NBT: " + path );

	if( test_repit[point] )
  			return;
  	test_repit[point]=true;

	if( typeof point === "object" ){
	  	try{
			Object.getOwnPropertyNames(point)
			.filter(
				function (name) { 
					//if( typeof global[name] !== 'function' && name != "global"){
						nbt_parse(point[name], path + "." + name );
					//}
				}
			);
			for(var name in point){
				//if( typeof global[name] !== 'function' && name != "global"){
					nbt_parse(point[name], path + "." + name );
				//}
			}
		}catch(err){

		}
	}else if( typeof point === "function" ){
	  	try{
			for(var name in point){
				//if( typeof global[name] !== 'function' && name != "global"){
					nbt_parse(point[name], path + "." + name );
				//}
			}

		}catch(err){

		}
	}

}







completer.addPlayerCommand('gson',cmd_gson);