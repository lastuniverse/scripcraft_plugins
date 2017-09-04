/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * Позволяет создавать 1 тип магазинов:
 * - "usershop" - магазин (табличка). Торговля происходит в виде обмена содержимым между инвентарем игрока и сундуком магазина, по указанным на табличке ценам. На табличке указан тип магазина "usershop" (1 строка), цена на покупку, количество товара  и цена на продажу (2 строка), никнэйм хозяина магазина (3 строка) и наименование товара (4 строка).             
 * 
 * ## Команды
 * - `/usershop help` : эта справка
 * - `/usershop set {amount} {buy} {sell}` : создать из таблички на которую смотрите магазин для товара находящегося в руке в колличестве `{count}` с ценой продажы `{amount}*cost*{sell}/100` и покупки `{amount}*cost*{buy}/100` указанной в процентах от базовой серверной цены на этот товар.
 * - `/usershop reset {amount} {buy} {sell}` : изменить количество и цену покупаемого/продаваемого товара в магазине, представленном табличкой на которую вы смотрите.
 * - `/usershop reset {amount}` : изменить цену покупаемого/продаваемого товара в магазине, представленном табличкой на которую вы смотрите.
 * - `/usershop reset {buy} {sell}` : изменить количество покупаемого/продаваемого товара в магазине, представленном табличкой на которую вы смотрите.
 * 
 * где `cost` это серверная цена за 1 данного товара.
 * 
 * ## Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_usershop.set` - разрешение на установку/изменение магазинов командами `/usershop set ...` и `/usershop reset ...`.
 * 
 * **Параметры:** *могут быть выставленны персонально для разных групп и отдельных пользователей*
 * 
 * ## Установка магазинов
 *  - поставить сундук или сундук ловушку
 *  - установить сундук
 *  - на сундук установить пустую табличку
 *  - взять в руки товар которым должен будет торговать магазин
 *  - навести курсор (взгляд) на установленную табличку
 *  - ввести команду установки магазина /usershop set {amoun} {bye} {sell}
 * 
 * Где:
 * - `{buy}` - цена скупки указанная в процентах от базовой серверной цены за еденицу выбранного товара
 * - `{amount}` - количество товара меняемого за 1 клик
 * - `{sell}` - цена продажи указанная в процентах от базовой серверной цены за еденицу выбранного товара
 * 
 * ## Использование магазинов
 *  - ЛКМ - для продажи указанного количества товара по указаной цене 
 *  - ПКМ - для покупки указанного количества товара по указаной цене 
 * 
 * ## Важно
 *  
 * **В настоящий момент магазин умеет торговать следующими видами товаров:**
 *  - все обычные товары
 *  - чареные вещи
 *  - книги зачарования
 *  - именованные товары
 *  
 * **Товары с которыми предвижу проблемы:**
 *  - раскрашенные флаги (при торговле слетит раскраска, останется только базовый цвет)
 *  - раскрашенные фейрверки (при торговле слетит раскраска, останется только базовый цвет)
 *  - книги с текстом (превратятся в пустые книги)
 *  - карты (станут пустыми)
 *  - зелья (даже не представляю что с ними будет :)
 *  - яйца призыва (даже не представляю что с ними будет :)
 *  - а также товары содержащие следующие типы 
 * 
 * ## зависимости:
 * > - utils - стандартный модуль ScriptCraft
 * > - signs - стандартный модуль ScriptCraft
 * > - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * > - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * > - modules/last/economy     - модуль экономики
 * > - modules/last/users       - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * > - modules/last/signs       - модуль событий связанных с табличками
 * > - modules/last/locales     - модуль локализации
 * > - modules/last/inventory   - модуль работы с инвентарем и материалами
 * > - modules/last/timetools           - модуль работы с функчиями времени
 * 
 * @module plugins/last/last_usershop
 */

 
 /*   =================================================================
                  TODEV

    3. добавить permissions
       - разрешения:
         - last_chestshop.set   - разрешение ставить магазины типа типа "usershop"
       - опции
         - last_chestshop.max   - максимальное количество магазов разрешенное для установки игроку

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
var config = scload("./scriptcraft/data/config/plugins/last/usershop.json");
if(!config.enable)
  return console.log("plugins/last/last_usershop  DISABLED");;

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_usershop", config.locale||"ru_ru");

// загружаем хранилище данных
// var shops = persist('data/plugins/last/usershop', {});


timetools.callAfterTime(userShopRevision,5000);


/* Функции производяд отчистку shops */
function userShopRevision(){
  var user_list = users.getAllUsers();
  for(var UUID in user_list ){
    var userdata = user_list[UUID]; 
    if( !userdata )
      continue;

    var shops = userdata["last_usershop"];
    if( !shops )
      continue;

    utils.foreach (Object.keys(shops), function( key ) {
      var shop = shops[key];
      var loc = utils.locationFromJSON(shop.loc);
      var block = utils.blockAt( loc );
      var sign = syssigns.hasSign(block);
      if( !sign ){
        delete shops[key];
        return;
      }
      if( sign.getLine(0) !== "usershop" ){
        delete shops[key];
        return;
      }
      loc = utils.locationFromJSON(shop.chest);
      block = utils.blockAt( loc );
      var type = ""+block.getType();
      if( type !== "CHEST" && type !== "TRAPPED_CHEST" ){
        delete shops[key];
        return;
      }
      correctShop(sign, shop );
    },200);
  }
}

