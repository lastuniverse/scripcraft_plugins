/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * Плагин поддержки дополнительных функций чата.
 * 
 * ## Возможности:
 * - Создание произвольных чатов (програмный API).
 * - Переключение между чатами.
 * - Настройка иконок идентифицирующих членство игроков в группах, пати, профессиях, кланах.
 * ## Доступные чаты:
 * - `!` - Общий чат. Сообщения отсылаются игрокам на всем сервере. За сообщения взымается плата в размере указанном в файле настроек `chats.far.cost`.
 * - `~` - Ближний чат. Сообщения отсылаются игрокам находящимся не далее количества блоков от вас, указанного в файле настроек `chats.near.distance`.
 * - `@` - Администраторский чат. Сообщения принимаются и отсылаются только членам административных групп.
 * - `$` - Торговый чат. Сообщения принимаются и отсылаются всем игрокам на сервере. За сообщения взымается плата в размере указанном в файле настроек `trade.cost`.
 * - Другие чаты, добавляемые плагинами, такие как:
 *   - `#` - party (чат для Пати)
 *   - `%` - guild (Гильдейские чаты)
 *   - `*` - clan (Клановые чаты)
 * 
 * ## Команды
 * - `/chat help` : эта справка.
 * - `/chat select` : Узнать какой чат выбран сейчас.
 * - `/chat select {name}` :  Выбрать чат. Все сообщения без префикса будут отправлятся в выбранный чат.
 * - `/chat list` : Список чатов, зарегестрированных на сервере.
 * - `/chat mute {name}` : Отключить показ сообщений из чата `{name}`
 * - `/chat unmute {name}` : Включить показ сообщений из чата `{name}`
 * - `/mute {playername} {time} {reason}` : лишить игрока с ником `{playername}` возможности писать в чат на `{time}` минут. Игроку будет отправлена причина мута указанная в `{reason}`. (только администраторы).
 * - `/unmute {playername}` : вернуть игроку с ником `{playername}` возможность писать в чат (только администраторы).
 * - `/trade set {repeat} {you message}` : установить рекламное сообщение `{you message}`, автоматически отправляемое в торговый чат раз в `{repeat}` минут.
 * - `/trade del` : удалить рекламное сообщение, автоматически отправляемое в торговый чат.
 * 
 * ## Файл конфигурации data/config/plugins/last/chat.json
 * ```js
 * {
 *     "locale": "ru_ru",                // Язык по умолчанию `ru_ru`
 *     "enable": true,                   // Включить/выключить плагин `true`/`false`
 *     "mute": {
 *         "max": 60
 *     },
 *     "colors":{                        // Настройка цветового оформления чата. Включает подпункты:
 *         "name":    "gray",            // Цвет ника игроков. По умолчанию `gray`
 *         "message": "white",           // Цвет сообщений. По умолчанию `white`
 *         "none":    "black",           // Цвет иконок статус которых не определен. По умолчанию `black`
 *         "group":   "darkgray"         // Цвет иконок групповой принадлежности. По умолчанию `darkgray` если не переопределен в групповых настройках модуля `modules/last/permissions`
 *     },
 *     "icons":{                         // Настройка иконок по умолчанию. Включает подпункты:
 *         "none":    "✖"                // Иконки статус которых не определен. По умолчанию `✖`
 *     },
 *     "chats": {                        // Натройки встроеных чатов:
 *         "admin": {                    // Админский чат:
 *             "prefix":     "@",        // Все сообщения начинающиеся с префикса будут отправлятся в админский чат. По умолчаню `@`
 *             "icon_color": "gold",     // Цвет иконки указывающей вид чата, По умолчанию `gold`
 *             "groups": {               // Список групп, члены которых имеют доступ к этому чату. По умолчанию `{ "admin": true, "moderator": true }`
 *                 "admin":     true,
 *                 "moderator": true
 *             }
 *         },
 *         "trade": {                    // Торговый чат:
 *             "prefix":     "$",        // Все сообщения начинающиеся с префикса будут отправлятся в админский чат. По умолчаню `$`
 *             "icon_color": "darkred",  // Цвет иконки указывающей вид чата, По умолчанию `darkred`
 *             "cost":       30          // Стоимость сообщений в коинах.
 *         },
 *         "near": {                     // Общий чат ближнего действия:
 *             "prefix":     "~",        // Все сообщения начинающиеся с префикса будут отправлятся в админский чат. По умолчаню `~`
 *             "text_color": "white",    // Цвет сообщений этого чата. По умолчанию `white`
 *             "distance":   20000       // Максимальная дистанция до игроков, которым будут отправлятся сообщения этого чата. По умолчанию `500`.
 *         },
 *         "far": {                      // Общий чат дальнего действия:
 *             "prefix":     "!",        // Все сообщения начинающиеся с префикса будут отправлятся в админский чат. По умолчаню `!`
 *             "text_color": "darkgray", // Цвет сообщений этого чата. По умолчанию `darkgray`
 *             "cost":       1           // Стоимость сообщений в коинах. По умолчанию `30`
 *         }
 *     },
 *     "trade":{                         // Настройки торгового чата
 *         "cost": 30000,                // Стоимость 1 рекламного сообщения повторяющегося через промежутки времени равные `last_chat.trade.min`. По умолчанию `30000`.
 *         "min":  10                    // Минимальное время повторения рекламного сообщения. По умолчанию `10`.
 *     }
 * }
 * ```
 * 
 * ## Настройки модуля modules/last/permissions
 * 
 * **Права доступа:** *могут быть выставленны персонально для разных групп и отдельных пользователей*
 * ```js
 * ...
 * "permissions": {
 *     "last_chat.admin":     false,     // разрешение на использование таких команд как /mute и /unmute
 *     "last_chat.trade.set": false      // разрешение на размещение рекламы в торговом чате с помощью команды `/trade set ...`
 * }
 * ...
 * ```
 * 
 * **Параметры:** *могут быть выставленны персонально для разных групп и отдельных пользователей*
 * ```js
 * ...
 * "options": {
 *     "last_chat.mute.maxtime": 60,     // максимальное время в минутах на которое можно лишить игрока право писать в чат.
 *     "last_chat.group": {              // Настройка иконки для группы. Включает подпункты:
 *         "icon":  "Ⓐ",                 // Иконка для группы.
 *         "color": "gold"               // Цвет иконки. Может принимать следующие значения:  
 *                                       // black, blue, darkgreen, darkaqua, darkred, purple, gold, gray, darkgray, indigo, brightgreen, aqua, red, pink, yellow, white
 *     },
 *     "last_chat.trade.min":  30,       // Минимальное время повторения рекламного сообщения в минутах.
 *     "last_chat.trade.cost": 3000      // Стоимость 1 рекламного сообщения повторяющегося через промежутки времени равные last_chat.trade.min.
 * }
 * ...
 * ```
 * 
 * ## Важно
 * Плагин имеет програмный API для регистрации новых чатов. Новые чаты автоматически будут доступны в команде `/chat select {chatname}`.
 * 
 * ## зависимости:
 * > - utils - стандартный модуль ScriptCraft
 * > - modules/last/color       - модуль цвета
 * > - modules/last/users       - модуль доступа к персональному хранилищу данных пользователей
 * > - modules/last/economy     - модуль управления экономикой и финансами игрока
 * > - modules/last/eventex     - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * > - modules/last/locales     - модуль локализации
 * > - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * > - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * > - modules/last/timetools   - библиотека функций для работы со временем
 * 
 * @module last/last_chat *
 *
 */



