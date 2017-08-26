/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Плагин лифтов
 * 
 * Позволяет создавать таблички лифтов.
 *
 * Несколько табличек "лифт" рассчитаны на совместную работу. Таблички следует располагать строго одну над другой. Переход будет осуществленн только в том случае если в направлении перехода, в тех же координатах `x` и `z` есть другая табличка лифта.
 *
 * ### Установка таблички лифта
 * - поставить табличку в любое удобное место, но не выше 2-х блоков от уровня пола
 * - на табличке написать:
 *   - 1-2 строки - любой текст
 *   - 3 строка - lift
 *   - 4 строка - пустая, будет заполнена автоматически пояснением «ЛКМ-вниз|ПКМ-вверх»
 * 
 * ### Использование табличек лифтов
 *  - ПКМ - переход на табличку лифта установленную уровнем выше
 *  - ЛКМ - переход на табличку лифта установленную уровнем ниже
 *  
 * ### Важно
 *  Для разрушения таблички необходимо воспользоваться топором.
 * 
 * ### зависимости:
 * - modules/last/signs       - модуль событий связанных с табличками
 * 
 * @module plugins/last/last_lift
 */


if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}
var signs = require('last/signs');

var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;


signs.events.onSignPlace(function(event){
  var lines = event.native.getLines();
  if( lines[2].toLowerCase() != 'lift' )
  	return;
  event.native.setLine(3,'ЛКМ-вниз | ПКМ-вверх');
});

signs.events.onBeforeClickSign(function(event){
  var lift = event.sign.getLine(2).toLowerCase();
  if( lift != 'lift')
    return;
  event.info = {
  	signEvent:'onClickLift',
  	signType:'lift',
  	isUnbreakable:true
  };
});

signs.events.onClickSignEvent("onClickLift",function (event){
  console.log("!!! onClickLift")
  var player = event.native.getPlayer();
  var block = event.native.getClickedBlock();
  var action = event.native.getAction();
  if( action == 'RIGHT_CLICK_BLOCK'){
    search_sign(player,event.block,'up');
  }else if( action ==  'LEFT_CLICK_BLOCK'){
    search_sign(player,event.block,'down');
  } 
});


function search_sign(player,sign,direction){
  var step = -1;
  if(direction == 'up')
    step = 1;

  var loc = sign.getLocation();
  var world = loc.getWorld();
  for (var i = loc.y+step; i >= 0 && i < 256; i+=step) {
    var block = world.getBlockAt(loc.x, i, loc.z);
    var type = block.getType();
    if( type == 'WALL_SIGN' || type == 'SIGN_POST' ){
      if( test_sign(block) ){
        var block_loc = block.getLocation();
        var player_loc = player.getLocation();
        player_loc.y=block_loc.y;
        var target = search_place(world,player_loc);
        
        if(direction !== 'up')
          target.y++;

        if( target ){
          player.teleport(target, bkTeleportCause.PLUGIN);
          break;  
        }
      }
    }
  }
};



function search_place(world,target){
  for (var i = 0; i < 4 ; i++) {
    target.y--;
    var block = world.getBlockAt(Math.round(target.x), target.y, Math.round(target.z));
    var type = block.getType();
    if( type != 'AIR' ){
      target.y+=1;
      return target;
    }
  }
  return false;
};


function test_sign(block){
  var sign = block.getState();
  if( sign.getLine(2).toLowerCase() == 'lift' )
    return true;
  return false;
};