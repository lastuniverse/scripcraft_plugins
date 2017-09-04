/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин магазинов и гипермагазинов
 * 
 * Позволяет создавать 3 типа магазинов:
 * - "shop"   - самый обычный магазин (табличка на сундуке). Торговля происходит в виде обмена содержимым между инвентарем игрока 
 *              и инвентарем сундука на который установленна табличка. На табличке указаны хозяин и тип магазина (1 строка), 
 *              количество товара (2 строка), цена на покупки и продажу (3 строка), наименование товара (4 строка)
 * - "store"  - все также как и для "shop", но имеет свое уникальное (среди всех store игрока) название.
 * - "hyper"  - выносная табличка интерфейс для "store", каждый "store" может иметь несколько таких табличек, каждая может быть со своей ценой и количеством товара
 *              
 *
 * ### Установка магазинов
 * ***Для установки магазинов типа "shop" необходимо:***
 *    - поставить сундук или сундук ловушку
 *    - в первую ячейку положить 1 или более едениц товара которым должен торговать данный магазин
 *    - установить на сундук табличку с надписями:
 *      - 1 строка - тип магазина "shop"
 *      - 2 строка - цена покупки, количесвно товара цена продажи, заполняются цифрами через пробел
 *      - 3 строка - пустая
 *      - 4 строка - заполняется автоматически названием товара лежащим в первой ячейке.
 *
 * ***Для установки магазинов типа "store" необходимо:***
 *    - поставить сундук или сундук ловушку
 *    - в первую ячейку положить 1 или более едениц товара которым должен торговать данный магазин
 *    - установить на сундук табличку с надписями:
 *      - 1 строка - тип магазина "store"
 *      - 2 строка - цена покупки, количесвно товара цена продажи, заполняются цифрами через пробел
 *      - 3 строка - уникальное название склада
 *      - 4 строка - заполняется автоматически названием товара лежащим в первой ячейке.
 *      
 * ***Для установки магазинов типа "hyper" необходимо:***
 *    - установить именованный "store"
 *    - установить на любой блок табличку с надписями:
 *      - 1 строка - тип магазина "hyper"
 *      - 2 строка - цена покупки, количесвно товара цена продажи, заполняются цифрами через пробел (если не заполнить, то возмет данные от привязанного "store")
 *      - 3 строка - уникальное название "store" к которому будет привязан данный "hyper"
 *      - 4 строка - заполняется автоматически названием товара лежащим в первой ячейке.
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
    1. добавить в onClickSignEvent определение инвентаря сундука для магазов типа "hyper"
       - если инвентаря нет то соответствующий евент
       а. готово.

    2. не позволять создавать магаз для битых товаров
       а. готово. создается как если бы товар не имел износа

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

    5. добавить поиск товара в подсундуках (в last/inventory)

    6. добавить проверку наличия коинов

    7. добавить защиту на сундуки

    8. исправить баг с двойным кликом ЛКМ
      а. готово. добавлено ограничение на ЛКМ по табличкам с функционалом. срабатывает не чаще чем раз в 300 мс.

    9. сделать для гиперов возможность ставить на стены и пол

    10. Навесить на ПКМ топором событие идентификации

    =================================================================
 */

if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}

var utils = require('utils');
var eventex = require('last/eventex');
var economy = require('last/economy');
var signs = require('last/signs');
var users = require('last/users');
var locales = require('last/locales');
var inventory =  require('last/inventory');



// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/chestshop.json");
if(!config.enable)
  return console.log("plugins/last/last_chestshop  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_chestshop", config.locale||"ru_ru");

/**
 * Добавляет раздел "last_chestshop" в data игрока
 * в data/last_users-store.json  
 */
eventex.events.on("onPlayerJoin", function ( event ) {
  var player = users.getPlayer(event.player);
  var modulename = "last_chestshop";
  
  if( !player.data[modulename] )
    player.data[modulename] = { 
      shop:{},
      hyper:{},
      store:{}
    };
  
});


/**
 * если устанавливаемая табличка - магазин то запускаем процедуру проверки правильности оформления и с сохранения
 * @param  {object} event  объект содержит данные о событии onSignPlace
 */
