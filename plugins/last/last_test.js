var completer = require('last/completer');
var permissions = require('last/permissions');
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
			Name:"PickaxeOfGOD"},
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
				{id:16,lvl:10},	// Острота
				{id:17,lvl:10},	// Урон нежити
				{id:18,lvl:10},	// Бич членистоногих
				{id:19,lvl:10},	// Отбрасывание
				{id:20,lvl:10},	// Поджог
				{id:21,lvl:10},	// Мародерство
				// Инструменты
				{id:32,lvl:10},	// Эффективность
//				{id:33,lvl:10},	// Шелковое касание
				{id:35,lvl:10},		// Удача
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
	var cmd = "give "+player.name+" minecraft:diamond_pickaxe 1 0 "+str;
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


	// scsave(bukkit2minecraft,"./scriptcraft/data/config/modules/last/cost/bukkit2minecraft.json");
	// scsave(minecraft2bukkit,"./scriptcraft/data/config/modules/last/cost/minecraft2bukkit.json");
}

completer.addPlayerCommand('mygive',cmd_mygive);









// var Material = Packages.org.bukkit.Material;
// var ItemStack = Packages.org.bukkit.inventory.ItemStack;
// var book = new ItemStack(Material.WRITTEN_BOOK, 1);



// var BukkitObjectInputStream = org.bukkit.util.io.BukkitObjectInputStream;
// var BukkitObjectOutputStream = org.bukkit.util.io.BukkitObjectOutputStream;
// var ByteArrayInputStream = java.io.ByteArrayInputStream;
// var ByteArrayOutputStream = java.io.ByteArrayOutputStream;
// var Base64Coder = org.yaml.snakeyaml.external.biz.base64Coder.Base64Coder;

// function cmd_serialize(params, sender){
// 	var player = utils.player(sender);
// 	var inv = player.getInventory();
// 	var item = inv.getItemInMainHand();
// 	var outputStream = new ByteArrayOutputStream();
//     var bos = new BukkitObjectOutputStream(outputStream);
//     bos.writeObject(item);
// 	var encoded = Base64Coder.encodeLines(outputStream.toByteArray());
// 	console.log("item serialize: "+encoded);

// }




// var Gson = com.google.gson.Gson;
// var gson = new Gson();
//var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
//var CraftItemStack = org.bukkit.craftbukkit.inventory.CraftItemStack;

// function cmd_serialize(params, sender){
// 	var player = utils.player(sender);
// 	var inv = player.getInventory();
// 	var itemstack = inv.getItemInMainHand();
// 	//var nmsStack = itemstack.clone().getTag();
// 	//var data = CraftItemStack.asNMSCopy(itemstack).save(nmsStack);
// 	//var nmsStack = CraftItemStack.asNMSCopy(itemstack.clone());
// 	var str = itemstack.toString();
// 	//var json = gson.toJson(itemstack.clone());
//  	console.log("item serialize: "+str );

// }


//var CraftItemStack = org.bukkit.craftbukkit.inventory.CraftItemStack;
var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
//var NBTTagCompound = org.bukkit.minecraft.server.v1_12_R1.NBTTagCompound;

function cmd_serialize(params, sender){
	var player = utils.player(sender);
	var inv = player.getInventory();
	var itemstack = inv.getItemInMainHand();
	var nmsStack = CraftItemStack.asNMSCopy(itemstack);
	if( !nmsStack.hasTag() ){
		var json = nmsStack.toString();
	 	console.log("01 item serialize: "+json );
		return;
	}
	
	var nbtin = (nmsStack.hasTag()) ? nmsStack.getTag() : new NBTTagCompound();
	nmsStack.save(nbtin);
	var json = nbtin.toString();
 	console.log("02 item serialize: "+json );

}



var point_stack = completer.addPlayerCommand('stack',cmd_serialize);
point_stack.addComplete("serialize",cmd_serialize,undefined);


// CraftItemStack craft = (CraftItemStack) stack;
// NBTTagCompound nbtin = new NBTTagCompound();
// CraftItemStack.asNMSCopy(craft).save(nbtin);
// String json = nbtin.toString();
// NBTTagCompound nbtout = MojangsonParser.parse(json);
// stack = CraftItemStack.asBukkitCopy(new net.minecraft.server.v1_12_R1.ItemStack(nbtout));






// In this example, you will learn how to register commands:
// /description help
// /description set {username} {you description}
// /description set {username} {email}
// /description delete {username}
// /description list 

// where:
// {username} - the name of the online or offline player (online players are auto-complete by TAB)
// {you description} - any text

// We connect the module of registration and autocompletion of commands
var  completer = require('last/completer');

// Create/load a data warehouse for description
var store = persist('description', {} );

