if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}
var utils = require('utils');
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
  var procent = event.sign.getLine(1).match(/^([0-9]+)\% \(([0-9]+) exp\)$/);
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
  //console.log("!!! onClickExpChange event.info: ");//+JSON.stringify(event.info));
  var action = event.native.getAction();
  var data = event.info;
  var price = data.price;
  var sender = data.sender;
  var reciver = data.reciver;
  var cost1 =  price[1];
  var cost2 =  price[2];
  if( reciver.name === sender.name )
    cost1 = cost2;
  var delta = cost1 - cost2;
  if( action == 'RIGHT_CLICK_BLOCK'){
    //var exp = sender.player.getTotalExperience();
    var exp = expfix.getTotalExperience(sender.player);
    if( exp < cost1 )
      return locale.warn( sender.player, "${msg.none_exp}" );

    expfix.setTotalExperience(sender.player,exp-cost1);
    economy.addMoney(sender.player,cost2);
    economy.addMoney(reciver.player,delta);

    console.log("!!!!!!! economy.coinsDecline "+(typeof economy.coinsDecline) );
    
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
  }else if( action ==  'LEFT_CLICK_BLOCK'){
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

signs.events.onSignPlace(function (event){
  var lines = event.native.getLines();
  var shop_type = lines[0].toLowerCase();
  if( shop_type != 'expchange' )
    return false;

  var player = utils.player( event.native.getPlayer() );
  var UUID = ''+player.getUniqueId();


  lines[0] = "exp change";
  lines[1] = economy.toInt(lines[1]);
  if( lines[1] < 0 ) lines[1] = 0;
  if( lines[1] > 50 ) lines[1] = 50;
  var price = economy.toInt(lines[2]||1);
  var procentage = Math.floor(price*lines[1]/100);
  lines[1]=lines[1]+'% ('+procentage+' exp)';
  lines[2] = ''+price+' < '+(price+procentage)+' > '+price;
  lines[3] = player.name;
});



function cmd_exp_now(params,sender){
  var exp = expfix.getTotalExperience(sender);
  locale.warn( sender, "${msg.cmd_exp_now}",{ exp: exp });
}
function cmd_exp_reset(params,sender){
  expfix.setTotalExperience(sender,0);
  locale.warn( sender, "${msg.cmd_exp_reset}" );
}
function cmd_exp_set(params,sender){
  var player = utils.player(params[2]);
  var exp = Number(params[3]);
  expfix.setTotalExperience(player,exp);
  locale.warn( sender, "${msg.cmd_exp_set}", {exp: exp} );
}
function cmd_exp_help( params, sender ) {
  locale.help( sender, "${help}" );
};
var point_exp = completer.addPlayerCommand('exp',cmd_exp_now,undefined,"last_expchange.use");
    point_exp.addComplete('now',cmd_exp_now,undefined,"last_expchange.use");
    point_exp.addComplete('reset',cmd_exp_reset,undefined,"last_expchange.use");
    point_exp.addComplete('set',undefined,undefined,"last_expchange.admin")
             .addComplete('@user')
             .addComplete('@re/[0-9]+/',cmd_exp_set);
    point_exp.addComplete('help',cmd_exp_help);