signs.events.onSignPlace(function(event){
  var type = event.native.getLine(0).toLowerCase();
  if( type == 'shop' )
    return onPlaseShop(event);
  if( type == 'hyper' )
    return onPlaseHyper(event);
  if( type == 'store' )
    return onPlaseStore(event);

});

/**
 * если табличка сломана то проверяем не магазинная табличка ли это и если да, то удаляем из хранилища
 * @param  {object} event  объект содержит данные о событии onSignPlace
 */
signs.events.onSignBreak( function (event){
  //console.log("!!! копипасть onSignBreak")
  var data = testSign(event);
  if( !data )
    return;


  var block = event.block || event.getBlock();
  var test = testFake(data,block);
  if( !test )
    return;

  removeSignData(data);
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
  var data = _testSign(event.sign.getLines());
  if( !data )
    return;


  // создаем сквозной объект для совершения торговой опрерации
  event.trade = {
    player: event.native.player,
    player_name: event.native.player.name,
    owner_name: data.player_name,
    shop_type: data.type,
    material_key: data.material_key
  };

  // 'onClickShop', 'onClickHyper', 'onClickStore'
  var eventName = "onClickTrade";//"onClick"+data.type.charAt(0).toUpperCase() + data.type.substr(1);

  event.sign_data = data;
  event.info = {
    signEvent: eventName,
    signType: data.type,
    isUnbreakable:true
  };
  return  event.info


});


/**
 * Функция вызывается если тип таблички был "shop"
 * @param  {object} event объект содержит свойства:
 *                        - native: стантартный евент события playerInteract
 *                        - block: блок по которому кликнули
 *                        - player: стандартный объект Player для игрока кликнувшего по табличке
 *                        - sign_data: содержит block.getState():
 *                            - material_key:  название материала которым торгует табличка
 *                            - player_name: имя хозяина таблички
 *                            - type: тип таблички (shop, hyper или store)
 */


signs.events.onClickSignEvent("onClickTrade",function (event){
  // проверяем не фэйковый ли магаз. фанка вернет false если фэйк или объект с полями:
  //  - store: хранилище данных хозяина магаза
  //  - shop:  хранилище данных этого магаза
  //  - player_name: ник хозяина магаза
  var shop = testFake(event.sign_data,event.block);
  if( !shop )
    return  locale.warn(event.player,"${msg.fake_shop}",{});

  var action = event.native.getAction();

  event.trade.player_inv = event.trade.player.getInventory();
  event.trade.owner_store = shop.store;
  event.trade.shop_store = shop.shop;
  event.trade.price = shop.shop.price;
  event.trade.action = "sell";
  if( action == 'RIGHT_CLICK_BLOCK')
    event.trade.action = "buy";

  if( event.trade.shop_type == "hyper" ){
    //console.log("!!!!! onClickSignEvent 01");
    var hyper = shop.store.data.last_chestshop.store[shop.shop.key];
    //console.log("!!!!! onClickSignEvent 02 "+JSON.stringify(shop.store.data.last_chestshop.store));
    if( !hyper )
      return locale.echo(event.player,"${msg.stote_is_epsent}");

    event.trade.owner_inv = inventory.getInventoryAt(hyper.loc);
    //console.log("!!!!! onClickSignEvent 03 "+JSON.stringify(hyper) );
  }else{
    event.trade.owner_inv = inventory.getInventoryAt(shop.shop.loc);
  }

  // выполняем торговую операцию
  trade(event.trade);
});



// /* Функции производяд отчистку store */
// function chestRevision(){
//   store.shops = chestShopRevision(store.shops);
//   //store.hypershops = chestRevision(store.hypershops);
//   scsave(store, 'last_signs');
// }

// /* Функции производяд отчистку store.shops */
// function chestShopRevision(list){
//   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 1");
//   for( var item in list ){
//     var loc = utils.locationFromJSON(list[item].loc.chest);
//     var block = utils.blockAt( loc );
//     var type = block.getType();
//     if( type != 'TRAPPED_CHEST' && type != 'CHEST' ){
//       delete list[item];
//       continue;
//     }
//     loc = utils.locationFromJSON(list[item].loc.sign);
//     block = utils.blockAt( loc );
//     type = block.getType();
//     if( type != 'WALL_SIGN' && type != 'SIGN_POST' )
//       delete list[item];
//   }
//   return list;
// }