'use strict';

var utils = require('utils');
var users = require('last/users');
var locales = require('last/locales');
var economy = require('last/economy');
var eventex = require('last/eventex');
var completer = require('last/completer');
var timetools = require('last/timetools');
var permissions = require('last/permissions');


// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/chat.json");
if(!config.enable)
  return console.log("plugins/last/last_chat DISABLED");;

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_chat", config.locale||"ru_ru");

var trade_store = persist('data/plugins/last/trade', {});


var name_color = ""[config.colors.name]();
var msg_color = ""[config.colors.message]();
var none_color = ""[config.colors.none]();

var chats = {
  byKey: {},
  byName: {}
};

exports.registerChat = registerChat;
function registerChat(name, key, description, callback){
  chats.byKey[key] = {
    callback: callback,
    key: key,
    name: name,
    description: description
  };
  chats.byName[name] = chats.byKey[key];
}


events.playerChat(playerChatHundler);
function playerChatHundler(event){
  var player = event.getPlayer();
  var message = event.getMessage();
  var permission = permissions.getUserPermissions(player);
  var group_icon = permission.getParam("last_chat.group")||{};
  group_icon.color = group_icon.color||config.colors.group;
  group_icon.icon = group_icon.icon||config.icons.none;  
  
  var msg = {
    icons: [
      {icon: group_icon.icon, color: ""[group_icon.color]() },
      {icon: config.icons.none, color: none_color},
      {icon: config.icons.none, color: none_color}
      //✖✕
    ],
    player: {
      name: player.name||player,
      color: name_color
    },
    message: {
      text: message,
      color: msg_color  
    },
    text: message,
    sender: player,
    current: "near"
  };

  var test = utils.player(player);
  if( !test ) 
    msg.player.name = "offline|"+msg.player.name;


  if( event.isAsynchronous() )
    return;

  event.setCancelled(true);

  var user = users.getPlayer(player);
  if( !user || !user.data || !user.data["last_chat"] || !user.data["last_chat"].select )
    return locale.warn( player, "${msg.no_userdata}");

  var muted = user.data["last_chat"].isMute||0;
  var time = muted - timetools.now();
  if( time > 0 )
    return locale.warn( player, "${msg.no_voice}",{"time": Math.ceil(time/60000)});

  msg.userdata = user.data["last_chat"];
  if( !chats.byName[msg.userdata.select] )
    return locale.warn( player, "${msg.no_chat}",{name: msg.userdata.select});
    

  var chat_key = message.substring(0,1);
  var chatname = msg.userdata.select;
  if( !chats.byKey[chat_key] ){
    chat_key = chats.byName[chatname].key;
  }else{
    msg.message.text = msg.text.substring(1);
    chatname = chats.byKey[chat_key].name;
  }

   if( msg.userdata.mute[chatname] )
     return locale.warn( player, "${msg.muted}", {chat: chatname} );
  // if( msg.userdata.select )
  //   locale.warn( player, "${msg.no_userdata}");

  var chat = chats.byName[chatname];
  msg.current = chatname;
  return chat.callback(msg);
}


