/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин админских бездонных магазинов
 * 
 * Позволяет создавать 1 тип магазинов:
 * - "adminshop" - магазин (табличка). Торговля происходит в виде удаления/добавления содержимого в инвентарь игрока. На табличке указан тип магазина (1 строка), цена на покупку, количество товара  и цена на продажу (2 строка), наименование товара (4 строка)
 *
 * ### Установка магазинов
 *    - установить табличку с надписями:
 *      - 1 строка - тип магазина "adminshop"
 *      - 2 строка - цена покупки, количесвно товара цена продажи, заполняются цифрами через пробел
 *      - 3 строка - пустая
 *      - 4 строка - текстовый идентификатор товара.
 *      
 * ### Важно:
 * ***В настоящий момент магазин умеет торговать следующими видами товаров:***
 *    - все обычные товары
 *    - чареные вещи
 *    - книги зачарования
 *    - именованные товары
 * ***Товары с которыми предвижу проблемы:***
 *    - раскрашенные флаги (при торговле слетит раскраска, останется только базовый цвет)
 *    - раскрашенные фейрверки (при торговле слетит раскраска, останется только базовый цвет)
 *    - книги с текстом (превратятся в пустые книги)
 *    - карты (станут пустыми)
 *    - зелья (даже не представляю что с ними будет :)
 *    - яйца призыва (даже не представляю что с ними будет :)
 *    - а также товары содержащие следующие типы 
 *  
 * ### Использование магазинов
 *  - ЛКМ - для продажи указанного количества товара по указаной цене 
 *  - ПКМ - для покупки указанного количества товара по указаной цене 
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/economy     - модуль экономики
 * - modules/last/signs       - модуль событий связанных с табличками
 * - modules/last/users       - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * - modules/last/locales     - модуль локализации
 * - modules/last/inventory   - модуль работы с инвентарем и материалами
 * 
 * @module plugins/last/last_chestshop
 */

 
 /*   =================================================================
                  TODEV

    3. добавить permissions
       - разрешения:
         - last_chestshop.set.shop   - разрешение ставить магазины типа типа "shop"
         - last_chestshop.set.store  - разрешение ставить магазины типа типа "store"
         - last_chestshop.set.hyper  - разрешение ставить магазины типа типа "hyper"
         - last_chestshop.set.*      - разрешение ставить магазины любого типа
       - опции
         - last_chestshop.max.all   - максимальное количество всех видов магазов разрешенное для установки
         - last_chestshop.max.shop  - максимальное количество магазов типа "shop" разрешенное для установки
         - last_chestshop.max.store - максимальное количество магазов типа "store" разрешенное для установки
         - last_chestshop.max.hyper - максимальное количество магазов типа "hyper" разрешенное для установки
         - last_chestshop.distance  - максимальная дистанция удаления магазов типа "hyper" от соответствующих им "store"

    4. добавить локализацию

    6. добавить проверку наличия коинов

    7. добавить защиту на сундуки

    8. исправить баг с двойным кликом ЛКМ
      а. готово. добавлено ограничение на ЛКМ по табличкам с функционалом. срабатывает не чаще чем раз в 300 мс.

    10. Навесить на ПКМ топором событие идентификации

    =================================================================
 */

if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}

var utils = require('utils');
var syssigns = require('signs');
var users = require('last/users');
var signs = require('last/signs');
var eventex = require('last/eventex');
var economy = require('last/economy');
var locales = require('last/locales');
var timetools = require('last/timetools');
var completer = require('last/completer');
var inventory =  require('last/inventory');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/adminshop.json");
if(!config.enable)
  return console.log("plugins/last/last_adminshop  DISABLED");;

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_adminshop", config.locale||"ru_ru");

// загружаем хранилище данных
var shops = persist('data/plugins/last/adminshop', {});


timetools.callAfterTime(adminShopRevision,5000);


/* Функции производяд отчистку shops */
function adminShopRevision(){
  utils.foreach (Object.keys(shops), function( key ) {
    var shop = shops[key];
    var shop = shops[key];
    var loc = utils.locationFromJSON(shop.loc);
    var block = utils.blockAt( loc );
    var sign = syssigns.hasSign(block);
    if( !sign ){
      delete shops[key];
      return;
    }
    if( sign.getLine(0) !== "adminshop" ){
      delete shops[key];
      return;
    }
    correctShop(sign, shop );
  },50);
}