//chestRevision();



// - material_key REDWOOD WOOD(1)
// - itemstack {type=WOOD, damage=1}

// - material_key SPRUCE_WOOD_STAIRS(0) facing WEST
// - itemstack {type=SPRUCE_WOOD_STAIRS}

// - material_key BIRCH WOOD(2)
// - itemstack {type=WOOD,  damage=2}

// - material_key ANVIL(0)
// - itemstack {type=ANVIL, amount=64}


/**
 * Функция проверки параметров при установке таблички магазина (shop). В случае если все параметры успешно прошли проверку, 
 * происходит регистрация данных о магазине в хранилище данных пользователя. Принимает параметр event содержащий поля:
 * - native : ссылка на стандартное значение event для события signChange
 * - against : объект блока на который установленна табличка
 * @param  {object} event содержимое определяется в модуле last/signs
 */
function onPlaseShop(event){
  // получаем надписи на табличке
  event.lines = event.native.getLines();
  
  // проверяем стоит ли табличка на сундуке
  event.type = testChest(event.against, event.lines);
  if( !event.type )
    return;

  // проверяем лежит ли в 1-й ячейке сундука товар
  event.item = testItemInChest(event.against, event.lines);
  if( !event.item )
    return;

  // вычисляем количество и стоимость товара
  event.price = testPrice(undefined,event.lines);

  // получаем объект игрока устанавливающего эту табличку
  event.player = utils.player( event.native.getPlayer() );

  // получаем для этого игрока его хранилище данных
  var userdata = users.getPlayer(event.player); 
  event.store = userdata.data["last_chestshop"];

  // устанавливаем нужные надписи в 1-й и 4-й строках
  event.itemstack = inventory.itemStackToJSON(event.item,1,true);
  event.material_key = event.itemstack.type+"("+event.itemstack.damage+")"; //  ''+event.item.getData()
  event.lines[0] = event.player.name + " shop";
  event.lines[3] = event.material_key;

  // получаем координаты таблички и сундука
  event.loc = {};
  event.loc.sign  = utils.locationToJSON( event.native.getBlock().getLocation() );
  event.loc.chest = utils.locationToJSON( event.against.getLocation() );

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  var data = {
    type: "shop",
    itemstack: event.itemstack,
    material_key: event.material_key,
    price: event.price,
    loc: event.loc.chest,
  };
  var key = createKey(event.loc.sign);
  // сохраняем их
  event.store.shop[key] = data;
}

/**
 * Функция проверки параметров при установке таблички гипермагазина (hyper). В случае если все параметры успешно прошли проверку, 
 * происходит регистрация данных о гипермагазине в хранилище данных пользователя. Принимает параметр event содержащий поля:
 * - native : ссылка на стандартное значение event для события signChange
 * - against : объект блока на который установленна табличка
 * @param  {object} event содержимое определяется в модуле last/signs
 */