// Create an array with commands and their descriptions
var help_messages = [
"/description help - this help\n",
"/description set {username} {you description} - remember for the player {username} description {you description}\n",
"/description set {username} {email} - remember for the player {username} the email address {email}\n",
"/description delete {username} - remove player description {username}\n",
"/description list - Show the list of players and their descriptions\n"
];

//  We register the command `/description` without the handler
var point = completer.addPlayerCommand( 'description' );

//  We register the command `/description help` and its handler as a command for the client chat
point.addComplete('help', cmd_help );

//  We register the command `/description help` and its handler as a command for the client chat
point.addComplete('list', cmd_list );


// Register the command `/description set {username}` without the handler.
// Note that the third argument passed to the function, userlist_to_autocomlete.
// It returns an associative array whose keys will be added to the autocomplete list for the `/description set` command
// It's not rational to display all online and offline players as an auto-completion of the `/description set` command.
// But we do this to demonstrate the capabilities of the module `last/completer`.
// The `@ any` tag is matched with any input after the `/description` command, adding the already entered characters to the list of auto-completions.
// In our case, it will be matched against the entered user names, including the users offline.
var point_set = point.addComplete('set', undefined, userlist_to_autocomlete )
					 .addComplete('@any');


	// Register the command `/description set {username} {email}` and set the handler for it.
	point_set.addComplete('@re/(\\w+([-+.\']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*)/', cmd_set_email);

	// Register the command `/description set {username} {description}` and set the handler for it.
	point_set.addComplete('@any', cmd_set_description);



// Register the command `/description delete {username}`.
// We could register the processors of the `/description delete {username}` command in the same way as for the `/description set {username} ...` command.
// But to demonstrate the possibilities, I did it this way:
var point_delete = point.addComplete('delete');

	// the tag `@user` will add all users online to the `/description delete` list of auto-completions.
	// when processing the entered text, the `@user` tag will be matched to the names of the users online.
	point_delete.addComplete('@user',cmd_delete); 
	// To be able to specify nicknames of offline players after the `/description delete` command, use the `@any` tag.
	// Pay attention to the fact that nicknames of offline players will not be autocomplete.
	// And also to the fact that the `@any` tag is matched with any input.
	// So we use it last in the chain of autocomplete for the command `/description delete`.
	point_delete.addComplete('@any',cmd_delete);




// handler function for the `/description` and `/description help` commands
// in `params[0]` is a `description`
// in `params[1]` is a `help`
function cmd_help(params, sender){
	echo(sender, help_messages);
}

// handler function for the `/description list` command
// in `params[0]` is a `description`
// in `params[1]` is a `list`
function cmd_list(params, sender){
	var description_msg = ["Список пользователей для которых есть description:"];
	for(var name in store ){
		str = name + " - ";
		if( store[name].email )
			str += "<"+store[name].email+"> ";
		if( store[name].info )
			str += store[name].info;
		str+="\n";
		description_msg.push(str);
	}

	echo(sender, description_msg);
}

// handler function for the `/description set {username} {email}` commands
// in `params[0]` is a `description`
// in `params[1]` is a `{set}`
// in `params[2]` is a `{username}`
// in `params[3]` is a `{email}`
function cmd_set_email(params, sender){
	var name = params[2];
	var email = params[3];
	if( !store[name] )
		store[name] = {};
	store[name].email = email;
	echo(sender, "адрес электронной почты <"+email+"> успешно внесен в описание пользователя "+name);
}

// handler function for the `/description set {username} {you description}` commands
// in `params[0]` is a `description`
// in `params[1]` is a `{set}`
// in `params[2]` is a `{username}`
// in `params[3]` is a `{you description}`
function cmd_set_description(params, sender){
	params.shift();
	params.shift();
	var name = params.shift();
	var info = params.join(" ");
	if( !store[name] )
		store[name] = {};
	store[name].info = info;
	echo(sender, "информация успешно внесена в описание пользователя "+name);
}

// handler function for the `/description delete {username}` commands
// in `params[0]` is a `description`
// in `params[1]` is a `delete`
// in `params[2]` is a `username`
function cmd_delete(params, sender){
	var name = params[2];
	if( store[name] ){
		delete store[name];
		echo(sender, "описание для пользователя "+name+" успешно удалено");
	}else{
		echo(sender, "отсутствует описание для пользователя "+name);	
	}
	
}

// function returns an associative array whose keys are nicknames of all users registered on the server
function userlist_to_autocomlete(sender,patern){
	var result = {};
	var users = org.bukkit.Bukkit.getOfflinePlayers();
	for(var user in users){
		var name = users[user].name;
		result[name] = true;
	}
	return result;
}


