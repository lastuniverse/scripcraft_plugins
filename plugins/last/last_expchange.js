if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}
var utils = require('utils');
var syssigns = require('signs');
var signs = require('last/signs');
var users = require('last/users');
var economy = require('last/economy');
var expfix = require('last/expfix');
var completer = require('last/completer');
//var permissions = require('last/permissions');
var locales = require('last/locales');

// загружаем config
var config = scload("./scriptcraft/data/config/plugins/last/expchange.json");
if(!config.enable)
  return console.log("plugins/last/last_expchange  DISABLED");;


// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/plugins/last/", "last_expchange", config.locale||"ru_ru");


signs.events.onBeforeClickSign(function(event){
  //console.log("********* 01");
  if( event.sign.getLine(0) != "exp change" )
    return;

  //console.log("********* 02");
  var procent = event.sign.getLine(1).match(/^([0-9]+)\% \(([0-9]+)(?: exp|[\$])\)$/);
  if( !procent || !procent[2] )
    return;
  procent[1] = economy.toInt(procent[1]);
  procent[2] = economy.toInt(procent[2]);

  //console.log("********* 03 "+procent);
  if( procent[1] > 50 )
    return;

  //console.log("********* 04 ");
  var pr = event.sign.getLine(2).match(/^([0-9]+) < ([0-9]+) > ([0-9]+)$/);
  if( !pr || !pr[3] )
    return;

  var price = [];
  price[0] = economy.toInt(pr[1]);
  price[1] = economy.toInt(pr[2]);
  price[2] = economy.toInt(pr[3]);
  if( economy.toInt(price[0]*procent[1]/100)+price[0] != price[1] )
    return;

  //console.log("********* 05");  
  var reciver = users.getPlayer(event.sign.getLine(3));
  if( !reciver.isPresent )
    return;

  //console.log("********* 06");
  var player = users.getPlayer(event.native.getPlayer());
  
  return  event.info = {
    signEvent:'onClickExpChange',
    signType:'expchange',
    isUnbreakable:true,
    price: price,
    sender: player,
    reciver: reciver
  };

});

signs.events.onClickSignEvent("onClickExpChange",function (event){
  var action = event.native.getAction();
  var sender = event.info.sender;
  var reciver = event.info.reciver;
  var cost1 =  event.info.price[1];
  var cost2 =  event.info.price[2];

  if( reciver.name === sender.name )
    cost1 = cost2;
  
  var delta = cost1 - cost2;
  
  if( action === 'RIGHT_CLICK_BLOCK'){
    //var exp = sender.player.getTotalExperience();
    var exp = expfix.getTotalExperience(sender.player);
    if( exp < cost1 )
      return locale.warn( sender.player, "${msg.none_exp}" );

    expfix.setTotalExperience(sender.player,exp-cost1);
    economy.addMoney(sender.player,cost2);
    economy.addMoney(reciver.player,delta);

    locale.warn( sender.player,  "${msg.change_coins}", {
      exp: cost1,
      coins: cost2,
      coins_name: economy.coinsDecline(sender.player, cost2)
    });

    if( reciver.name != sender.name )
      return locale.warn( reciver.player,  "${msg.procenage}",{
        coins: delta,
        coins_name: economy.coinsDecline(reciver.player, delta),
        player: sender.name
      });
  }else if( action ===  'LEFT_CLICK_BLOCK'){
    var money = economy.getMoney(sender.player);
    if( money < cost1 )
      return locale.warn( sender.player,  "${msg.none_coins}",{
        coins_name: economy.coinsDecline(sender.player, 5)
      });

    //var exp = sender.player.getTotalExperience();
    var exp = expfix.getTotalExperience(sender.player);
    expfix.setTotalExperience(sender.player,exp+cost2);
    economy.addMoney(sender.player,0-cost1);
    economy.addMoney(reciver.player,delta);
    locale.warn( sender.player, "${msg.change_exp}", {
      coins: cost1,
      coins_name: economy.coinsDecline(sender.player, cost1),
      exp: cost2
    });

    if( reciver.name != sender.name )
      return locale.warn( reciver.player, "${msg.procenage}",{
        coins: delta,
        coins_name: economy.coinsDecline(reciver.player, delta),
        player: sender.name
      });
  } 
});


/**
 * Функция обработчик команды установки магазина опыта
 * @param  {array}  params список переданных параметров
 * @param  {object} sender объект игрока вызвавшего команду
 */
function cmd_exp_set(params, sender){
  // определяем смотрим ли мы на табличку
  var sign = syssigns.getTargetedBy( sender );
    if ( !sign )
      return locale.warn(sender, "${msg.not_sign}");


  // вычисляем количество и стоимость товара
  var price = economy.toInt(params[2]||100);
  if( price<0 ) count=0;

  var procent = economy.toInt(params[3]||0);
  if( procent>50 ) procent=50;
  if( procent<0 ) procent=0;

  var procentage = Math.floor(price*procent/100);

  // получаем координаты таблички
  var loc = utils.locationToJSON( sign.getLocation() );

  // устанавливаем нужные надписи в 1-й и 4-й строках
  sign.setLine(0,"exp change");
  sign.setLine(1,""+procent+"% ("+procentage+"$)");
  sign.setLine(2,""+price+" < "+(price+procentage)+" > "+price);
  sign.setLine(3,sender.name);
  sign.update();

  return locale.warn(sender, "${msg.create_success}");
}


function cmd_exp_now(params,sender){
  var exp = expfix.getTotalExperience(sender);
  locale.warn( sender, "${msg.cmd_exp_now}",{ exp: exp });
}
function cmd_exp_reset(params,sender){
  expfix.setTotalExperience(sender,0);
  locale.warn( sender, "${msg.cmd_exp_reset}" );
}
function cmd_exp_give(params,sender){
  var player = utils.player(params[2]);
  var exp = Number(params[3]);
  expfix.setTotalExperience(player,exp);
  locale.warn( sender, "${msg.cmd_exp_give}", {exp: exp} );
}
function cmd_exp_help( params, sender ) {
  locale.help( sender, "${help}" );
};
var point_exp = completer.addPlayerCommand('exp',cmd_exp_now);
    point_exp.addComplete('now',cmd_exp_now);
    point_exp.addComplete('reset',cmd_exp_reset,undefined,"last_expchange.use");
    point_exp.addComplete('give',undefined,undefined,"last_expchange.admin")
             .addComplete('@user')
             .addComplete('@re/[0-9]+/',cmd_exp_give);
    point_exp.addComplete('help',cmd_exp_help);
    point_exp.addComplete('set',undefined,undefined,"last_expchange.set")
             .addComplete('@re/[0-9]+/')
             .addComplete('@re/[0-9]+/',cmd_exp_set);