exports.broadcastMsg = broadcastMsg;
function broadcastMsg(msg, players){
  if( !msg )
    return;

  if( !players )
    players = utils.players();

  var text = "";

  // добавляем иконки
  for( var i in msg.icons ){
    var icon = msg.icons[i];
    text += icon.color + (icon.icon?(icon.icon+" "):"");
  }

  // добавляем ник игрока
  text += msg.player.color + "<"+msg.player.name+"> ";

  // добавляем иконку чата
  if( msg.chat ){
    text += msg.chat.color + msg.chat.icon + " ";
  }
  
  // добавляем текст сообщения  
  text += msg.message.color + msg.message.text;

  // рассылаем соощение игрокам
  utils.foreach(players, function( player ) {
    var user = users.getPlayer(player);

    var muted = {};
    if( user && user.data && user.data["last_chat"] )
      muted = user.data["last_chat"].mute;

    if( !muted[msg.current] )
      echo (player, text );
  });
  var prefix = config.chats[msg.current].prefix;
  console.log( "<" + msg.player.name + "> " + (msg.chat?msg.chat.icon:"") + prefix+" " + msg.message.text );
}


/**
 * далее регистрируем встроенные чаты
 */
registerChat("trade", config.chats.trade.prefix, "торговый чат", function(msg){
  //console.log("!!!!!!!!!! registerChat $");
  var conf = config.chats.trade;
  var money = economy.addMoney(msg.sender, -conf.cost );
  if( !money )
    return locale.warn( msg.sender, "${msg.no_money_trade}",{"cost": conf.cost });


  //msg.player.color = "".indigo();
  msg.message.color = "".gray();
  msg.chat = {
    icon: "●",//➟
    color: ""[conf.icon_color]()
  }
  broadcastMsg(msg);
});