/**
 * Функция автокорректировке цен на установленных админшопах
 */
function correctShop(sign, shop){
  // вычисляем количество и стоимость товара
  var amount = shop.price.amount;
  var item = shop.itemstack;
  var price = economy.getPrice(item, amount);
  if( !price )
    return console.log("1 товара нет в базе "+item.type);

  shop.price = price;
  
  var mat = item.type + (item.damage?":"+item.damage:"");
  // устанавливаем нужные надписи в 1-й и 4-й строках
  sign.setLine(0,"adminshop");
  sign.setLine(1,""+shop.price.buy+" < "+shop.price.amount+" > "+shop.price.sell);
  sign.setLine(2,"");
  sign.setLine(3,mat);
  sign.update();
  //return locale.warn(sender, "магазин успешно создан");
}


/**
 * Вызывается перед основным обработчиком события onClick...
 * Определяет тип таблички, и если табличка принадлежит этому плагину, устанавливает название события которое должно быть вызвано
 * а такжеь является ли табличка неломаемой (сломать можно будет любым топором).
 * Функция модифицирует объект event добавляя в него свойства :
 * - sign: собъект содердит следующие поля:
 *       - material_key:  название материала которым торгует табличка
 *       - player_name: имя хозяина таблички
 *       - type: тип таблички (shop, hyper или store)
 * @param  {object} event объект содержит свойства:
 *                        - native: стантартный евент события playerInteract
 *                        - block: блок по которому кликнули
 *                        - sign: содержит block.getState() 
 *                        - player: стандартный объект Player для игрока кликнувшего по табличке
 * @return {object} объект содержит свойства:
 *                  - signEvent: название евента который будет вызван следом
 *                  - isUnbreakable: true или false. Если true - то табличку можно сломать лишь топором.
 */
signs.events.onBeforeClickSign(function(event){
  // проверяем чтобы для этого магаза была запись в хранилище
  if( !testSign(event) )
    return;

  event.player = event.native.player;

  event.info = {
    signEvent: "onClickTrade",
    signType: "adminshop",
    isUnbreakable:true
  };
  return  event.info
});

/**
 * Функция вызывается если тип таблички был "adminshop"
 * @param  {object} event объект содержит свойства:
 *   - native: стантартный евент события playerInteract
 *   - block: блок по которому кликнули
 *   - player: стандартный объект Player для игрока кликнувшего по табличке
 *   - shop: содержит данные о магазине взятые из хранилища:
 *     - material: название материала которым торгует табличка
 *     - amount:    количество товара которым торгует табличка
 *     - buy :     цена продажи
 *     - sell:     ыена покупки
 */
signs.events.onClickSignEvent("onClickTrade",function (event){
  var action = event.native.getAction();
  event.action = action=='RIGHT_CLICK_BLOCK'?"buy":"sell";
  event.inventory = event.player.getInventory();

  // выполняем торговую операцию
  trade(event);
});

/**
 * Функция создает ключ из координат для хранения данных об установленных табличках в хранилище данных пользователя
 * @param  {object} loc объект с координатами 
 * @return {string}     строка представляющая собой уникальный ключ соотвествующий переданым координатам
 */
function createKey(loc) {
  var key = loc.world+'.'+loc.x+'.'+loc.y+'.'+loc.z;
  return key;
}

/**
 * Функция проверяет является ли табличка магазином
 * @param  {object} sign  объект с данными о табличке
 * @return {object}       если табличка была магазином возвращает объект с полями material_key,player,type и loc, иначе false
 */
function testSign(event) {
  var block = event.block = event.block || event.getBlock();

  // проверяем магазин ли это
  var sign = event.sign = syssigns.hasSign( block );
  if ( !sign )
    return false;

  var type = sign.getLine(0).toLowerCase();
  if( type !== 'adminshop' )
    return;

  var key = createKey( utils.locationToJSON( block.getLocation() ) );
  event.shop = shops[key];
  if( !event.shop )
    return false;
  return true;
}

/**
 * Функция осуществляет торговую операцию
 * @param  {objecta содержит следующие поля
 * - player: event.native.player,
 * - player_name: event.native.player.name,
 * - player_inv = event.trade.player.getInventory();
 * - owner_name: data.player_name,
 * - owner_store = shop.store;
 * - owner_inv = inventory.getInventoryAt(shop.shop.loc);
 * - shop_type: data.type,
 * - shop_store = shop.shop;
 * - material_key: data.material_key
 * - price = shop.shop.price;
 * @return {boolean}      true в случае если обмен совершен, иначе false
 */
