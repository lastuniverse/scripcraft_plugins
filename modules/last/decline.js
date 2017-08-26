'use strict';


function Decline(list) {
  this.list = list;
  return this;
}

// методы в прототипе
Decline.prototype.decline = function(number){
  var i = this.number[number];
  return this.list[i];
};

Decline.prototype.number = function(number){
  if( number == 0 )
    return 2;
  if( number == 1 )
    return 0;
  if( number < 5 )
    return 1;
  if( number < 21 )
    return 2;
  var r = number%10;
  if( r == 0 )
    return 2;
  if( r == 1 )
    return 0;
  if( r < 5 )
    return 1;
  return 2;
};


// 0 1 коин
// 1 2-4 коина
// 2 5-20 коинов

exports.Decline = Decline;