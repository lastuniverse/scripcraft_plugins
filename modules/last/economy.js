/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Модуль управления экономикой
 * 
 * Собирает статистику использования магазинов, отслеживает среднесерверную цену на товары, позволяет производить транзакции игровой валюты между игроками и сервисами.
 *
 * ### Важно
 *  ...
 * 
 * ### зависимости:
 * - modules/last/signs       - модуль событий связанных с табличками
 * 
 * @module modules/last/econony
 */

// добавть команды для изменения цен в магазинах
// доработать магазы под указание процентов


'use strict';

/* Global requires */
var users = require('last/users');
var decline = require('last/decline');
var inventory =  require('last/inventory');

var coins = new decline.Decline(['ундефинчик','ундефинчика','ундефинчиков']);
exports.coins = coins;

var locales = require('last/locales');

// загружаем хранилище данных
var store = persist('data/modules/last/economy', {
  products: {}
});

var match_table = scload("./scriptcraft/data/config/modules/last/economy/match_table.json");
var cost_table = scload("./scriptcraft/data/config/modules/last/economy/cost_table.json");


// загружаем конфиг
var config = scload("./scriptcraft/data/config/modules/last/economy.json");

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/modules/last/", "economy", config.locale||"ru_ru");






var CALC_DAYS = 15;
var FAKE = 1000;




// testNextDay();
// function testNextDay(){
//   var date = new Date();
//   date = date.toDateString();
//   if( store.date !== date ){
//     store.date = date;
//     costReInit();
//   }
//   //costReInit();
// }

// function costReInit(){
//   for(var key in store.products){
//     var cost = store.products[key][0].cost;
//     if( store.products[key].length >= CALC_DAYS )
//       store.products[key].pop();
//     store.products[key].unshift({
//       buy: 0,
//       sell: 0,
//       cost: cost
//     });
//     //costReCalc(store.products[key]);
//   }
// }

// function costReCalc(product){
//   var buy =0;
//   var sell =0;
//   var cost = product[0].cost;
//   for(var i in product){
//     buy += product[i].buy;
//     sell += product[i].sell;
//   }
//   var Qs = sell + FAKE;
//   var Qb = buy + FAKE;

//   var Q = (1-(Qs/Qb))*0.2;

//   product[0].cost = cost + cost*Q;
// }

exports.coinsDecline = coinsDecline;
function coinsDecline(player,number){
  var n = coins.number(number);
  return locale.getMessage(player, "${coins."+n+"}");
}


exports.addBuy = addBuy;
function addBuy(itemstack, amount){
  // var key = match_table[itemstack.type]; //inventory.getItemStackHash(itemstack);
  // if( !key )
  //   return;

  // var product = store.products[key][0];
  // product.buy+=amount;
}

exports.addSell = addSell;
function addSell(itemstack, amount){
  // var key = match_table[itemstack.type]; //inventory.getItemStackHash(itemstack);
  // if( !key )
  //   return;

  // var product = store.products[key][0];
  // product.sell+=amount;
}


exports.toInt = _toInt;
function _toInt(number){
  //var result = Math.floor(Number(number));
  var result = Math.floor(parseInt(''+number,10));
  if( isNaN(result) ) result = 0;
  return result;
}

exports.getMoney = function(player){
  var User = users.getPlayer(player);

  if( !User.isPresent )
  	return 0;

  if( !User.data.coins )
  	return 0;

  return User.data.coins;
};


exports.setMoney = function(player,number){
  var money = _toInt(number);
  if( money < 0 ) money = 0;

  var User = users.getPlayer(player);

  if( !User.isPresent )
  	return false;

  User.data.coins=money;

  return User.data.coins;
};


exports.addMoney = function(player,number){
  var money = _toInt(number);
  //if( money < 0 ) money = 0;

  var User = users.getPlayer(player);

  if( !User.isPresent )
  	return false;

  if( !User.data.coins )
  	User.data.coins=0;

  if( User.data.coins+money < 0 )
  	return false;

  User.data.coins+=money;

  return User.data.coins;
};


exports.howMuchMoney = function(sender, player){
  var User = users.getPlayer(player);
  var Sender = users.getPlayer(sender);

  if( !User.isPresent ){
    return locale.warn( Sender.player,  "${msg.player_undefined} ", {player: User.name} );
  	return 0;
  }
    
  if( !User.data.coins ){
    locale.warn( Sender.player, "${msg.player_not_coins}", {
      player: User.name,
      coins_name: coinsDecline(Sender.player,5)
    });
  	return 0;
  }


  locale.warn( Sender.player, "${msg.me_coins}", {
      player: User.name,
      coins: User.data.coins,
      coins_name: coinsDecline(Sender.player, User.data.coins)
  });
  return User.data.coins;
};