exports.trade = trade;
function trade(event){
  //var item = itemStackFromJSON(data.shop_store.itemstack);
  //if(item) data.player_inv.addItem(item);
  if( event.action == "sell" )
    return sell(event);

  if( event.action == "buy" )
    return buy(event);
}

exports.sell = sell;
function sell(event){
  var itemstack = inventory.removeItemstackFromInventory(event.inventory, event.shop.itemstack, event.shop.price.amount);
  if(!itemstack)
    return locale.warn(event.player,"${msg.player_no_product}");

  var isSuccess = economy.addMoney(event.player,event.shop.price.buy);
  if(!isSuccess)
    return locale.warn(event.player,"чтото пошло не так");

  economy.addSell(itemstack, event.shop.price.amount);


  locale.echo(event.player,"${msg.player_sell}",{
    amount: event.shop.price.amount,
    product: event.shop.material,
    cost: event.shop.price.buy,
    coins_name: economy.coinsDecline(event.player, event.shop.price.buy)
  });
};



exports.buy = buy;
function buy(event){
  var isSuccess = economy.addMoney(event.player,0-event.shop.price.sell);
  if(!isSuccess)
    return locale.warn(event.player,"${msg.player_no_money}");

  var itemstack = inventory.itemStackFromJSON(event.shop.itemstack,event.shop.price.amount);

  economy.addBuy(itemstack, event.shop.price.amount);

  itemstack.setAmount(event.shop.price.amount);
  event.inventory.addItem(itemstack);

  locale.echo(event.player,"${msg.player_buy}",{
    amount: event.shop.price.amount,
    product: event.shop.material,
    cost: event.shop.price.sell,
    coins_name: economy.coinsDecline(event.player, event.shop.price.sell)
  });
};


// - material_key REDWOOD WOOD(1)
// - itemstack {type=WOOD, damage=1}

// - material_key SPRUCE_WOOD_STAIRS(0) facing WEST
// - itemstack {type=SPRUCE_WOOD_STAIRS}

// - material_key BIRCH WOOD(2)
// - itemstack {type=WOOD,  damage=2}

// - material_key ANVIL(0)
// - itemstack {type=ANVIL, amount=64}





/**
 * далее следуют обработчики команд
 */
function cmd_shop_help( params, sender ) {
  locale.help( sender,  "${help}" );
};


/**
 * Функция обработчик команды установки магазина
 * @param  {array}  params список переданных параметров
 * @param  {object} sender объект игрока вызвавшего команду
 */
function cmd_shop_set(params, sender){
  // определяем смотрим ли мы на табличку
  var sign = syssigns.getTargetedBy( sender );
    if ( !sign )
      return locale.warn(sender, "вы смотрите не на табличку");


  // вычисляем количество и стоимость товара
  var inv = sender.getInventory();
  var itemstack = inv.getItemInMainHand();
  var item = inventory.itemStackToJSON(itemstack,1,true);
  var amount = economy.toInt(params[2])||1;
  var price = economy.getPrice(item,amount);
  if( !price )
    return locale.warn(sender, "2 товара нет в базе "+item.type);

  // получаем координаты таблички
  var loc = utils.locationToJSON( sign.getLocation() );
  var mat = item.type + (item.damage?":"+item.damage:"");
  // устанавливаем нужные надписи в 1-й и 4-й строках
  sign.setLine(0,"adminshop");
  sign.setLine(1,""+price.buy+" < "+price.amount+" > "+price.sell);
  sign.setLine(2,"");
  sign.setLine(3,mat);
  sign.update();

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  var key = createKey(loc);
  shops[key] = {
    type: "adminshop",
    itemstack: item,
    material: mat,
    price: price,
    loc: loc
  };
  return locale.warn(sender, "магазин успешно создан");
}


/**
 * Функция обработчик команды изменения количества товара продаваемого магазином
 * @param  {array}  params список переданных параметров
 * @param  {object} sender объект игрока вызвавшего команду
 */
