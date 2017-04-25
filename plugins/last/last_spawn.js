'use strict';
/*
  spawn teleporting plugin.
  Adds a new `/spawn` command
*/
if (__plugin.canary){
  console.warn('last_spawn not yet supported in CanaryMod');
  return;
}

var completer = require('last/completer');
var color =  require('last/color').color;
var utils = require('utils');
var bkTeleportCause = org.bukkit.event.player.PlayerTeleportEvent.TeleportCause;
var bkBukkit = org.bukkit.Bukkit;


/*
  set colors
*/
var redtext = color('red','');
/*
  set storage
*/
var store = persist('last_spawn', {});


function cmd_spawn( params, sender ) {
  var player = utils.player( sender );
  var loc = store.spawn;

  if ( !loc ) {
    echo( player, redtext + 'На сервере не установленна точка спавна. Чтобы ее установить нужно быть оператором и выполнить команду /spawn set.');
    return;
  }
  var spawn_loc = utils.locationFromJSON( loc );
  player.teleport(spawn_loc, bkTeleportCause.PLUGIN);
};


function cmd_spawn_set( params, sender ) {
  if ( !sender.isOp() ) {
    echo( sender, redtext + 'Команда /setspawn только для операторов!'  );
  } else {
    var player = utils.player( sender );
    var loc = player.location;
    store.spawn = utils.locationToJSON( loc );
    echo( sender,  redtext + 'Точка спавна установленна!');
  }
};

var spawn = completer.addPlayerCommand('spawn',cmd_spawn);
    spawn.addComplete('set',cmd_spawn_set);



exports.goto_spawn = function(sender){
  cmd_spawn( [], sender );
}




// Horse h = (Horse) e.getPlayer().getWorld().spawnCreature(e.getPlayer().getLocation(), EntityType.HORSE);
//   h.setTamed(true);
//   h.setOwner(e.getPlayer());
//   h.getInventory().setSaddle(new ItemStack(Material.SADDLE, 1));

//horse.setPassenger(p);


// public static void teleport(net.minecraft.server.Entity entity, Location to) {
//   WorldServer newworld = ((CraftWorld) to.getWorld()).getHandle();
//   Util.loadChunks(to);
//   if (entity.world != newworld) {           
//     //transfer entity cross-worlds

//     //transfer passenger
//     if (entity.passenger != null) {
//       //set out of vehicle?
//       net.minecraft.server.Entity passenger = entity.passenger;
//       entity.passenger = null;
//       passenger.vehicle = null;
//       teleport(passenger, to);
//       passenger.vehicle = entity;
//       entity.passenger = passenger;
//     }
   
//     //teleport this entity
//     entity.world.removeEntity(entity);
//     entity.dead = false;
//     entity.world = newworld;
//     entity.setLocation(to.getX(), to.getY(), to.getZ(), to.getYaw(), to.getPitch());
//     entity.world.addEntity(entity);
//     if (entity instanceof EntityPlayer) {
//       Util.getCraftServer().getHandle().moveToWorld((EntityPlayer) entity, newworld.dimension, true, to);
//     }
     
//   } else {
//     entity.getBukkitEntity().teleport(to);           
//   }
// }