/**
 * Функция автокорректировке цен на установленных админшопах
 */
function correctShop(sign, shop){
  // вычисляем количество и стоимость товара
  var amount = shop.price.amount;
  var buy = shop.price.buy;
  var sell = shop.price.sell;
  var item = shop.itemstack;

  var price = getPrice(item, amount, buy, sell);
  if( !price )
    return console.log("товара нет в базе "+item.type);

  shop.price = price;
  
  var mat = item.type + (item.damage?":"+item.damage:"");
  // устанавливаем нужные надписи в 1-й и 4-й строках
  sign.setLine(0,"usershop");
  sign.setLine(1,""+shop.price.cost.buy+" < "+shop.price.amount+" > "+shop.price.cost.sell);
  sign.setLine(2,shop.owner);
  sign.setLine(3,mat);
  sign.update();
  //console.log("CORRECTED "+item.type);
}

/**
 * Функция расчитывает прайс
 */
function getPrice(item,amount,buy,sell){
  amount = Math.abs(economy.toInt(amount))||1;
  buy = Math.abs(economy.toInt(buy))||50;
  sell = Math.abs(economy.toInt(sell))||200;
  //console.log("item: "+JSON.stringify(item) );

  if( amount<1 ) amount = 1;
  if( amount>64 ) amount = 64;
  if( buy>100 ) buy = 100;
  if( sell<100 ) sell = 100;  

  var cost = economy.getCost(item);
  if( !cost )
    return false;

  var price = {
    amount: amount,
    buy: buy,
    sell: sell
  };

  var base = price.amount*cost;
  
  price.cost = {
    buy: Math.floor( base*price.buy/100 )||1,
    sell: Math.floor( base*price.sell/100 )||4
  };
  
  return price;
}

/**
 * Добавляет раздел "last_chestshop" в data игрока
 * в data/last_users-store.json  
 */
eventex.events.on("onPlayerJoin", function ( event ) {
  var player = users.getPlayer(event.player);
  if( !player.data["last_usershop"] )
    player.data["last_usershop"] = {};  
});

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
  if( !testShop(event) )
    return;

  event.player = event.native.player;

  event.info = {
    signEvent: "onClickTradeUsershop",
    signType: "usershop",
    isUnbreakable:true
  };
  return  event.info
});

/**
 * Функция вызывается если тип таблички был "usershop"
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
signs.events.onClickSignEvent("onClickTradeUsershop",function (event){
  var action = event.native.getAction();
  event.action = action=='RIGHT_CLICK_BLOCK'?"buy":"sell";
  event.player_inventory = event.player.getInventory();

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
 * Функция проверяет является ли табличка существующим магазином
 * @param  {object} sign  объект с данными о табличке
 * @return {object}       если табличка была магазином возвращает объект с полями material_key,player,type и loc, иначе false
 */
function testShop(event) {
  var block = event.block = event.block || event.getBlock();

  // проверяем магазин ли это
  var sign = event.sign = syssigns.hasSign( block );
  if ( !sign )
    return false;

  // первая строка на табличке - usershop
  var type = sign.getLine(0).toLowerCase();
  if( type !== 'usershop' )
    return false;

  // третья строка на табличке - имя пользователя
  var username = sign.getLine(2);
  if( !username )
    return false;

  // пользователя нет в хранилище данных о пользователях
  var userdata = users.getPlayer(username); 
  if( !userdata.isPresent )
    return false;

  // y пользователя нет магазинов
  if( !userdata.data["last_usershop"] )
    return false;

  var data = userdata.data["last_usershop"];
  var loc = utils.locationToJSON( block.getLocation() );
  var key = createKey( loc );

  // y пользователя нет этого магазина
  if( !data[key] )
    return false;

  event.shop = data[key];

  // y магазина нет сундука
  event.shop_inventory = inventory.getInventoryAt(event.shop.chest);
  if( !event.shop_inventory )
    return false;

  return true;
}