exports.payMoney = function(sender,reciver,number){
  var money = _toInt(number);
  if( money < 0 ) money = 0;

  var Sender = users.getPlayer(sender);

  if( !Sender.data.coins )
    return locale.warn( Sender.player, "${msg.not_client}" );

  if( Sender.data.coins < money )
    return locale.warn( Sender.player, "${msg.not_coins}", {
      coins_name: coinsDecline(Sender.player, 5)
    });

  var Reciver = users.getPlayer(reciver);
  if( !Reciver.isPresent )
    return locale.warn( Sender.player, "${msg.player_undefined}", {player: Reciver.name});
    

  if( !Reciver.data.coins )
  	Reciver.data.coins = 0;

    Sender.data.coins-=money;
    Reciver.data.coins+=money;

  locale.warn( Sender.player,  "${msg.pay.trade}", {
    player: Reciver.name,
    coins: money,
    coins_name: coinsDecline(Sender.player, money)
  });
  locale.warn( Reciver.player, "${msg.pay.player}", {
    player: Sender.name,
    coins: money,
    coins_name: coinsDecline(Sender.player, money)
  });
};



function giveMoney(sender,reciver,number){
  var money = _toInt(number);

  var Sender = users.getPlayer(sender);

  var Reciver = users.getPlayer(reciver);
  if( !Reciver.isPresent )
    return locale.warn( Sender.player,  "${msg.player_undefined}", {player: Reciver.name});

  if( !Reciver.data.coins )
  	Reciver.data.coins = 0;

  Reciver.data.coins+=money;
  locale.warn( Sender.player, "${msg.give.trade}",{
    coins: money,
    coins_name: coinsDecline(money)
  });

  locale.warn( Reciver.player, "${msg.give.player}",{
    coins: money,
    coins_name: coinsDecline(money)
  });

};
exports.giveMoney = giveMoney;

exports.giveAll = function(sender,number){
  var money = _toInt(number);
  var Sender = users.getPlayer(sender);
  var user_list = users.getAllUsers();
  for(var key in user_list){
    var user = user_list[key];
    if( !user.coins )
      user.coins = 0;
    user.coins+=money;
  }
  locale.warn( Sender.player, "${msg.give.all}",{
    coins: money,
    coins_name: coinsDecline(Sender.player, money)
  });
};

exports.getTop = function(sender,number){

  var hash = users.getAllUsers();
  var list = [];
  for(var i in hash ){
    list.push(hash[i]);
  }

  list = list.sort(function(a,b){
    if (a.coins > b.coins) return -1;
    if (a.coins < b.coins) return 1;
  });

  var msg = "" + number + ":\n";
  for(var i in list ){
      var user = list[i];
      msg += i + ". " + user.name + " (" + user.coins + " " + coinsDecline(sender, user.coins) + ")\n";
  }
  return locale.warn( sender, "${msg.top} " + msg );
};





var craft_table = scload("./scriptcraft/data/config/modules/last/cost/craft_list.json");
var base_table = scload("./scriptcraft/data/config/modules/last/cost/base_list.json");


exports.getPrice = function(item,amount){
  
  //console.log("item: "+JSON.stringify(item) );
  if( !item || !item.type )
    return false;

  var name = match_table[item.type];
  if( !name )
    return false;

  var cost = get_cost(name.minecraft_name);
  if( !cost )
    return false;

  var amount = amount||1;
  var base = amount*cost;
  var price = {
    amount: amount,
    buy: Math.floor( base/2 )||1,
    sell: Math.floor( base*2 )||4
  }
  return price;
}

exports.getCost = function(item){
  
  //console.log("item: "+JSON.stringify(item) );
  if( !item || !item.type )
    return false;

  var name = match_table[item.type];
  if( !name )
    return false;

  var cost = get_cost(name.minecraft_name);
  if( !cost )
    return false;

  return cost;
}

function get_cost(name){
  var cost = base_table[name];
  if( !cost ){
    var recipie = craft_table[name];
    cost = 0;
    for( var item in recipie ){
      //console.log("ITEM: "+item);
      cost += get_cost(item)*recipie[item];
    }
  }
  return cost;
}