function onPlaseHyper(event,data){
  // получаем надписи на табличке
  event.lines = event.native.getLines();

  // проверяем стоит ли табличка на сундуке
  // event.type = testChest(event.against, event.lines);
  // if( !event.type )
  //   return;

  // проверяем лежит ли в 1-й ячейке сундука товар
  // event.item = testItemInChest(event.against, event.lines);
  // if( !event.item )
  //   return;

  // проверяем указано ли название хранилища
  if( !event.lines[2] ){
    event.lines[0] = locale.findMsg("sign.store_unnamed.0");
    event.lines[1] = locale.findMsg("sign.store_unnamed.1");
    event.lines[2] = locale.findMsg("sign.store_unnamed.2");
    event.lines[3] = locale.findMsg("sign.store_unnamed.3");
    return;
  }
  event.key = event.lines[2];

  // вычисляем количество и стоимость товара
  event.price = testPrice(undefined,event.lines);

  // получаем координаты таблички
  event.loc = {};
  event.loc.sign  = utils.locationToJSON( event.native.getBlock().getLocation() );

  // получаем объект игрока устанавливающего эту табличку
  event.player = utils.player( event.native.getPlayer() );

  // получаем для этого игрока его хранилище данных
  var userdata = users.getPlayer(event.player); 
  event.store = userdata.data["last_chestshop"];





  // проверяем наличие зарегестрированного склада для товара event.item.material
  event.store_data = testStore(event.store.store, event.key);
  if( !event.store_data ){
    event.lines[0] = locale.findMsg("sign.store_undefined.0", { storename: event.key } );
    event.lines[1] = locale.findMsg("sign.store_undefined.1", { storename: event.key } );
    event.lines[2] = locale.findMsg("sign.store_undefined.2", { storename: event.key } );
    event.lines[3] = locale.findMsg("sign.store_undefined.3", { storename: event.key } );

    return;
  }  
  // если склад установлен а на табличке гипермагазина нет цен или количества, берем их от склада
  if( event.store_data ){
    event.itemstack = event.store_data.itemstack;
    if( event.price.buy == 0 || event.price.sell == 0 || event.price.amount == 0 ){
      event.price = event.store_data.price;
      event.lines[1] = event.price.buy + " < " + event.price.amount + " > " + event.price.sell;
    }
  }

  // устанавливаем нужные надписи в 1-й и 4-й строках
  //event.itemstack = inventory.itemStackToJSON(event.item,1,true);
  event.material_key = event.itemstack.type+"("+event.itemstack.damage+")"; //  ''+event.item.getData()
  event.lines[0] = event.player.name + " hyper";
  event.lines[3] = event.material_key;

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  var data = {
    type: "hyper",
    material_key: event.material_key,
    key: event.key,
    itemstack: event.itemstack,
    price: event.price    
  };
  var key = createKey(event.loc.sign);
  // сохраняем их
  event.store.hyper[key] = data;
}

/**
 * Функция проверки параметров при установке таблички склада (store). В случае если все параметры успешно прошли проверку, 
 * происходит регистрация данных о гипермагазине в хранилище данных пользователя. Принимает параметр event содержащий поля:
 * - native : ссылка на стандартное значение event для события signChange
 * - against : объект блока на который установленна табличка
 * @param  {object} event содержимое определяется в модуле last/signs
 */
function onPlaseStore(event,data){
  // получаем надписи на табличке
  event.lines = event.native.getLines();
  
  // проверяем стоит ли табличка на сундуке
  event.type = testChest(event.against, event.lines);
  if( !event.type )
    return;

  // проверяем лежит ли в 1-й ячейке сундука товар
  event.item = testItemInChest(event.against, event.lines);
  if( !event.item )
    return;

  // проверяем указано ли название хранилища
  if( !event.lines[2] ){
    event.lines[0] = locale.findMsg("sign.store_unnamed.0");
    event.lines[1] = event.key;
    event.lines[2] = locale.findMsg("sign.store_unnamed.2");
    event.lines[3] = locale.findMsg("sign.store_unnamed.3" );
    return;
  }

  // вычисляем количество и стоимость товара
  event.price = testPrice(undefined,event.lines);

  // получаем объект игрока устанавливающего эту табличку
  event.player = utils.player( event.native.getPlayer() );

  // получаем для этого игрока его хранилище данных
  var userdata = users.getPlayer(event.player); 
  event.store = userdata.data["last_chestshop"];

  // создаем объект для хранения item
  event.item_data = {};

  // устанавливаем нужные надписи в 1-й и 4-й строках
  event.itemstack = inventory.itemStackToJSON(event.item,1,true);
  event.material_key = event.itemstack.type+"("+event.itemstack.damage+")"; //  ''+event.item.getData()
  event.lines[0] = event.player.name + " store";
  event.lines[3] = event.material_key;

  // получаем название склада
  var key = event.lines[2];
  // проверяем указано ли название хранилища
  if( event.store.store[key] ){
    var loc = event.store.store[key].loc;
    event.lines[0] = locale.findMsg("sign.store_is_defined.0");
    event.lines[1] = locale.findMsg("sign.store_is_defined.1");
    event.lines[2] = "\""+key+"\"";
    event.lines[3] = "x:"+loc.x+" y:"+loc.y+" z:"+loc.z;
    return;
  }  


  // получаем координаты сундука
  event.loc = {};
  event.loc.chest = utils.locationToJSON( event.against.getLocation() );
  event.sign_key  = createKey( utils.locationToJSON( event.native.getBlock().getLocation() ) );

  // формируем данные для сохранения в хранилище гипермагазинов игрока
  var data = {
    type: "store",
    itemstack: event.itemstack,
    material_key: event.material_key,
    key: event.key,
    price: event.price,
    loc: event.loc.chest,
    sign_key: event.sign_key
  };
  
  // сохраняем их
  event.store.store[key] = data;
}

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
 * Функция проверяет чтобы переданный блок был сундуком или сундуком ловушкой
 * @param  {object} block объект с данными о блоке
 * @param  {array}  lines массив строк с надписями на табличке
 * @return {string}       если block - сундук, возвращает тип сундука, иначе false
 */