/**
 * Функция проверяет является ли табличка магазином
 * @param  {object} sign  объект с данными о табличке
 * @return {object}       если табличка была магазином возвращает объект с полями material_key,player,type и loc, иначе false
 */

/**
 * Функция ищет сундук на который поставлена табличка
 * @param  {object} location объект с координатами в которых установленна табличка
 * @return {object}          объект с координатами в которых установленн сундук, если сундука нет то false
 */
function findChest(location) {
  var world = location.getWorld();
  var search = [
    {x: 1, y: 0, z: 0},
    {x: -1, y: 0, z: 0},
    {x: 0, y: 0, z: 1},
    {x: 0, y: 0, z: -1},
    {x: 0, y: 1, z: 0}
  ];

  for(var i in search ){
    var offset = search[i];
    var loc = utils.locationToJSON( location );
    loc.x+=offset.x;
    loc.y+=offset.y;
    loc.z+=offset.z;
    loc = utils.locationFromJSON(loc);
    var block = world.getBlockAt(loc);
    var type = ""+block.getType();
    if ( type === "CHEST" || type === "TRAPPED_CHEST" )
      return utils.locationToJSON(loc);
  }

  return false;
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
  var price = event.shop.price;
  var itemstack = inventory.removeItemstackFromInventory(event.player_inventory, event.shop.itemstack, price.amount);
  if(!itemstack)
    return locale.warn(event.player,"${msg.player_no_product}");

  var money = economy.getMoney(event.shop.owner);
  if( money < price.cost.buy )
    return  locale.warn(event.player,"${msg.owner_no_money}");

  var isSuccess = economy.addMoney(event.shop.owner,0-price.cost.buy);
  if(!isSuccess)
    return locale.warn( event.player,"${msg.owner_no_money}" );

  isSuccess = economy.addMoney(event.player,price.cost.buy);
  if(!isSuccess)
    return locale.warn( event.player,"${msg.xz} 01" );

  itemstack.setAmount(price.amount);
  event.shop_inventory.addItem(itemstack);

  economy.addSell(itemstack, price.amount);

  var msgdata = {
    amount: price.amount,
    product: event.shop.material,
    cost: price.cost.buy,
    coins_name: economy.coinsDecline(event.player, price.cost.buy)
  };
  locale.echo(event.player,"${msg.player_sell}",msgdata);

  var owner = utils.player(event.shop.owner);
  if( owner ){
    msgdata.coins_name = economy.coinsDecline(owner, price.cost.buy);
    locale.echo(owner,"${msg.owner_sell}",msgdata);
  }
};



exports.buy = buy;
function buy(event){
  var price = event.shop.price;

  var itemstack = inventory.removeItemstackFromInventory(event.shop_inventory, event.shop.itemstack, price.amount);
  if(!itemstack)
    return locale.warn(event.player,"${msg.shop_is_empty}");

  var money = economy.getMoney(event.player);
  if( money < price.cost.sell )
    return locale.warn(event.player,"${msg.player_no_money}");

  var isSuccess = economy.addMoney(event.player,0-event.shop.price.sell);
  if(!isSuccess)
    return locale.warn(event.player,"${msg.player_no_money}");

  var isSuccess = economy.addMoney(event.shop.owner,price.cost.buy);
  if(!isSuccess)
    return locale.warn( event.player,"${msg.xz} 02" );

  //var itemstack = inventory.itemStackFromJSON(event.shop.itemstack,event.shop.price.amount);


  itemstack.setAmount(price.amount);
  event.player_inventory.addItem(itemstack);

  economy.addBuy(itemstack, event.shop.price.amount);

  var msgdata = {
    amount: price.amount,
    product: event.shop.material,
    cost: price.cost.sell,
    coins_name: economy.coinsDecline(event.player, price.cost.sell)
  };

  locale.echo(event.player,"${msg.player_buy}", msgdata );

  var owner = utils.player(event.shop.owner);
  if( owner ){
    msgdata.coins_name = economy.coinsDecline(owner, price.cost.sell);
    locale.echo(owner,"${msg.owner_buy}",msgdata);
  } 

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
    return locale.warn(sender, "${msg.see}");

  if ( sign.getLine(0) !== "" && sign.getLine(0) !== "usershop" )
    return locale.warn(sender, "${msg.xz}");

  if ( sign.getLine(0) == "usershop" && sign.getLine(2) !== sender.name )
    return locale.warn(sender, "${msg.xz}");

  // получаем координаты таблички
  var location = sign.getLocation();
  var loc = utils.locationToJSON( location );
  var key = createKey(loc);

  // получаем координаты сундука
  var chest = findChest(location);
  if( !chest )
    return locale.warn(sender, "${msg.no_chest}");

  // вычисляем количество и стоимость товара
  var inv = sender.getInventory();
  var itemstack = inv.getItemInMainHand();
  var item = inventory.itemStackToJSON(itemstack,1,true);
  
  var amount = params[2]||1;
  var buy = params[3]||50;
  var sell = params[4]||200;

  var price = getPrice(item, amount, buy, sell);
  if( !price )
    return locale.warn(sender, "${msg.no_product_of_base}", { product: item.type } );

  var mat = item.type + (item.damage?":"+item.damage:"");
  // устанавливаем нужные надписи в 1-й - 4-й строках
  sign.setLine(0,"usershop");
  sign.setLine(1,""+price.cost.buy+" < "+price.amount+" > "+price.cost.sell);
  sign.setLine(2,sender.name);
  sign.setLine(3,mat);
  sign.update();

  var userdata = users.getPlayer(sender.name);
  var shops = userdata.data["last_usershop"];

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  shops[key] = {
    type: "usershop",
    owner: sender.name,
    UUID: ''+sender.getUniqueId(),
    itemstack: item,
    material: mat,
    price: price,
    loc: loc,
    chest: chest
  };
  return locale.warn(sender, "${msg.create_success}");
}


