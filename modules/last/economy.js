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
//var cost_table = scload("./scriptcraft/data/config/modules/last/economy/cost_table.json");
var craft_table = scload("./scriptcraft/data/config/modules/last/economy/craft_table.json");
var base_table = scload("./scriptcraft/data/config/modules/last/economy/base_table.json");
var enchants_table = scload("./scriptcraft/data/config/modules/last/economy/enchants_table.json");

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


/**
 * Преобразовывет число монет в строку с указанием названия монет в правильном падеже и в локализации игрока
 * @param  {object} player объект игрока, для которого производится преобразование
 * @param  {number} amount количество монет
 * @return {string}        строка содержащая количество монет и их название в правильном падеже и в локализации игрока
 */
exports.coinsDecline = coinsDecline;
function coinsDecline(player,amount){
  var n = coins.number(amount);
  return locale.getMessage(player, "${coins."+n+"}");
}

/**
 * Забыл уже для чего нужна
 * @param {[type]} itemstack [description]
 * @param {[type]} amount    [description]
 */
exports.addBuy = addBuy;
function addBuy(itemstack, amount){
  // var key = match_table[itemstack.type]; //inventory.getItemStackHash(itemstack);
  // if( !key )
  //   return;

  // var product = store.products[key][0];
  // product.buy+=amount;
}

/**
 * Забыл уже для чего нужна
 * @param {[type]} itemstack [description]
 * @param {[type]} amount    [description]
 */
exports.addSell = addSell;
function addSell(itemstack, amount){
  // var key = match_table[itemstack.type]; //inventory.getItemStackHash(itemstack);
  // if( !key )
  //   return;

  // var product = store.products[key][0];
  // product.sell+=amount;
}


/**
 * Преобразовывает строку или число к целому числу
 * @param  {number|string} number число или строка содержащая число
 * @return {number}        целое число
 */
exports.toInt = _toInt;
function _toInt(number){
  //var result = Math.floor(Number(number));
  var result = Math.floor(parseInt(''+number,10));
  if( isNaN(result) ) result = 0;
  return result;
}

/**
 * Возвращает количество монет у игрока
 * @param  {object} player объект игрока, для которого смотрим количество монет
 * @return {number}        количество монет
 */
exports.getMoney = function(player){
  var User = users.getPlayer(player);

  if( !User.isPresent )
  	return 0;

  if( !User.data.coins )
  	return 0;

  return User.data.coins;
};


/**
 * Устанавливает игроку новое количество монет
 * @param  {object} player объект игрока, для которого производится финансовая операция
 * @param  {number} amount количество монет
 * @return {number}        если операция не удалась, возвращает false, в остальных случаях возвращает количество монет у игрока
 */
exports.setMoney = function(player,amount){
  var money = _toInt(amount);
  if( money < 0 ) money = 0;

  var User = users.getPlayer(player);

  if( !User.isPresent )
  	return false;

  User.data.coins=money;

  return User.data.coins;
};


/**
 * Добавляет игроку некоторое количество игровых монет к уже имеющимся. Возможно добавлять отрицательное количество игровых монет, но при этом результат не должен быть меньше нуля.
 * @param  {object} player объект игрока, для которого производится финансовая операция
 * @param  {number} amount количество игровых монет
 * @return {number}        если операция не удалась, возвращает false, в остальных случаях возвращает количество игровых монет у игрока
 */
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


/**
 * Запрос о выводе в консоль чата финансовой информации об игроке.
 * @param  {object} sender объект игрока, который производит запрос. Нужен для определения локализации и адресата выводимого сообщения.
 * @param  {object} player объект игрока, для которого производится запрос финансовой информации
 */
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

/**
 * Запрос на перевод игровых монет от одного игрока другому. Нельзя запросить перевод отрицательной суммы. Нельзя перевести монет больше, чем их имеется у игрока инициировавшего запрос. Результат выполнения запроса будет выведен в консоль чата у обоих участников финансовой транзакции.
 * @param  {object} sender объект игрока, который производит запрос на перевод игровых монет.
 * @param  {object} player объект игрока, которому будет произведен перевод игровых монет.
 * @param  {number} amount количество игровых монет
 */
