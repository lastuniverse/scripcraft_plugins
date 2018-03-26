/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин основных команд экономики
 * 
 * Командный интерфейс к модулю экономики
 *
 * ### Команды
 * - `/economy help` : вызов справки
 * - `/economy money` : узнать свой баланс
 * - `/economy money {playername}` : узнать баланс другого игрока
 * - `/economy pay {playername} {money}` : перечислить другому игроку определенную сумму. Минимальная сума : 1. Дробные суммы округляются до целых в сторону уменьшения
 * - `/economy give {playername} {money}` : подарить от имени сервера другому игроку определенную сумму. Минимальная сума : 1. Дробные суммы округляются до целых в сторону уменьшения
 * - `/money` : алиас для команды `/economy money`
 * - `/money {playername}` : алиас для команды `/economy money {playername}`
 * - `/pay {playername} {money}` : алиас для команды `/economy pay {playername} {money}`
 * - `/give {playername} {money}` : алиас для команды `/economy give {playername} {money}`
 * - `/top {page}` : выводит в чат список из 10 богатейших игроков сервера. Не обязательный параметр `{page}` позволяет смотреть следующие страницы списка
 * 
 * ### Настройки модуля modules/last/permissions
 * 
 * **Права доступа:**
 * - `last_econimy.give` - разрешение на подарок игроку игровых денег от имени сервера
 * 
 * ### Важно
 *  Плагин является всего лишь интерфейсом к модулю экономики `modules/last/economy`
 * 
 * ### зависимости:
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/economy     - модуль управления экономикой и финансами игрока
 * - modules/last/completer   - модуль регистрации команд /jsp commandname как глобальных команд /commandname с возможностью автодополнения
 * - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 * - modules/last/locales     - модуль локализации
 * 
 * @module plugins/last/last_economy
 */

'use strict';
if (__plugin.canary){
  console.warn('last_spawn not yet supported in CanaryMod');
  return;
}

var bkBukkit = org.bukkit.Bukkit;
var utils = require('utils');

var permissions = require('last/permissions');
var economycs = require('last/economy');
var completer = require('last/completer');
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/economy.json");
if(!config.enable)
  return console.log("plugins/last/last_economy  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_economy", config.locale||"ru_ru");



// var Players = bkBukkit.getOfflinePlayers();
// var bbbbb = JSON.stringify(Players);

// for (var item in Players) {
// 	var player = utils.player( Players[item] );
// 	console.log("!!!!!!!!!!! Players: " + player.name + ' ' + player.getUniqueId() );
// }



function cmd_economy_help( params, sender ) {
  locale.help( sender,  "${help}" );
};

function cmd_pay( params, sender ) {

  var reciver = params[1];
  var money = params[2];
  if( params[0] === 'economy' ){
    reciver = params[2];
    money = params[3];
  }
  economycs.payMoney(sender,reciver,money);
};

// обработчик команды /fly
// permission: last_econimy.give
function cmd_give( params, sender ) {
  var permission = permissions.getUserPermissions(sender);
  if ( !permission.isPermission("last_econimy.give") )
    return locale.warn( sender, "${msg.deny}" );
  var reciver = params[1];
  var money = params[2];
  if( params[0] === 'economy' ){
    reciver = params[2];
    money = params[3];
  }
  economycs.giveMoney(sender,reciver,money);
};


function cmd_money( params, sender ) {
  economycs.howMuchMoney(sender, sender);
}

function cmd_money_player( params, sender ) {
  var player = params[1];
  if( params[0] === 'economy' ){
    player = params[2];
  }

  economycs.howMuchMoney(sender, player);
}

function cmd_top( params, sender ) {
  var page = params[1];
  if( params[0] === 'economy' )
    page = params[2];

  page = economycs.toInt(page);
  if( !page || page<1 )
    page=1;

  economycs.getTop(sender, 10, page);
}

var economy_cmd = completer.addPlayerCommand('economy');
    economy_cmd.addComplete('help',cmd_economy_help);

var etop = economy_cmd.addComplete('top',cmd_top);
    etop.addComplete('@re/[0-9]+/',cmd_top);

var epay = economy_cmd.addComplete('pay');
    epay.addComplete('@user').addComplete('@re/[0-9]+/',cmd_pay);
    epay.addComplete('@any').addComplete('@re/[0-9]+/',cmd_pay);

var give = economy_cmd.addComplete('give');
    give.addComplete('@user').addComplete('@re/[0-9]+/',cmd_give);
    give.addComplete('@any').addComplete('@re/[0-9]+/',cmd_give);

var emoney = economy_cmd.addComplete('money',cmd_money);
    emoney.addComplete('@user',cmd_money_player);
    emoney.addComplete('@any',cmd_money_player);


var top = completer.addPlayerCommand('top',cmd_top);
    top.addComplete('@re/[0-9]+/',cmd_top);

var pay = completer.addPlayerCommand('pay');
    pay.addComplete('@user').addComplete('@re/[0-9]+/',cmd_pay);
    pay.addComplete('@any').addComplete('@re/[0-9]+/',cmd_pay);

var money = completer.addPlayerCommand('money',cmd_money);
    money.addComplete('@user',cmd_money_player);
    money.addComplete('@any',cmd_money_player);