function testChest(block, lines) {
  var type = block.getType();
  if( type == 'TRAPPED_CHEST' || type == 'CHEST' )
    return type; 

  lines[0] = locale.findMsg("sign.chest_is_epsent.0");
  lines[1] = locale.findMsg("sign.chest_is_epsent.1");
  lines[2] = locale.findMsg("sign.chest_is_epsent.2");
  lines[3] = locale.findMsg("sign.chest_is_epsent.3");
  return false;
}

/**
 * Функция проверяет чтобы в первой ячейке сундука находился материал который собираемся продавать/покупать
 * @param  {object} block объект с данными о блоке
 * @param  {array}  lines массив строк с надписями на табличке
 * @return {string}       если первая ячейка не пуста возвращает объект itemStack для ее содержимого, иначе false
 */
function testItemInChest(block, lines) {
  var chest = block.getState();
  var invent = chest.getInventory();
  var item = invent.getItem(0);

  if( item )
    return item;

  lines[0] = locale.findMsg("sign.slot_is_empty.0");
  lines[1] = locale.findMsg("sign.slot_is_empty.1");
  lines[2] = locale.findMsg("sign.slot_is_empty.2");
  lines[3] = locale.findMsg("sign.slot_is_empty.3");
  return false;
}

/**
 * Функция проверяет правильность заполнения данных о количестве и цене товара
 * @param  {object} item  объект с данными о товаре
 * @param  {array}  lines массив строк с надписями на табличке
 * @return {string}       возвращает обхект содержащий поля (amount,buy,sell)
 */
function testPrice(item,lines) {
  var price = {};
//  lines[1] = price.amount;

  var cost = lines[1].split(/[^0-9]+/);;
  cost[0] = economy.toInt(cost[0]);
  cost[2] = economy.toInt(cost[2]);
  if( !cost[0] || cost[0]<0 ) cost[0] = 0;
  if( !cost[2] || cost[2]<0 ) cost[2] = 0;
  price.buy = cost[0];  
  price.sell = cost[2];
  if(price.buy>price.sell){
    price.buy = cost[2];  
    price.sell = cost[0];
  }
  price.amount = economy.toInt(cost[1]);
  if( price.amount < 1 ) price.amount = 1;
  if( price.amount > 64 ) price.amount = 64;

  lines[1] = price.buy + " < " + price.amount + " > " + price.sell;

  return price;
}

/**
 * Функция проверяет существует ли хранилище store для данного товара
 * @param  {object} store   ссылка на хранилище для складов store
 * @param  {string} material_key наименование товара
 * @return {object}       если существует возращает данные для хранилища данного товара
 */
function testStore(store, key) {
  if( !key )
    return false;

  if( !store || !store[key] )
    return false;

  return store[key];
}

/**
 * Функция проверяет не фэковый ли магазин
 * @param  {object} event тут много всяких данных ))))
 * @param  {object} block блок - табличка
 * @return {object}       если существует возращает данные для этого магазина, иначе false
 */