exports.payMoney = function(sender,reciver,amount){
  var money = _toInt(amount);
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


/**
 * Запрос на дарение игроку игровых монет. Допускается запросить дарение отрицательной суммы. Результат выполнения запроса будет выведен в консоль чата у обоих участников запроса.
 * @param  {object} sender объект игрока, который производит запрос на дарение игровых монет.
 * @param  {object} player объект игрока, которому будет произведено дарение игровых монет.
 * @param  {number} amount количество игровых монет
 */
exports.giveMoney = giveMoney;
function giveMoney(sender,reciver,amount){
  var money = _toInt(amount);

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


/**
 * Запрос на дарение игровых монет всем игрокам находящимся в игре (в онлайне). Допускается запросить дарение отрицательной суммы. Результат выполнения запроса будет выведен в консоль чата у всех участников запроса.
 * @param  {object} sender объект игрока, который производит запрос на дарение игровых монет.
 * @param  {number} amount количество игровых монет
 */
exports.giveAll = function(sender,amount){
  var money = _toInt(amount);
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

/**
 * Запрос на вывод в консоль чата финансового топа
 * @param  {object} sender объект игрока, который производит запрос на вывод финансового топа.
 * @param  {number} top размерность топа
 */
exports.getTop = function(sender,top){
  var hash = users.getAllUsers();
  var list = [];
  for(var i in hash ){
    list.push(hash[i]);
  }

  list = list.sort(function(a,b){
    if (a.coins > b.coins) return -1;
    if (a.coins < b.coins) return 1;
  });

  var msg = "" + top + ":\n";
  for(var i in list ){
      var user = list[i];
      msg += i + ". " + user.name + " (" + user.coins + " " + coinsDecline(sender, user.coins) + ")\n";
  }
  return locale.warn( sender, "${msg.top} " + msg );
};


/**
 * Запрос на расчет базовой цены блоков или предметов
 * @param  {object} item объект блока или предмета, для которого будет производится расчет цены.
 * @param  {number} amount количество предметов
 * @return {object}        ассоциативный массив, содержащий поля:
 *  - cost с расчитанной базовой ценой блока или предмета в количестве amount
 *  - amount количество блоков или предметов
 */
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

  cost += get_enchants_cost(item);

  var amount = amount||1;
  var base = amount*cost;
  var price = {
    amount: amount,
    cost: base,
    buy: Math.floor( base/2 )||1,
    sell: Math.floor( base*2 )||4
  }
  return price;
}


/**
 * Запрос на расчет базовой цены блока или предмета
 * @param  {object} item объект блока или предмета, для которого будет производится расчет цены.
 * @return {number}        false если  расчет невозможен, в противном случае расчитанная базовая ценой блока или предмета 
 */
exports.getCost = function(item){
  //console.log("getCost 01 "+JSON.stringify(item));
  if( !item || !item.type )
    return false;

  //console.log("getCost 02");
  var name = match_table[item.type];
  if( !name )
    return false;

  //console.log("getCost 03");
  var cost = get_cost(name.minecraft_name);
  if( !cost )
    return false;

  //console.log("getCost 04");
  cost += get_enchants_cost(item);
  return cost;
}

function get_cost(name){
  //console.log("get_cost 01 "+name);
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

function get_enchants_cost(item){
  //console.log("get_enchants_cost 01");
  var cost = 0;
  if( typeof item !== "object" )
    return cost;

  //console.log("get_enchants_cost 02");
  if( !item.meta || typeof item.meta !== "object" )
    return cost;

  //console.log("get_enchants_cost 03");
  var enchants = undefined;
  if( item.meta.enchants && typeof item.meta.enchants === "object" )
    enchants = item.meta.enchants;

  if( item.meta["stored-enchants"] && typeof item.meta["stored-enchants"] === "object" )
    enchants = item.meta["stored-enchants"];

  //console.log("get_enchants_cost 04");
  if( !enchants )
    return cost;

  //console.log("get_enchants_cost 05");
  for(var e in enchants){
    var enchant = enchants_table[e];
    var lvl = enchants[e];
    if( lvl<1 ) lvl=1;
    var ecost = enchant.cost * Math.pow(2,lvl-1);
    //console.log("enchant\t\tcost: "+enchant.cost+"\t\tlvl: "+lvl+"\t\tcost: "+ecost);
    cost+=ecost;
  }
  return cost;
}

