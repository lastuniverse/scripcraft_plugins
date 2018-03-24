/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

'use strict';

if (!__plugin.bukkit){
  console.warn('last/inventory supported in Spigot only');
  return;
}
var bkItemStack = Packages.org.bukkit.inventory.ItemStack;
var bkEnchantment = Packages.org.bukkit.enchantments.Enchantment;
var bkMaterial = Packages.org.bukkit.Material;
var bkMaterialData = Packages.org.bukkit.material.MaterialData;

// загружаем config
var config = scload("./scriptcraft/data/config/modules/last/inventory.json");



var utils = require('utils');

//exports.isBreakable()

// {type=DIAMOND_AXE, damage=43, meta=UNSPECIFIC_META:{meta-type=UNSPECIFIC, enchants={DIG_SPEED=5, DURABILITY=3, LOOT_BONUS_BLOCKS=3, MENDING=1}}}
// {"type":"ENCHANTED_BOOK","meta":"ENCHANTED_META":{"meta-type":"ENCHANTED","stored-enchants":{"MENDING":1}}}

function itemRecurseParse(obj){
	var json = {};
	for (var i in obj) {
		var item = obj[i];
		//console.log("!!!!! typeof "+typeof item);
		if( typeof item === "object" ){
			json[i] = itemRecurseParse(item);
		}else{
			json[i] = item;	
		}
		
	}
	return json;
}

exports.getItemStackHash = getItemStackHash;
function getItemStackHash(itemstack){
	var json = {
		type: itemstack.type,
		damage: itemstack.damage,
	};
	if(itemstack.meta){
		if(itemstack.meta["display-name"])
			json["name"] = itemstack.meta["display-name"];
		if(itemstack.meta.enchants)
			json.enchants = itemstack.meta.enchants;
		if(itemstack.meta["stored-enchants"])
			json["stored-enchants"] = itemstack.meta["stored-enchants"];
	}
	var hash = JSON.stringify(json);
	return hash;
}


//{type=DIAMOND_PICKAXE, meta=UNSPECIFIC_META:{meta-type=UNSPECIFIC, display-name=шёлк libbar, enchants={DIG_SPEED=4, SILK_TOUCH=1, DURABILITY=3, MENDING=1}, repair-cost=3}}
//jdk.nashorn.internal.runtime.ECMAException: SyntaxError: Invalid JSON: <json>:1:82 Expected , or } but found "
//{"type":"DIAMOND_PICKAXE", "meta":{"meta-type":"UNSPECIFIC", "display-name":"шёлк" "libbar", "enchants":{"DIG_SPEED":4, "SILK_TOUCH":1, "DURABILITY":3, "MENDING":1}, "repair-cost":3}}


// - itemstack {type=WOOD, damage=1}
// - itemstack {type=SPRUCE_WOOD_STAIRS}
// - itemstack {type=WOOD,  damage=2}
// - itemstack {type=ANVIL, amount=64}
// type - строка (тип) https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/Material.html
// amount - количество элементов
// damage - либо подвид блока (ну например разные породы дерева)
//          либо дамадж для изнашиваемых блоков
//          
//          
exports.itemStackToJSON = itemStackToJSON;
function itemStackToJSON(itemstack,amount,repair){
	if(!itemstack)
		return false;


	var json = itemRecurseParse(itemstack.serialize());
	if(json.meta){
		var meta = itemstack.getItemMeta();

		json.meta = itemRecurseParse(meta.serialize());
		if(json.meta.patterns){

			json.meta.patterns = meta.getPatterns();
			console.log("!!!!!!!! itemStackToJSON meta: " + json.meta.patterns);
			// var patterns = {};
			// for (var i in json.meta.patterns ) {
			// 	patterns[i] = json.meta.patterns[i].serialize();
			// }
			// json.meta.patterns = patterns;
		}
	}

	json.amount = amount||json.amount||1;
	json.damage = json.damage||0;
	if(repair)
		if(config.breakable[json.type])
			json.damage = 0;

	if(json.meta)
		console.log("!!!!!!!! itemStackToJSON meta: " + JSON.stringify(json.meta));

	return json;
}

