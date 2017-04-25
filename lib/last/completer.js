'use strict';
// var users = require('last/users');
// var groups = require('last/groups');

/*------------------------------------------------------------*/

/*------------------------------------------------------------*/
// конструктор
function Completer(name,handler,completer) {
  handler=handler||undefined;
  completer=completer||undefined;
  this.complateName = name;
  this.completes = {};
  this.handler = handler;
  this.findCustomCompletions = completer;
}


// методы в прототипе
Completer.prototype.addComplete = function(complateName,handler,completer) {
  this.completes[complateName] = new Completer(complateName,handler,completer);
  return this.completes[complateName];
};

Completer.prototype.addHandler = function(handler) {
  this.handler = handler||undefined;
};

Completer.prototype.addCompleter = function(completer) {
  this.completer = completer||undefined;
};

Completer.prototype.getCompletions = function(sender, patern_list) {
  var patern = patern_list.shift();
  var result = {};
  if(patern_list.length){
    var key = _compare_patern(patern, this.completes);
    console.log("!!!!!!!!!!! key "+key);
    if( key ){
      var completions = this.completes[key].getCompletions(sender,patern_list);
      result = _collect(result,completions);
    }
  }else{
    console.log("!!!!!!!!!!! patern "+patern);
    result = this.findCompletions(sender, patern);
    if(this.findCustomCompletions)
      result = _collect(result,this.findCustomCompletions(sender, patern));
  }
  return result;
};

Completer.prototype.getHandler = function(patern_list) {
  var handler = undefined;
  if(patern_list.length){
    var patern = patern_list.shift();
    var key = _compare_patern(patern, this.completes);
    if( key )
      handler = this.completes[key].getHandler(patern_list);

  }else{
    handler = this.handler;
  }
  return handler||function(){ console.log("для этой функции нет обработчика") };
};

Completer.prototype.findCompletions = function(sender,patern) {
  return _findCompletions(patern, this.completes);
};


Completer.prototype.complater = function(completer) {
  this.completer = completer||undefined;
};

//var test = new Completer('Зверь');

/*------------------------------------------------------------*/
// хранилище всех команд
var commands = {};
// регистратор новой команды
function addGlobalCommand(comandName,handler,completer) {
  commands[comandName] = new Completer(comandName,handler,completer);
  commands[comandName].target = 'GLOBAL';
  return commands[comandName];
};
function addConsoleCommand(comandName,handler,completer) {
  commands[comandName] = new Completer(comandName,handler,completer);
  commands[comandName].target = 'CONSOLE';
  return commands[comandName];
};
function addPlayerCommand(comandName,handler,completer) {
  commands[comandName] = new Completer(comandName,handler,completer);
  commands[comandName].target = 'PLAYER';
  return commands[comandName];
};

exports.addGlobalCommand = addGlobalCommand;
exports.addPlayerCommand = addPlayerCommand;
exports.addConsoleCommand = addConsoleCommand;


exports.customFindCompletions = _findCompletions;



// поиск подходящих команд
function findCommands(patern) {
  // commands[comandName] = new Completer(comandName,handler,completer);
  // return commands[comandName];
};

/*------------------------------------------------------------*/
// устанавливаем обработчик нажатия TAB в строке чата или консоли сервера
var isSetEvents;

if( !isSetEvents ){
  isSetEvents = true;
  events.tabComplete(_tabComplete);
  events.playerCommandPreprocess( _playerCommandPreprocess );
  events.serverCommand( _serverCommand );
}

function _playerCommandPreprocess(event){
  var sender = event.player
  var msg = ''+event.message;
  _CommandPreprocess( event, msg, sender, 'PLAYER' );
}
function _serverCommand(event){
  var sender = event.getSender();
  var msg = ''+event.command;
  _CommandPreprocess( event, msg, sender, 'CONSOLE' );
}


