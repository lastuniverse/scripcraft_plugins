console.log("EXIT of cost.js");
return;

var list = scload("./scriptcraft/data/config/modules/last/cost/list.json");
var key_list = scload("./scriptcraft/data/config/modules/last/cost/key_list.json");
var data_list = {};
var craft_list = {};
var base_list = {};
var isDebug = false;


for( var i in list ){
	var name = list[i];
	var mat = scload("./scriptcraft/data/config/modules/last/cost/recipes/"+name+".json");

	var key = get_key(mat.result);
	data_list[key.full] = mat;
}



for( var i in data_list ){
	var mat = data_list[i];
	var key = get_key(mat.result);
	if(key.smollest)
		continue;
	if(craft_list[key.key])
		continue;


	if( key.key == "minecraft:tripwire_hook" )
		isDebug = true;
	var cost = parse_cost(mat);

	var test = {};
	test[key.full] = true;

	var items = parse_keys(mat, test, cost);
	craft_list[key.key] = items;//merge_hash(craft_list[key.key]||{},items);
	isDebug = false;
}

scsave(base_list,"./scriptcraft/data/config/modules/last/cost/base_list.json");
scsave(craft_list,"./scriptcraft/data/config/modules/last/cost/craft_list.json");
//scsave(key_list,"./scriptcraft/data/config/modules/last/cost/key_list.json");
console.log("SUCCESS");

/************************************************************/
/************************************************************/
/************************************************************/
function parse_keys(mat,test,cost){
	var result = {};
	var list = mat.key;
	if( !list && !mat.ingredients )
		return result;

	if( !list ){
		list = {};
		for( var i in mat.ingredients ){
			var item = mat.ingredients[i];
			if( Array.isArray(item) )
				item = item[0];
			if( Array.isArray(item) )
				item = item[0];
			var key = get_key(item);
			list[key.key] = item;
		}
		
	}
	for( var i in list ){
		var keys = list[i];
		var items = parse_key(keys,test,cost);
		result = merge_hash(result, items);
	}
	return result;
}


function parse_key(keys,test,cost){
	var result = {};

	if( typeof keys != "object" ){
		if(isDebug)
			console.log("NOOBJECT KEY 01: "+JSON.stringify(keys) );
		return result;
	}

	keys = array_extract(keys);

	for( var i in keys ){
		var subtest = array_extract(test);
		var item = keys[i];
		var key = get_key(item);
		if( !key || !key.key ){
			if(isDebug)
				console.log("UNSPECIFIC KEY 01: "+JSON.stringify(keys) );
			continue;
		}

		if(subtest[key.full]){
			if(isDebug)
				console.log("REQURSIVE KEY 01: "+key.full+" "+JSON.stringify(keys) );
			continue;
		}
		subtest[key.full] = true;

		if( key.smollest ){
			if(isDebug)
				console.log("KEY 01: "+key.full );

			result[key.key]   = (result[key.key]||0) + (cost[key.key]||"ахтунг");
			base_list[key.key] = true;
			//craft_list[key.key]=true;
		}else if( !data_list[key.full] ){
			if(isDebug)
				console.log("KEY 02: "+key.full );

			result[key.key]   = (result[key.key]||0) + (cost[key.key]||"ахтунг");
			base_list[key.key] = true;
			//craft_list[key.key]=true;
		}else{
			if(isDebug)
				console.log("KEY 03: "+key.full );

			var subcost = parse_cost(data_list[key.full], cost[key.key]);
			var items = parse_keys(data_list[key.full], subtest, subcost);

			result = merge_hash(result,items);
			if( !Object.keys(items).length ){
				result[key.key]   = (result[key.key]||0) + (cost[key.key]||"ахтунг");
				base_list[key.key] = true;
			}
			//craft_list[key.key] = merge_hash(craft_list[key.key]||{},items);

		}
		break;
	}
	if(isDebug)
		console.log("RESULT: "+JSON.stringify(result) );

	return result;
}