exports.itemStackFromJSON = itemStackFromJSON;
function itemStackFromJSON(json,amount,damage,repair){
	json.amount = amount||json.amount||1;
	json.damage = damage||json.damage||0;

	if(repair)
		if(config.breakable[json.type])
			json.damage = 0;

	var itemstack = new bkItemStack( bkMaterial[json.type], json.amount, json.damage);

	//itemstack.deserialize([json]);
	if(json.meta){
		console.log("!!!!!!!! itemStackFromJSON meta: " + itemstack.serialize().toString());

		if(json.meta.enchants)
			addEnchantsToItemStack(itemstack,json.meta.enchants);
		
		if(json.meta["stored-enchants"])
			addEnchantsToBook(itemstack,json.meta["stored-enchants"]);

		if(json.meta["display-name"]){
			var meta = itemstack.getItemMeta();
			meta.setDisplayName(json.meta["display-name"]);
			itemstack.setItemMeta(meta);
		}
	}
		
    return itemstack
}


exports.findItemstackInInventory = findItemstackInInventory;
function findItemstackInInventory(inventory,itemstack,amount){
	var itemstacks = inventory.getStorageContents()
	var returnstak = undefined;
	for(var item in itemstacks){
		var json = itemStackToJSON(itemstacks[item]);
		if( compareItemStack(itemstack,json) ){
			amount-= json.amount;
			returnstak = itemstacks[item];
		}
		if( amount <= 0 )
			return returnstak;
	}
	return false;
}

exports.removeItemstackFromInventory = removeItemstackFromInventory;
function removeItemstackFromInventory(inventory,itemstack,amount){
	var list = [];
	var isPresent = false;
	var itemstacks = inventory.getStorageContents();
	var returnstak = undefined;
	for(var item in itemstacks){
		var json = itemStackToJSON(itemstacks[item]);
		if( compareItemStack(itemstack,json) ){
			amount-= json.amount;
			list.push(itemstacks[item]);
			returnstak = itemstacks[item];
		}
		if( amount <= 0 ){
			isPresent = true;
			break;
		}
	}
	if( isPresent ){
		for(var item in list){
			inventory.removeItem(list[item]);
		}
		amount = Math.abs(amount);
		if( amount ){
			returnstak.setAmount(amount);
			inventory.addItem(returnstak);
			//inventory.addItem(itemStackFromJSON(itemstack,amount));
		}
	}
	return isPresent?returnstak:false;
}



exports.compareItemStack = compareItemStack;
function compareItemStack(itemstack1,itemstack2){
	// console.log("\n=========================================================");
	// console.log("1: " + JSON.stringify(itemstack1) );
	// console.log("2: " + JSON.stringify(itemstack2) );
	if(itemstack1.type !== itemstack2.type)
		return false;
	if(itemstack1.damage !== itemstack2.damage)
		return false;	
	var meta = compareItemStackMeta(itemstack1.meta,itemstack2.meta);
	if( !meta )
		return false;
	return true;
}

exports.compareItemStackMeta = compareItemStackMeta;
function compareItemStackMeta(meta1,meta2){
	if( !meta1 && !meta2)
		return true;
	if( meta1 && !meta2 )
		return false;
	if( meta2 && !meta1 )
		return false;
	if( meta1["display-name"] !== meta2["display-name"] )
		return false;

	var enchants = compareItemStackEnchants(meta1.enchants,meta2.enchants);
	if( !enchants )
		return false;
	enchants = compareItemStackEnchants(meta1["stored-enchants"],meta2["stored-enchants"]);
	if( !enchants )
		return false;	
	return true;
}

exports.compareItemStackEnchants = compareItemStackEnchants;
function compareItemStackEnchants(enchants1,enchants2){
	if( !enchants1 && !enchants2)
		return true;
	if( enchants1 && !enchants2 )
		return false;
	if( enchants2 && !enchants1 )
		return false;
	if( Object.keys(enchants1).length != Object.keys(enchants2).length )
		return false;
	for(var key in enchants1 ){
		if( !enchants2[key] )
			return false;
		if( enchants1[key] != enchants2[key] )
			return false;
	}
	return true;
}


exports.addEnchantsToItemStack = addEnchantsToItemStack;
function addEnchantsToItemStack(itemstack,enchants){
	for (var enchant in enchants) {
		addEnchantToItemStack(itemstack,enchant,enchants[enchant]);
	}
}