function testGroups( groups, usergroups ){
  for( var i in groups ){
    if( usergroups[i] )
      return true;
  }
  return false;
}

registerChat("admin", config.chats.admin.prefix, "административный чат", function(msg){
  //console.log("!!!!!!!!!! registerChat @");

  var conf = config.chats.admin;
  var sender_groups = permissions.gertUserGroups(msg.sender);
  if( !testGroups( conf.groups, sender_groups ) )
    return;

  if( !testGroups( conf.groups, sender_groups ) )
    return;


  //msg.player.color = "".indigo();
  msg.message.color = "".gray();
  msg.chat = {
    icon: "●",//➟
    color: ""[conf.icon_color]()
  }


  var list = utils.players();
  var players = [];

  for(var i in list){
    var groups = permissions.gertUserGroups(list[i]);
    if( testGroups( conf.groups, groups ) )
      players.push(list[i]);
  }

  broadcastMsg(msg, players);
});


registerChat("far", config.chats.far.prefix, "Общий чат дальнего радиуса действия. Взымается плата "+config.chats.far.cost+" коинов.", function(msg){
  //console.log("!!!!!!!!!! registerChat !");

  var conf = config.chats.far;
  var money = economy.addMoney(msg.sender, -conf.cost );

  if( !money )
    return locale.warn( msg.sender, "${msg.no_money}",{"cost": conf.cost });

  msg.message.color = ""[conf.text_color]();

  broadcastMsg(msg);
});

registerChat("near", config.chats.near.prefix, "Общий чат ближнего радиуса действия. Дальность действия "+config.chats.near.distance+" блоков.", function(msg){
  //console.log("!!!!!!!!!! registerChat ~");

  var conf = config.chats.near;
  msg.message.color = ""[conf.text_color]();


  var loc = utils.locationToJSON( msg.sender.location );
//console.log("!!!!! player loc "+JSON.stringify(loc));
  var list = utils.players();
  var players = [];

  for(var i in list){
    var p = utils.player(list[i]);
    var l =  utils.locationToJSON( p.location );
//    console.log("!!!!! player l "+typeof l );
//    console.log("!!!!! player l "+JSON.stringify(l));
    var dx = Math.abs(loc.x - l.x );
    var dz = Math.abs(loc.z - l.z );
    if( dx<conf.distance && dz<conf.distance )
      players.push(list[i]);
  }

  broadcastMsg(msg, players);
});




/**
 * Добавляет раздел "last_chat" в data игрока
 * в data/last_users-store.json  
 */
eventex.events.on("onPlayerJoin", function ( event ) {
  var player = users.getPlayer(event.player);
  var modulename = "last_chat";
  
  if( !player.data[modulename] || !player.data[modulename].ver || player.data[modulename].ver !== "v.0.1" )
    player.data[modulename] = { 
      ver: "v.0.1",
      select: "near",
      mute:{}
    };
  
});


/**
 * далее следуют обработчики команд
 */

function cmd_chat_help( params, sender ) {
  locale.help( sender,  "${help}" );
};
function cmd_chat_select( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data  || !user.data["last_chat"])
    return locale.warn( sender, "${msg.no_userdata}");

  if( !chats.byName[params[2]] )
    return locale.warn( sender, "${msg.no_chat}", {"chat": params[2]});

  user.data["last_chat"].select = params[2];

  if(user.data["last_chat"].mute[params[2]])
    delete user.data["last_chat"].mute[params[2]];

  locale.warn( sender, "${msg.select}",{"chat": params[2]});
};