/************************************************************/
/************************************************************/
/************************************************************/

function get_key(item){
	var key = ""+item.item+(item.data?":"+item.data:":0");
	var ret = {
		full: key
	};
	if(	key_list[key] ){
		ret.key = key_list[key].key;
		ret.smollest = key_list[key].smollest;
	}else{
		console.log("UNSPECIFIC KEY: ["+key+"] ["+typeof item+"]");
	}
	return ret;
}

function has_smollest(item){
	var key = ""+item.item+(item.data?":"+item.data:":0");
	if(	key_list[key] )
		if(key_list[key].smollest)
			return true;
	return false;
}

function merge_hash(hash1,hash2){
	var result = {};
	for( var i in hash1 ){
		result[i] = hash1[i];
	}
	for( var i in hash2 ){
		result[i] = (result[i]||0)+hash2[i];
		//result[i] = hash2[i];
	}
	return result;
}

function array_extract(arr,result) {
	result = result||[];
	if( typeof arr !== "object" )
		return result;

	if( !Array.isArray(arr) )
		arr = [arr];

	for( var i in arr ){
		var item = arr[i];
		if( Array.isArray(item) )
			item = item[0];

		if( Array.isArray(item) )
			item = item[0];

			//result = array_extract(item,result);

		result.push(item);
	}
	return result;
}

/************************************************************/
/************************************************************/
/************************************************************/

function parse_cost(mat,multipler){
	multipler=multipler||1;
	var keys = {};
	var cost = {};
	var count = mat.result.count||1;
	if( mat.type == "crafting_shaped" ){
		var arr = mat.pattern.join("").split("");
		for(var i in arr){
			var key = arr[i];
			if( !keys[key] )
				keys[key] = 0;
			keys[key]++;
		}
		for(var i in keys){
			var ikey = keys[i];
			if(mat.key[i]){
				var item = mat.key[i];
				if( Array.isArray(item) )
					item = item[0];
				var key = get_key(item);
				cost[key.key] = ikey;
			}
		}
	}else if( mat.type == "crafting_shapeless" ){
		for(var i in mat.ingredients){
			var item = mat.ingredients[i];
			if( Array.isArray(item) )
				item = item[0];
			var key = get_key(item);
			if( !cost[key.key] )
				cost[key.key] = 0;
			cost[key.key]++;
		}
	}
	for(var i in cost){
		cost[i]=multipler*cost[i]/count;
	}
	return cost;
}
// var nnn = {
//   "type": "crafting_shapeless",
//   "ingredients": [
//     {
//       "item": "minecraft:gunpowder"
//     },
//     {
//       "item": "minecraft:blaze_powder"
//     },
//     [
//       {
//         "item": "minecraft:coal",
//         "data": 0
//       },
//       {
//         "item": "minecraft:coal",
//         "data": 1
//       }
//     ]
//   ],
//   "result": {
//     "item": "minecraft:fire_charge",
//     "count": 3
//   }
// };
// var mmm = {
//   "type": "crafting_shaped",
//   "group": "wooden_fence",
//   "pattern": [
//     "W#W",
//     "W#W"
//   ],
//   "key": {
//     "#": {
//       "item": "minecraft:stick"
//     },
//     "W": {
//       "item": "minecraft:planks",
//       "data": 2
//     }
//   },
//   "result": {
//     "item": "minecraft:birch_fence",
//     "count": 3
//   }
// };

// var pap = {
//   "type": "crafting_shaped",
//   "pattern": [
//     "###"
//   ],
//   "key": {
//     "#": {
//       "item": "minecraft:reeds"
//     }
//   },
//   "result": {
//     "item": "minecraft:paper",
//     "count": 3
//   }
// }
// var ccc = parse_cost(pap,3);
// console.log("PAPER: "+JSON.stringify(ccc));