exports.addEnchantToItemStack = addEnchantToItemStack;
function addEnchantToItemStack(itemstack,enchant,level){
	var ench = bkEnchantment[enchant];
	itemstack.addEnchantment(ench, level);
}

exports.addEnchantsToBook = addEnchantsToBook;
function addEnchantsToBook(itemstack,enchants){
	console.log("!!!!!!!! addEnchantsToBook "+JSON.stringify(enchants));
	for (var enchant in enchants) {
		addEnchantToBook(itemstack,enchant,enchants[enchant]);
	}
}

exports.addEnchantToBook = addEnchantToBook;
function addEnchantToBook(itemstack,enchant,level){
	console.log("!!!!!!!! addEnchantToBook "+enchant+" "+level)
	var ench = bkEnchantment[enchant];
	var meta = itemstack.getItemMeta();
	meta.addStoredEnchant(ench, level, true);
	itemstack.setItemMeta(meta);
}


exports.getInventoryAt = getInventoryAt;
function getInventoryAt(loc){
	var loc = utils.locationFromJSON(loc);
	var chest = utils.blockAt( loc );
	var type = chest.getType();

	if( type != 'TRAPPED_CHEST' && type != 'CHEST' )
		return false;

	var chest_inv = chest.getState().getInventory();

	return chest_inv;
}



// function onClickSignShop(event){
//   console.log("!!!!!!!!!!!! onClickSignShop");
//   var block = event.getClickedBlock();
//   var key = getLocationKey(block);
//   var shop = store.shops[key];
//   if( shop ){
//     if( shop.type == 'shop' ){
//       onUseShop(event, shop);
//     }else if( shop.type == 'hypershop' ){
//       onUseHyperShop(event, shop);
//     }
//   }
// };

// function onUseShop(event, shop){
//   console.log("!!!!!!!!!!!! onUseShop");

//   var loc = utils.locationFromJSON(shop.loc.chest);
//   var chest = utils.blockAt( loc );
//   var type = chest.getType();
  
//   if( type != 'TRAPPED_CHEST' && type != 'CHEST' )
//     return echo( sender, redtext+'Похоже что магазин не работает.');

//   var player = event.getPlayer();

//   var action = event.getAction();
//   if( action == 'RIGHT_CLICK_BLOCK'){
//     onPlayerSell(player, chest, shop);
//   }else if( action ==  'LEFT_CLICK_BLOCK'){
//     onPlayerBye(player, chest, shop);
//   }

// // var diamond = new ItemStack(Material.DIAMOND, 64);
// // var inv = Bukkit.createInventory(null, 9, "Free Diamonds");
// // inv.addItem(diamond);

// };



// function onPlayerSell(player, chest, shop){
//     var item = items(shop.price.material, shop.price.amount);
//     var player_inv = player.getInventory();      
//     var isPresent = player_inv.containsAtLeast(item, shop.price.amount);
//     if(!isPresent)
//       return echo( player, redtext+'У вас нет товара для продажи.');

//     var chest_inv = chest.getState().getInventory();

//     //player_inv.setStorageContents(item, shop.price.amount);
//     player_inv.removeItem(item);
//     chest_inv.addItem(item);
//     echo( player, redtext+'Вы продали '+shop.price.amount+' едениц '+shop.price.material+' за '+shop.price.bye+' Жакониев.');
// };

// function onPlayerBye(player, chest, shop){
//     var item = items(shop.price.material, shop.price.amount);
//     var chest_inv = chest.getState().getInventory();
//     var isPresent = chest_inv.containsAtLeast(item, shop.price.amount);
//     if(!isPresent)
//       return echo( player, redtext+'В магазине нет товара для продажи.');

//     var player_inv = player.getInventory();      

//     //player_inv.setStorageContents(item, shop.price.amount);
//     chest_inv.removeItem(item);
//     player_inv.addItem(item);
//     echo( player, redtext+'Вы купили '+shop.price.amount+' едениц '+shop.price.material+' за '+shop.price.bye+' Жакониев.');
// };


// function onUseHyperShop(event, shop){
//   console.log("!!!!!!!!!!!! onUseHyperShop");

// };
