'use strict';

/* Global requires */
//var utils = require('utils');

function createKeys(loc){
  //var loc = utils.locationToJSON( block.getLocation() );
  var x = Math.floor(loc.x);
  var y = Math.floor(loc.y);
  var z = Math.floor(loc.z);
  var ret = [
    loc.world,
    x>>>6,
    z>>>6,
    x+'.'+y+'.'+z
  ];
  return ret;
};


function Storage(store,creator) {
  this.store = store;
  this.createKeys = createKeys;
  if( creator && typeof creator === 'function' )
    this.createKeys = creator;
}
exports.Storage = Storage;
// методы в прототипе


exports.Clean = _clean;
function _clean(p){
  for(var i in p){
    cleanUnuse(p[i]);
    if( !Object.keys(p[i]).length )
      delete p[i];
  }
}

Storage.prototype.cleanUnuse = function(){
  _clean(this.store);
}

Storage.prototype.setKeysCreator = function(creator){
  if( creator && typeof creator === 'function' )
    this.createKeys = creator;
}


Storage.prototype.findStoredPoint = function(loc){
  var k = this.createKeys(loc);
  var p = this.store;
  var r = false;
  while(k.length){
    var p = p[k.shift()];
    if( !p ) return false;
  }
  return p.data;
}

Storage.prototype.getData = function(loc){
  return this.findStoredPoint(loc);
}

Storage.prototype.removeData = function(loc){
  var k = this.createKeys(loc);
  var p = this.store;
  var r = false;
  while(k.length>1){
    var p = p[k.shift()];
    if( !p )  return false;
  }
  delete p[k.shift()];
  return true;
}

Storage.prototype.getStoredPoint = function(loc){
  var k = this.createKeys(loc);
  console.log("!!!! getStoredPoint "+JSON.stringify(k) );
  var p = this.store;
  while(k.length){
    var c = k.shift();
    if(!p[c]) p[c] = {};
    p = p[c];
  }
  if( !p.data )
    p.data = {};

  return p;
}

Storage.prototype.setData = function(loc,data){
  var p = this.getStoredPoint(loc);
  p.data = data;
}

