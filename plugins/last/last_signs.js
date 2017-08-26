if (__plugin.canary){
  console.warn('last_elitre not yet supported in CanaryMod');
  return;
}



// function onClickSignShop(event){
//   console.log("!!!!!!!!!!!! onClickSignShop");
//   var block = event.getClickedBlock();
//   var key = getLocationKey(block);
//   var shop = store.shops[key];
//   if( shop ){
//     if( shop.type == 'shop' ){
//       onUseShop(event, shop);
//     }else if( shop.type == 'hypershop' ){
//       onUseHyperShop(event, shop);
//     }
//   }
// };

// function onUseShop(event, shop){
//   console.log("!!!!!!!!!!!! onUseShop");

//   var loc = utils.locationFromJSON(shop.loc.chest);
//   var chest = utils.blockAt( loc );
//   var type = chest.getType();
  
//   if( type != 'TRAPPED_CHEST' && type != 'CHEST' )
//     return echo( sender, redtext+'Похоже что магазин не работает.');

//   var player = event.getPlayer();

//   var action = event.getAction();
//   if( action == 'RIGHT_CLICK_BLOCK'){
//     onPlayerSell(player, chest, shop);
//   }else if( action ==  'LEFT_CLICK_BLOCK'){
//     onPlayerBye(player, chest, shop);
//   }

// // var diamond = new ItemStack(Material.DIAMOND, 64);
// // var inv = Bukkit.createInventory(null, 9, "Free Diamonds");
// // inv.addItem(diamond);

// };

// function onPlayerSell(player, chest, shop){
//     var item = items(shop.price.material, shop.price.amount);
//     var player_inv = player.getInventory();      
//     var isPresent = player_inv.containsAtLeast(item, shop.price.amount);
//     if(!isPresent)
//       return echo( player, redtext+'У вас нет товара для продажи.');

//     var chest_inv = chest.getState().getInventory();

//     //player_inv.setStorageContents(item, shop.price.amount);
//     player_inv.removeItem(item);
//     chest_inv.addItem(item);
//     echo( player, redtext+'Вы продали '+shop.price.amount+' едениц '+shop.price.material+' за '+shop.price.bye+' Жакониев.');
// };

// function onPlayerBye(player, chest, shop){
//     var item = items(shop.price.material, shop.price.amount);
//     var chest_inv = chest.getState().getInventory();
//     var isPresent = chest_inv.containsAtLeast(item, shop.price.amount);
//     if(!isPresent)
//       return echo( player, redtext+'В магазине нет товара для продажи.');

//     var player_inv = player.getInventory();      

//     //player_inv.setStorageContents(item, shop.price.amount);
//     chest_inv.removeItem(item);
//     player_inv.addItem(item);
//     echo( player, redtext+'Вы купили '+shop.price.amount+' едениц '+shop.price.material+' за '+shop.price.bye+' Жакониев.');
// };


// function onUseHyperShop(event, shop){
//   console.log("!!!!!!!!!!!! onUseHyperShop");

// };