function cmd_shop_amount(params, sender){
  // определяем смотрим ли мы на табличку
  var sign = syssigns.getTargetedBy( sender );
  if ( !sign )
    return locale.warn(sender, "вы смотрите не на табличку");

  // получаем координаты таблички
  var loc = utils.locationToJSON( sign.getLocation() );
  var key = createKey(loc);
  var shop = shops[key];
  if ( !shop )
    return locale.warn(sender, "это не админский магазин");

  var amount = economy.toInt(params[2])||1;
  shop.price.amount = economy.toInt(params[2])||1;
  
  correctShop(sign, shop);

  return locale.warn(sender, "количество товара успешно скоректировано");
}


var point_shop = completer.addPlayerCommand('adminshop',undefined,undefined,"last_adminshop.admin")
    point_shop.addComplete('help',cmd_shop_help);

var point_shop_set = point_shop.addComplete('set');
    point_shop_set.addComplete('@re/[0-9]+/',cmd_shop_set);

var point_shop_amount = point_shop.addComplete('amount');
    point_shop_amount.addComplete('@re/[0-9]+/',cmd_shop_amount);





function searchChest(location){
    var loc = utils.locationFromJSON(location);
    var chest = loc.subtract(1,0,0).getBlock();    
    
    loc = utils.locationFromJSON(location);
    if( chest.getType() != "CHEST" && chest.getType() != "TRAPPED_CHEST" )
      chest = loc.subtract(0,0,1).getBlock();

    loc = utils.locationFromJSON(location);
    if( chest.getType() != "CHEST" && chest.getType() != "TRAPPED_CHEST" )
      chest = loc.add(1,0,0).getBlock();

    loc = utils.locationFromJSON(location);
    if( chest.getType() != "CHEST" && chest.getType() != "TRAPPED_CHEST" )
      chest = loc.add(0,0,1).getBlock();

    if( chest.getType() != "CHEST" && chest.getType() != "TRAPPED_CHEST" ){
      console.log("type: "+chest.getType());
      return false;
    }

    return chest.getState();
    // sign.setLine(0,"");
    // sign.update();

}


function searchShops(x1,y1,z1,x2,y2,z2,amount){
  for (var x = x1; x <= x2; x++) {
  for (var y = y1; y <= y2; y++) {
  for (var z = z1; z <= z2; z++) {
    var location = {
      world: "world",
      x: x,
      y: y,
      z: z,
      yaw: 0,
      pitch: 0      
    };
    var key = createKey(location);
    var loc = utils.locationFromJSON(location);
    var block = utils.blockAt( loc );
    var sign = syssigns.hasSign(block);
    if( !sign )
      continue;

    // if( sign.getLine(0) !== "" || sign.getLine(1) !== "" || sign.getLine(2) !== "" || sign.getLine(3) !== "" )
    //   continue;

    var chest = searchChest(location); 
    if(!chest)
      continue;

    var inv = chest.getBlockInventory();
    var invent = chest.getInventory();
    var itemstack = invent.getItem(0);

    if( !itemstack )
      continue;
    
    var item = inventory.itemStackToJSON(itemstack,1,true);
    var price = economy.getPrice(item,amount);
    if( !price )
      continue;

    console.log("+++++++++");

    var mat = item.type + (item.damage?":"+item.damage:"");
    // устанавливаем нужные надписи в 1-й и 4-й строках
    sign.setLine(0,"adminshop");
    sign.setLine(1,""+price.buy+" < "+price.amount+" > "+price.sell);
    sign.setLine(2,"");
    sign.setLine(3,mat);
    sign.update();

    // формируем данные для сохранения в хранилище гипермагазинов игрока
    shops[key] = {
      type: "adminshop",
      itemstack: item,
      material: mat,
      price: price,
      loc: location
    };


  }}}
}

// searchShops(13,27,-22,22,30,-22,16);
// searchShops(3,27,-41,11,30,-22,16);
// searchShops(3,27,-56,3,32,-45,1);
// searchShops(26,27,-78,31,32,-78,16);
// searchShops(33,27,-78,36,32,-78,1);
// searchShops(40,27,-78,43,32,-78,16);
// searchShops(45,27,-78,59,32,-78,64);
// searchShops(59,27,-78,59,32,-72,64);
// searchShops(59,27,-69,59,27,-59,8);
// searchShops(59,28,-69,59,29,-59,64);
// searchShops(59,30,-69,59,32,-59,32);
// searchShops(59,27,-55,59,30,-52,1);
// searchShops(59,27,-49,59,28,-45,1);
// searchShops(59,29,-49,59,29,-45,4);
// searchShops(59,30,-49,59,30,-45,8);
// searchShops(59,27,-41,59,30,-35,16);