function cmd_chat_select_info( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data || !user.data["last_chat"] )
    return locale.warn( player, "${msg.no_userdata}");

  return locale.warn( sender, "${msg.info}",{"chat": user.data["last_chat"].select });
};

function cmd_chat_list( params, sender ) {
  var user = users.getPlayer(sender);
  var muted = {};
  var selected = "near";
  if( user && user.data && user.data["last_chat"] ){
    muted = user.data["last_chat"].mute;
    selected = user.data["last_chat"].select;
  }

  var str = "";
  var c_red = "§c";
  var c_darkred = "§4";
  var c_green = "§2";
  var c_gold = "§6";
  var c_pref = "§f";
  var c_undo = "§r";
  for(var i in chats.byName ){
    var chat = chats.byName[i];
    if( selected == chat.name  )
      str += "- "+c_gold+"⚫"+c_red;

    if( muted[chat.name] ){
      str += "- "+c_darkred+"✘"+c_red;
    }else if( selected != chat.name ){
      str += "- "+c_green+"✔"+c_red;
    }

    str += " - " + c_pref + chat.key + c_red + " - " + chat.name + " - " + chat.description + "\n";
  }
  locale.warn( sender, "${msg.chats}",{"list": str });
};

function cmd_chat_mute( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data  || !user.data["last_chat"])
    return locale.warn( player, "${msg.no_userdata}");

  if( !chats.byName[params[2]] )
    return locale.warn( sender, "${msg.no_chat}",{"chat": params[2]});

  var data = user.data["last_chat"];
  if( data.select == params[2] )
    return locale.warn( sender, "${msg.selected}",{"chat": params[2]});

  data.mute[params[2]] = true;
  locale.warn( sender, "${msg.mute}",{"chat": params[2]});
};

function cmd_chat_unmute( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data || !user.data["last_chat"])
    return locale.warn(sender,"${msg.no_userdata}");

  var data = user.data["last_chat"]
  if( params[2] == "all" ){
    user.data["last_chat"].mute = {};
    return locale.warn(sender,"${msg.unmute_all}");
  }

  if( !chats.byName[params[2]] )
    return locale.warn( sender, "${msg.no_chat}",{"chat": params[2]});

  delete user.data["last_chat"].mute[params[2]];
  locale.warn( sender, "${msg.unmute}",{"chat": params[2]});
};


function cmd_player_mute( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data || !user.data["last_chat"])
    return locale.warn( player, "${msg.no_userdata}");

  params.shift();
  var muted_name = params.shift();
  var muted = users.getPlayer(muted_name);
  if( !muted || !muted.data || !muted.data["last_chat"] )
    return locale.warn( sender, "${msg.no_user}",{"name": muted_name});

  var user_priority = permissions.getUserPriority(user.name);
  var muted_priority = permissions.getUserPriority(muted.name);

  if( user_priority <= muted_priority )
    return locale.warn( sender, "${msg.no_priority}");

  var permission = permissions.getUserPermissions(sender);
  var time = economy.toInt( params.shift(params) || config.mute );
  var maxtime = permission.getParam("last_chat.mute.maxtime");
  if( time > maxtime )
    time = maxtime;

  var reason = params.join(" ");

  muted.data["last_chat"].isMute = timetools.now() + time*60000;
  locale.warn( sender, "${msg.mute_success}",{"name": muted_name, "time": time});
  locale.warn( muted_name, "${msg.you_muted}",{"name": user.name, "time": time, "reason": reason});
};

function cmd_player_unmute( params, sender ) {
  var user = users.getPlayer(sender);
  if( !user || !user.data || !user.data["last_chat"])
    return locale.warn( player, "${msg.no_userdata}");

  params.shift();
  var muted_name = params.shift();
  var muted = users.getPlayer(muted_name);
  if( !muted || !muted.data || !muted.data["last_chat"] )
    return locale.warn( sender, "${msg.no_user}",{"name": muted_name});

  var user_priority = permissions.getUserPriority(user.name);
  var muted_priority = permissions.getUserPriority(muted.name);

  if( user_priority <= muted_priority )
    return locale.warn( sender, "${msg.no_priority}");

  var reason = params.join(" ");

  muted.data["last_chat"].isMute = 0;
  locale.warn( sender, "${msg.unmute_success}",{"name": muted_name});
  locale.warn( muted_name, "${msg.you_unmuted}",{"name": user.name, "reason": reason});
};