function testFake(data,block) {

  // получаем для игрока на табличке его хранилище данных
  var userdata = users.getPlayer(data.player_name); 
  //console.log("!!!!!!!!!!!! testFake 01 " + JSON.stringify(data) );
  
  // выходим если нет данных
  if( !userdata || !userdata.data || !userdata.data.last_chestshop )
    return false;
 
  // получаем храниличе для типа таблички
  store = userdata.data["last_chestshop"][data.type];

  // получаем ключь для текущей таблички
  var key = createKey( utils.locationToJSON( block.getLocation() ) );

  // выходим если тип shop или hyper но нет данных о табличке
  if( data.type == "shop" || data.type == "hyper" )
    if( !store[key] )
      return false;

  // выходим если тип store но нет данных о табличке
  if( data.type == "store" ){
    if( !store[data.key] )
      return false;
    if( store[data.key].sign_key != key )
      return false;
    key = data.key;
  }

  var temp = {
    store: userdata,
    shop: store[key],
    player_name: data.player_name
  };

  // data.material_key
  // data.player_name
  // data.type
  // data.block
  // data.chest
  
  return temp;
}

/**
 * Функция проверяет является ли табличка магазином
 * @param  {object} sign  объект с данными о табличке
 * @return {object}       если табличка была магазином возвращает объект с полями material_key,player,type и loc, иначе false
 */
function testSign(event) {
  var block = event.block || event.getBlock();
  var lines = block.getState().getLines();
  
  var data = _testSign(lines);

  if( !data )
    return false;

  data.loc = utils.locationToJSON( block.getLocation() );
  return data;
}

/**
 * Функция проверяет является ли табличка магазином
 * @param  {object} lines массив строк (надписи на табличке)
 * @return {object}       если табличка была магазином возвращает объект с полями material_key,player,type, иначе false
 */
function _testSign(lines) {
  var str = lines[0];
  var result = str.match( /^(.*?) (shop|hyper|store)$/ );
  if( !result )
    return false;

  if( !/^[0-9]+ \< [0-9]+ \> [0-9]+$/.test(lines[1]) )
    return false;

  var material_key = lines[3].match(/^(.+?)$/);
  if( !material_key )
    return false;

  var key = lines[2].match(/^(.+?)$/);

  if( result[2] !== "shop" )
    if( !key )
      return false;

  key = key?key[1]:"";
  
  var data = {
    material_key: material_key[1],
    key: key,
    player_name: result[1],
    type: result[2]
  };
  return data;
}

/**
 * Функции удаляют данные о табличке из гранилища пользователя
 * @param  {object} data  объект с полями material_key,player,type и loc
 */
function removeSignData(data) {
  if( data.type == 'shop' )
    return removeShopSignData(data);
  if( data.type == 'hyper' )
    return removeHyperSignData(data);
  if( data.type == 'store' )
    return removeStoreSignData(data);
}

function removeShopSignData(data) {
  var userdata = users.getPlayer( data.player_name );
  var shop = userdata.data["last_chestshop"].shop;
  var key = createKey(data.loc);
  delete shop[key];
}

function removeHyperSignData(data) {
  var userdata = users.getPlayer( data.player_name );
  var hyper = userdata.data.last_chestshop.hyper;
  var key = createKey(data.loc);
  delete hyper[key];
}