/**
 * Функция обработчик команды изменения магазина
 * @param  {array}  params список переданных параметров
 * @param  {object} sender объект игрока вызвавшего команду
 */
function cmd_shop_reset_amount(params, sender){
  cmd_shop_reset(sender,params[2],undefined,undefined);
  console.log("cmd_shop_reset_amount");
};
function cmd_shop_reset_cost(params, sender){
  cmd_shop_reset(sender,undefined,params[2],params[3]);
  console.log("cmd_shop_reset_cost");
};
function cmd_shop_reset_all(params, sender){
  cmd_shop_reset(sender,params[2],params[3],params[4]);
  console.log("cmd_shop_reset_all");
};

function cmd_shop_reset(sender, amount, buy, sell){
  // определяем смотрим ли мы на табличку
  var sign = syssigns.getTargetedBy( sender );
  if ( !sign )
    return locale.warn(sender, "${msg.see}");

  // получаем координаты таблички
  var location = sign.getLocation();
  var loc = utils.locationToJSON( location );
  var key = createKey(loc);

  // получаем данные о магазинах пользователя
  var userdata = users.getPlayer(sender.name);
  if ( !userdata )
    return locale.warn(sender, "${msg.no_shops}");

  var shops = userdata.data["last_usershop"];
  if ( !shops )
    return locale.warn(sender, "${msg.no_shops}");

  var shop = shops[key];
  if ( !shop )
    return locale.warn(sender, "${msg.no_you_shop}");

  // вычисляем количество и стоимость товара
  var item = shop.itemstack; //inventory.itemStackToJSON(shop.itemstack,1,true);

  amount = amount||shop.price.amount;
  buy = buy||shop.price.buy;
  sell = sell||shop.price.sell;
  
  var price = getPrice(item, amount, buy, sell);
  if( !price )
    return locale.warn(sender, "${msg.no_product_of_base}", { product: item.type } );

  var mat = item.type + (item.damage?":"+item.damage:"");

  // устанавливаем нужные надписи в 1-й - 4-й строках
  sign.setLine(0,"usershop");
  sign.setLine(1,""+price.cost.buy+" < "+price.amount+" > "+price.cost.sell);
  sign.setLine(2,sender.name);
  sign.setLine(3,mat);
  sign.update();

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  shops[key] = {
    type: "usershop",
    owner: sender.name,
    UUID: ''+sender.getUniqueId(),
    itemstack: item,
    material: mat,
    price: price,
    loc: loc,
    chest: shop.chest
  };

  return locale.warn(sender, "${msg.apdate_success}");
}



var point_shop = completer.addPlayerCommand('usershop',undefined,undefined)
    point_shop.addComplete('help',cmd_shop_help);

var point_shop_set = point_shop.addComplete('set',undefined,undefined,"last_usershop.set");
    point_shop_set.addComplete('@re/[0-9]+/',cmd_shop_set);

var point_shop_reset = point_shop.addComplete('reset',undefined,undefined,"last_usershop.set")
    .addComplete('@re/[0-9]+/',cmd_shop_reset_amount)
    .addComplete('@re/[0-9]+/',cmd_shop_reset_cost)
    .addComplete('@re/[0-9]+/',cmd_shop_reset_all);