/**
 * далее регистрируем команды
 */

var point_chat = completer.addPlayerCommand('chat');
    point_chat.addComplete('help',cmd_chat_help);

var point_select = point_chat.addComplete('select', 
  cmd_chat_select_info, 
  function(sender,patern){
    var list = { "near": true };
    for(var i in chats.byName ){
      list[i] = true;
    }
    return list;
  })
  .addComplete('@any', cmd_chat_select );

point_chat.addComplete('mute', undefined, 
  function(sender,patern){
    var list = {};
    for(var i in chats.byName ){
      list[i] = true;
    }
    return list;
  })
  .addComplete('@any', cmd_chat_mute );

point_chat.addComplete('unmute', undefined, 
  function(sender,patern){
    var list = { all : true};
    for(var i in chats.byName ){
      list[i] = true;
    }
    return list;
  })
  .addComplete('@any', cmd_chat_unmute );


point_chat.addComplete('list', cmd_chat_list);

var point_mute = completer.addPlayerCommand('mute',undefined,undefined,"last_chat.admin")
  .addComplete('@user' )
  .addComplete('@re/[0-9]+/', cmd_player_mute)
  .addComplete('@any', cmd_player_mute);

var point_unmute = completer.addPlayerCommand('unmute',undefined,undefined,"last_chat.admin")
  .addComplete('@user', cmd_player_unmute )
  .addComplete('@any', cmd_player_unmute);



var point_trade = completer.addPlayerCommand('trade');
    point_trade.addComplete('set')
               .addComplete('@re/\\d+/',cmd_trade_set);
    point_trade.addComplete('del',cmd_trade_del);


function cmd_trade_set( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_chat.trade.set") )
    return locale.warn(sender, "${msg.no_trade_cmd}" );

  // var user = users.getPlayer(sender);
  // if( !user || !user.data || !user.data["last_chat"])
  //   return locale.warn( player, "${msg.no_userdata}");
  // var data = user.data["last_chat"];

  params.shift();
  params.shift();
  var min = permission.getParam("last_chat.trade.min")||config.trade.min||10;
  var time = Math.abs(economy.toInt( params.shift()||min ))||min;
  if( time<min )
    time = min;

  var msg = params.join(" ");
  var cost = permission.getParam("last_chat.trade.cost")||config.trade.cost;
  
  var calc = Math.round(cost*min/time)||1;
  var UUID = ''+sender.getUniqueId();
  
  trade_store[UUID] = {
    player: sender.name,
    UUID: UUID,
    msg: msg,
    time: time,
    count: 1,
    cost: calc
  };
  locale.warn(sender, "${msg.trade_msg_success}", trade_store[UUID] );
}

function cmd_trade_del( params, sender ) {
  var UUID = ''+sender.getUniqueId();
  
  delete trade_store[UUID];
  locale.warn(sender, "${msg.trade_del_msg_success}");
}

function trade_handler( ) {
  //console.log("!!!!!!!!!!!!!!!!!!! trade_handler");
  for( var UUID in trade_store ){
    var trade = trade_store[UUID];
    trade.count--;

    if(trade.count>0)
      continue;

    trade.count = trade.time;

    var money = economy.getMoney(trade.player);
    if( money < trade.cost )
      continue;


    var isSuccess = economy.addMoney(trade.player,0-trade.cost);
    if(!isSuccess)
      continue;

    var event = {};
    event.getPlayer = function(){return trade.player };
    event.getMessage = function(){return "$"+trade.msg};
    event.isAsynchronous = function(){return false};
    event.setCancelled = function(){};
    playerChatHundler(event);
  }
}

setInterval(trade_handler,60000);
//timetools.repeatCallAfterTime();