function _CommandPreprocess( event, msg, sender, target ) {
  var params = msg.split(/\s+/);
  if ( !params )
    return;
  if ( !params.length )
    return;
  params[0] = params[0].replace(/^\//,'');

  var command = params[0];

  if ( commands[command] && (commands[command].target == 'GLOBAL' || commands[command].target == target) ) {
    if( !event.isCancelled() ){
      event.setCancelled(true);
      var patern_list = params.concat();
      var cmd = patern_list.shift();
      var handler = commands[cmd].getHandler(patern_list);
      if( handler ){
        _executeCmd(handler,params,sender);
      }
    }
  }
};


/*------------------------------------------------------------*/

function _executeCmd( handler, params, sender ) {
  var result = null;
  try { 
    result = handler( params, sender );
  } catch ( e ) {
    console.error( 'Error while trying to execute command: ' + JSON.stringify( params ) );
    throw e;
  }
  return result;
};

/*------------------------------------------------------------*/
// непосредственно сам обработчик нажатия TAB в строке чата или консоли сервера
function _tabComplete(event){
  var sender = event.getSender();
  var completions = event.getCompletions();
  var buffer = event.getBuffer();

  var cmd_list = (''+buffer).split(/\s+/);
  if( !cmd_list.length )
     return;
  
  var prefix = '';

  if( /^\//.test(cmd_list[0]) ){
    cmd_list[0] = cmd_list[0].replace(/^\//,'');
    prefix = "/";
  }

  var completions_list = {};

  var patern = cmd_list.shift();

  if( !cmd_list.length ){
    completions_list = _findCompletions(patern,commands,prefix);
  }else{
    if( !commands[patern] )
      return;    
    completions_list = commands[patern].getCompletions(sender,cmd_list);
  }

  for(var i=0;i<completions.length;i++){
    completions_list[completions[i]]=true;
  }

  event.setCompletions( Object.keys(completions_list).sort() );
}
/*------------------------------------------------------------*/

function _findCompletions(patern,hashArray,prefix){
  prefix=prefix||'';
  var result = {};
  var re_patern = new RegExp('^'+patern,'i');
  for( var c in hashArray){
    var re_test = new RegExp('\^@re\/(.*?)\/');
    if( c == '@user' ){
        result = _collect(result,_get_users_completions(re_patern));
    }else if( re_test.test(c) ){
      var res = c.match(re_test);
      if( res && res[1] ){
        var re_cmd = new RegExp(res[1]);
        if( re_cmd.test(patern) )
          result[patern] = true;
      }
    }else if( c == '@any' ){
      if( patern )
        result[patern] = true;
    }else{
      if(re_patern.test(c))
        result[prefix+c]=true;
    }
  }
  return result;
}

// The function creates an associative array filled with the keys of several associative arrays. Thereby eliminating duplicate keys.
function _collect() {
  var result = {};
  var len = arguments.length;
  for (var i=0; i<len; i++) {
    for (var p in arguments[i]) {
      if ( arguments[i].hasOwnProperty(p)) {
        result[p] = true;
      }
    }
  }
  return result;
}

var _getOnlinePlayers = org.bukkit.Bukkit.getOnlinePlayers;
// The function creates an associative array filled with the names of online players that match the passed regular expression.
function _get_users_completions(re){
  var result = {};
  var user_list = _getOnlinePlayers();
  for ( var i = 0; i < user_list.length; i++ ) {
    var u = user_list[i].name;
    if(re.test(u))
      result[u]=true;
  }
  return result;
}



// Function ...
function _compare_user(user){
  var result = false;
  var user_list = _getOnlinePlayers();
  for ( var i = 0; i < user_list.length; i++ ) {
    var u = user_list[i].name;
    if( user == u ){
      result = true;
      break;
    }
  }
  return result;
}

// Function ...
function _compare_patern(patern, list){
  var result = false;
  for( var c in list){
    if( c == patern ){
      result = c;
      break;
    }else if( c == "@user" ){
      if( _compare_user(patern) ){
        result = c;
        break;
      }
    }else if( c == "@any" ){
      result = c;
      break;
    }else{
      var re_test = new RegExp('\^@re\/(.*?)\/');
      var res = c.match(re_test);
      if( res ){
        if( res[1] ){
          var re_patern = new RegExp(res[1]);
          if( re_patern.test(patern) ){
            result = c;
            break;
          }
        }
      }
    }
  }
  return result;
}