function removeStoreSignData(data) {
  //var player = utils.player( player );
  var userdata = users.getPlayer( data.player_name );
  var store = userdata.data.last_chestshop.store;
  var key = data.key;
  delete store[key];
  //console.log("!!!!!!!!! removeShopSignData data.player " + data.player_name + "\n" + key + "\n" + JSON.stringify(store) );
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
function trade(data){
  //var item = itemStackFromJSON(data.shop_store.itemstack);
  //if(item) data.player_inv.addItem(item);
  if( data.action == "sell" )
    return sell(data);

  if( data.action == "buy" )
    return buy(data);
}

exports.sell = sell;
function sell(data){
  // var item = inventory.itemStackFromJSON(data.shop_store.itemstack,data.price.amount);
  //   var isPresent = data.player_inv.containsAtLeast(item, data.price.amount);
  //   if(!isPresent)
  //     return echo( data.player, warn_color+'У вас нет товара для продажи.');

  //   //player_inv.setStorageContents(item, shop.price.amount);
  //   data.player_inv.removeItem(item);
  //   data.owner_inv.addItem(item);

  //   echo( data.player, msg_color+'Вы продали '+data.price.amount+' едениц '+data.material_key+' за '+data.price.buy+' Коинов.');
  var itemstack = inventory.removeItemstackFromInventory(data.player_inv, data.shop_store.itemstack, data.price.amount);
  if(!itemstack)
    return locale.warn(data.player,"${msg.player_no_product}");

  var money = economy.getMoney(data.owner_name);
  if( money < data.price.buy )
    return  locale.warn(data.player,"${msg.owner_no_money}");

  var isSuccess = economy.addMoney(data.owner_name,0-data.price.buy);
  if(!isSuccess)
    return  echo( data.player, 'sell 01');

  isSuccess = economy.addMoney(data.player,data.price.buy);
  if(!isSuccess)
    return  echo( data.player, 'sell 02');

  //var item = inventory.itemStackFromJSON(data.shop_store.itemstack,data.price.amount);
  // var amount = itemstack.getAmount();
  // if( data.price.amount == 1 && amount > 1 ){
  //   itemstack.setAmount(1);
  // }else if( data.price.amount > 1){
  //   itemstack.setAmount(data.price.amount);
  // }
  itemstack.setAmount(data.price.amount);
  data.owner_inv.addItem(itemstack);
  locale.echo(data.player,"${msg.player_sell}",{
    amount: data.price.amount,
    product: data.material_key,
    cost: data.price.buy,
    coins_name: economy.coinsDecline(data.player, data.price.buy)
  });

  var owner = utils.player(data.owner_name);
  if( owner )
    locale.echo(owner,"${msg.owner_sell}",{
      amount: data.price.amount,
      product: data.material_key,
      cost: data.price.buy,
      coins_name: economy.coinsDecline(owner, data.price.buy)
    });
};



exports.buy = buy;
function buy(data){
  // var item = inventory.itemStackFromJSON(data.shop_store.itemstack,data.price.amount);
  //   var isPresent = data.owner_inv.containsAtLeast(item, data.price.amount);
  //   if(!isPresent)
  //     return echo( data.player, warn_color+'В магазине нет товара для продажи.');

  //   //player_inv.setStorageContents(item, shop.price.amount);
  //   data.owner_inv.removeItem(item);
  //   data.player_inv.addItem(item);
  //   echo( data.player, msg_color+'Вы купили '+data.price.amount+' едениц '+data.material_key+' за '+data.price.sell+' Коинов.');
  
  var itemstack = inventory.removeItemstackFromInventory(data.owner_inv, data.shop_store.itemstack, data.price.amount);
  if(!itemstack)
    return locale.warn(data.player,"${msg.shop_is_empty}");

  var money = economy.getMoney(data.player);
  if( money < data.price.sell )
    return locale.warn(data.player,"${msg.player_no_money}");

  var isSuccess = economy.addMoney(data.player,0-data.price.sell);
  if(!isSuccess)
    echo( data.player, 'buy 01');

  isSuccess = economy.addMoney(data.owner_name,data.price.sell);
  if(!isSuccess)
    echo( data.player, 'buy 02');


  // var item = inventory.itemStackFromJSON(data.shop_store.itemstack,data.price.amount);
  // var amount = itemstack.getAmount();
  // if( data.price.amount == 1 && amount > 1 ){
  //   itemstack.setAmount(1);
  // }else if( data.price.amount > 1){
  //   itemstack.setAmount(data.price.amount);
  // }
  itemstack.setAmount(data.price.amount);
  data.player_inv.addItem(itemstack);

  locale.echo(data.player,"${msg.player_buy}",{
    amount: data.price.amount,
    product: data.material_key,
    cost: data.price.sell,
    coins_name: economy.coinsDecline(data.player, data.price.sell)
  });

  var owner = utils.player(data.owner_name);
  if( owner )
    locale.warn(owner,"${msg.owner_buy}",{
      amount: data.price.amount,
      product: data.material_key,
      cost: data.price.sell,
      coins_name: economy.coinsDecline(owner, data.price.sell)
    });

};

