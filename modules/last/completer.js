/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Модуль обработчиков автозавершения команд по нажатию TAB
 *
 * Данный модуль содержит в себе основные функции регистрации команд для плагинов ScriptCraft-a.
 * Так как по умолчанию все команды для плагинов написанных в ScriptCraft-е необходимо начинать с /jsp
 * что не совсем удобно, была предпринята попытка написать общесистемный обработчик, позволяющий регистрировать
 * команды для использования в глобальном пространстве имен команд, автодополнения их по нажатию TAB и привязки функций
 * обработчиков к каждой конкретной команде и/или ее дополнительному параметру.
 *
 * **Модуль устанавливает обработчики событий для:**
 * - [org.bukkit.event.server.TabCompleteEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/server/TabCompleteEvent.html} - обработка и модификация автодополнений для сообщений вводимых как в чате клиента так и в консоли сервера.
 * - [org.bukkit.event.player.PlayerChatTabCompleteEvent]{@link https://hub.spigotmc.org/javadocs/spigot/org/bukkit/event/player/PlayerChatTabCompleteEvent.html} - к сожалению в ScriptCraft этот обработчик не вызывается хотя и должен, его функции в данном модуле возложены на org.bukkit.event.server.TabCompleteEvent
 * - [org.bukkit.event.player.PlayerCommandPreprocessEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerCommandPreprocessEvent.html} - перехват запросов на исполнение команд введенных в чате пользователя и переадрисация их на обработчики зарегестрированные данным модулем
 * - [org.bukkit.event.server.ServerCommandEvent]{@link https://jd.bukkit.org/org/bukkit/event/server/ServerCommandEvent.html} - перехват запросов на исполнение команд введенных в консоли сервера и переадрисация их на обработчики зарегестрированные данным модулем
 *
 * **Возможные варианты имен для регистрацииЖ**
 * - строка содержащая набор символов без пробелов, дополнятся будут если эта строка начинается с тех же символов, что уже ввел пользователь при вводе команды.
 * - "@user" - дополнятся будет из списка игроков находящихся в онлайне.
 * - "@any" - дополнятся будет всегда, не зависимо от того что ввел игрок.
 * - "@re/.../" - дополнятся будет если ввод игрока совпал с указанным регулярным выражением. Например если надо отследить ввод игроком только цифр то следутет поставить "@re/[0-9]+/"
 *
 * **зависимости:**
 * > - utils - стандартный модуль ScriptCraft
 * > - modules/last/locales     - модуль локализации
 * > - modules/last/permissions - модуль управления правами доступа к функционалц прагинов для пользователей и групп пользователей
 *
 * @module last/completer
 *
 * @example
 * //   подключаем модуль регистрации и автодополнения команд
 * var  completer = require('last/completer');
 * //   регистрируем команду {/youcomand} и ee обрабочтик как команду для чата клиента
 * var  command = completer.addPlayerCommand('youcomand',function (...){...});
 * //   регистрируем команду {/youcomand help} и ее обрабочтик как команду для чата клиента
 *      command.addComplete('help',function (...){...});
 * //   регистрируем команду {/youcomand data} без обработчика как команду для чата клиента
 * var  command_data = command.addComplete('data');
 * //   регистрируем команду {/youcomand data get <username> } и ее обрабочтик как команду для чата клиента
 *      command_data.addComplete('get').addComplete('@user',function (...){...});
 * //   регистрируем команду {/youcomand data set <username> <number> } и ее обрабочтик как команду для чата клиента
 *      command_data.addComplete('get').addComplete('@user').addComplete('@re/\d+/',function (...){...});
 * // теперь команда /youcomand со всеми ее параметрами будет доступна как глобальная, и будет автодополнятся по нажатию TAB
 *
 */

'use strict';




var utils = require('utils');
var permissions = require('last/permissions');
var locales = require('last/locales');
var _getOnlinePlayers = org.bukkit.Bukkit.getOnlinePlayers;


// загружаем config
var config = scload("./scriptcraft/data/config/modules/last/completer.json");
if(!config.enable)
  return console.log("modules/last/completer DISABLED");;

// загружаем локаль
var locale = locales.init("./scriptcraft/data/locales/modules/last/", "completer", config.locale||"ru_ru");



/**
 * Функция производит регистрацию псевдонима команды как глобальной (работает из консоли сервера и из чата игры).
 * @param   {string}    comandName  название псевдонима. например "/warp"/.
 * @param   {function}  handler     функция-обработчик для данного участка команды (необязательный параметр)
 * @param   {function}  completer   функция формирующая дополнительный список автодополнений для следующего участка команды (необязательный параметр)
 * @param   {string}    permission  название разрешения, проверятся при автодополнении команды (необязательный параметр)
 * @return  {object}    Экземпляр класа Completer содержащий методы для добавления дополнительных параметров к команде и их обработчиков и функций автодополнения
 */
exports.addGlobalCommand = function(comandName,handler,completer,permission) {
  commands[comandName] = new Completer(comandName,handler,completer,permission);
  commands[comandName].target = 'GLOBAL';
  return commands[comandName];
};

/**
 * Функция производит регистрацию псевдонима команды как клиентской (работает из чата игры).
 * @param   {string}    comandName  название псевдонима. например "/warp"/.
 * @param   {function}  handler     функция-обработчик для данного участка команды (необязательный параметр)
 * @param   {function}  completer   функция формирующая дополнительный список автодополнений для следующего участка команды (необязательный параметр)
 * @param   {string}    permission  название разрешения, проверятся при автодополнении команды (необязательный параметр)
 * @return  {object}    Экземпляр класа Completer содержащий методы для добавления дополнительных параметров к команде и их обработчиков и функций автодополнения
 */
exports.addConsoleCommand = function(comandName,handler,completer,permission) {
  commands[comandName] = new Completer(comandName,handler,completer,permission);
  commands[comandName].target = 'CONSOLE';
  return commands[comandName];
};

/**
 * Функция производит регистрацию псевдонима команды как серверной (работает из консоли сервера).
 * @param   {string}    comandName  название псевдонима. например "/warp"/.
 * @param   {function}  handler     функция-обработчик для данного участка команды (необязательный параметр)
 * @param   {function}  completer   функция формирующая дополнительный список автодополнений для следующего участка команды (необязательный параметр)
 * @param   {string}    permission  название разрешения, проверятся при автодополнении команды (необязательный параметр)
 * @return  {object}    Экземпляр класа Completer содержащий методы для добавления дополнительных параметров к команде и их обработчиков и функций автодополнения
 */
exports.addPlayerCommand = function(comandName,handler,completer,permission) {
  commands[comandName] = new Completer(comandName,handler,completer,permission);
  commands[comandName].target = 'PLAYER';
  return commands[comandName];
};





/**
 * Создает экземпляр Completer. Полученый экземпляр содержит в себе регистраторы команд. Для использования рекомендуется воспользоватся функциями обертками:
 * - addGlobalCommand(comandName,handler,completer)
 * - addConsoleCommand(comandName,handler,completer)
 * - addPlayerCommand(comandName,handler,completer)
 * @constructor
 * @param      {string}     name       наименование добавляемой команды.
 * @param      {function}   handler    обработчик который будет вызван при вводе этой команды (не обязательный параметр).
 * @param      {function}   completer  функция добавляющая элементы к списку автозавершения (не обязательный параметр).
 * @param      {string}     permission название разрешения, удет проверятся при автодополнении команды (необязательный параметр)
 */
function Completer(name,handler,completer,permission) {
  handler=handler||undefined;
  completer=completer||undefined;
  this.complateName = name;
  this.completes = {};
  this.permission = permission||false;
  this.handler = handler;
  this.findCustomCompletions = completer;
}



/**
 * Метод добавляет к команде параметр и его обработчик.
 * @param      {string}     complateName  наименование добавляемой команды.
 * @param      {function}   handler       обработчик который будет вызван при вводе этой команды (не обязательный параметр).
 * @param      {function}   completer     функция добавляющая элементы к списку автозавершения (не обязательный параметр).
 * @param      {string}     permission название разрешения, проверятся при автодополнении команды (необязательный параметр)
 * @return     {object}     Объект содержащий методы для добавления дополнительных параметров к команде и их обработчиков.
 */
Completer.prototype.addComplete = function(complateName,handler,completer,permission) {
  this.completes[complateName] = new Completer(complateName,handler,completer,permission);
  return this.completes[complateName];
};

/**
 * Метод устанавливает (заменяет если уже установлен) обработчик для текущего объекта.
 * @param      {function}   handler       обработчик который будет вызван при вводе этой команды (не обязательный параметр).
 */
Completer.prototype.setHandler = function(handler) {
  this.handler = handler||undefined;
};

/**
 * Метод устанавливает (заменяет если уже установлен) добавляющую элементы к списку автозавершения (не обязательный параметр).
 * @param      {function}   completer       функция добавляющая элементы к списку автозавершения (не обязательный параметр).
 */
Completer.prototype.setCompleter = function(completer) {
  this.completer = completer||undefined;
};



/*
 * Метод возвращает ассоциативный массив содержащий в качестве ключей возможные значения для автодополнения.
 * Если методом setCompleter была установлена функция возвращающая дополнительные значения для автодополнения, они будут включены в список возможных дополнений для команды.
 * @param  {object} sender      объект содержащий пользователя инициировавшего функцию автодополнения нажатием [TAB].
 * @param  {array}  patern_list список шаблонов содержащий строковые значения, которые будут проверены на совпадение с вводимыми символами.
 * @return {object} ассоциативный массив содержащий в качестве ключей возможные значения для автодополнения.
 */
Completer.prototype.getCompletions = function(sender, patern_list,parent_patern) {
  var patern = patern_list.shift();
  var result = {};
  if(patern_list.length){
    var key = _compare_patern(patern, this.completes);
    //console.log("!!!!!!!!!!! key "+key);
    if( key ){
      var completions = this.completes[key].getCompletions(sender,patern_list,patern);
      result = _collect(result,completions);
    }
  }else{
    //console.log("!!!!!!!!!!! patern "+patern);
    result = this.findCompletions(sender, patern);
    if(this.findCustomCompletions){
      var player = utils.player( sender );
      var custom_list = this.findCustomCompletions(player,parent_patern);
      result = _collect( result, _findCompletions(patern, custom_list,'',sender) );
    }
  }
  return result;
};
 // * Метод возвращает ссылку на функцию обработчик команды или дополнения для которой был вызван или для ее дополнений если путь к ним был передан в качестве параметров.
 // * Например есть команда /money give <user> <amount> и ее обработчик, текущий объект ссылается на /money, тогда чтобы получить обработчик для /money give <user> <amount>
 // * необходимо передать путь к нему ["give","@user","@any"]. Если путь не будет передан, функция вернет обработчик для /money (если он был установлен).
 // * @param  {array}    patern_list массив содержащий путь.

/**
 * Метод возвращает ссылку на функцию обработчик команды или дополнения для которой был вызван.
 * @param  {array}    patern_list список шаблонов для поиска возможных автодополнений.
 * @param  {object}   permission  инициализированный для пользователя вызвавшего команду объект проверки разрешений
 * @param  {object}   sender      объект игрока вызвавшего команду
 * @return {function} обработчик команды.
 */
Completer.prototype.getHandler = function(patern_list, permission, sender) {
  var handler = undefined;
  //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!! getHandler "+this.permission + " - " + permission.isPermission(this.permission));
  var self = this;
  if( this.permission && permission )
    if ( !permission.isPermission(this.permission) )
      return function(){ 
        console.log("У вас нет прав для выполнения этой команды ");
        locale.warn( sender, "${msg.deny}");
      };
  var last_handler = handler;
  if(patern_list.length){
    var patern = patern_list.shift();
    var key = _compare_patern(patern, this.completes);
    if( key )
      handler = this.completes[key].getHandler(patern_list, permission, sender);

  }else{
    handler = this.handler;
  }

  return handler||this.handler;
};


Completer.prototype.findCompletions = function(sender,patern) {
  return _findCompletions(patern, this.completes,'',sender);
};



Completer.prototype.complater = function(completer) {
  this.completer = completer||undefined;
};

/*------------------------------------------------------------*/
// хранилище всех команд
var commands = {};
// регистратор новой команды


// поиск подходящих команд
function findCommands(patern) {
};


// устанавливаем обработчик нажатия TAB в строке чата или консоли сервера
var isSetEvents;
if( !isSetEvents ){
  isSetEvents = true;
  events.tabComplete(_tabComplete);
  events.playerCommandPreprocess( _playerCommandPreprocess );
  events.serverCommand( _serverCommand );
}

/*
 * Функция - обработчик серверных событий для [org.bukkit.event.player.PlayerCommandPreprocessEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerCommandPreprocessEvent.html}
 * @param  {object}   event   смотри [org.bukkit.event.player.PlayerCommandPreprocessEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerCommandPreprocessEvent.html}
 */
function _playerCommandPreprocess(event){
  var sender = event.player
  var msg = ''+event.message;
  _CommandPreprocess( event, msg, sender, 'PLAYER' );
}

/*
 * Функция - обработчик серверных событий для [org.bukkit.event.server.RemoteServerCommandEvent]{@link https://hub.spigotmc.org/javadocs/spigot/org/bukkit/event/server/RemoteServerCommandEvent.html}
 * @param  {object}   event   смотри [org.bukkit.event.server.RemoteServerCommandEvent]{@link https://hub.spigotmc.org/javadocs/spigot/org/bukkit/event/server/RemoteServerCommandEvent.html}
 */
function _serverCommand(event){
  var sender = event.getSender();
  var msg = ''+event.command;
  _CommandPreprocess( event, msg, sender, 'CONSOLE' );
}


/*
 * Общая фФункция - обработчик серверных событий для:
 * - [org.bukkit.event.server.RemoteServerCommandEvent]{@link https://hub.spigotmc.org/javadocs/spigot/org/bukkit/event/server/RemoteServerCommandEvent.html}
 * - [org.bukkit.event.player.PlayerCommandPreprocessEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerCommandPreprocessEvent.html}
 * @param  {object} event   смотри [org.bukkit.event.player.PlayerCommandPreprocessEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerCommandPreprocessEvent.html} и [org.bukkit.event.server.RemoteServerCommandEvent]{@link https://hub.spigotmc.org/javadocs/spigot/org/bukkit/event/server/RemoteServerCommandEvent.html}
 * @param  {string} msg     введенная команда
 * @param  {object} sender  объект содержащий данные об отправившем команду. Смотри [org.bukkit.entity Interface Player]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/entity/Player.html}
 * @param  {string} target  строка указывающее происхождение команды, может принимать значения 'CONSOLE' или 'PLAYER'
  */
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

      var permission = false;
      if( sender.name !== "CONSOLE" )
        permission = permissions.getUserPermissions(sender);

      var handler = commands[cmd].getHandler(patern_list, permission, sender);

      if( !handler )
        handler = function(params, sender){
          locale.warn(sender,"${msg.no_cmd}",{"cmd":"/"+params.join(" ")} );
          console.log("для этой команды нет обработчика /"+params.join(" ") );
        };
      _executeCmd(handler,params,sender);
    }
  }
};


/*
 * Функция вызывает переданный обработчик команды в контейнере try ... catch для отлова ошибок
 * @param  {function} handler функция обработчик которую следует выполнить в контейнере try ... catch
 * @param  {array}    params массив состоящий из команды введенной игроком разбитой по пробелу
 * @param  {object}   sender объект содержащий данные об отправившем команду. Смотри [org.bukkit.entity Interface Player]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/entity/Player.html}
 * @return {any}      возвращает результат выполнения обработчика или null
 */
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

/*
 * Функция - обработчик серверных событий для [org.bukkit.event.server.TabCompleteEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/server/TabCompleteEvent.html}
 * Основная задача функции - дополнить предлагаемый набор стандартных автодополнений для команд, списком команд и/или параметров зарегестрированных в данном модуле
 * @param  {object}   event   смотри [org.bukkit.event.server.TabCompleteEvent]{@link https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/server/TabCompleteEvent.html}
 */
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
    completions_list = _findCompletions(patern,commands,prefix,sender);
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

  // var filtered = {};
  // for(var cmd in completions_list){
  //   if( )

  // }

/*
 * Функция проверяет все возможные дополнения для текущей ситуации сравнивая их с шаблоном
 * @param  {string} patern строка содержащая часть команды введенной пользователем (от пробела или начала строки до следующего пробела или конца строки)
 * @param  {object} hashArray одноуровневый ассоциативный массив, ключами которого являются возможные варианты автодополнений
 * @param  {string} prefix строка содержит "/" если ввод команды начинался с этого символа
 * @param  {object} sender объект содержащий игрока вызвавшего событие автодополнения по нажатию TAB
 * @return {object} одноуровневый ассоциативный массив, ключами которого являются совпавшие с шаблоном варианты автодополнений
 */
function _findCompletions(patern,hashArray,prefix,sender){
  prefix=prefix||'';
  var result = {};
  var re_patern = new RegExp('^'+patern,'i');

  //console.log("!!!!!!!!!!!!!!!! "+sender.name );

  var permission = false;
  if( sender.name !== "CONSOLE" )
    permission = permissions.getUserPermissions(sender);

  for( var c in hashArray){
    var point = hashArray[c];

    if( point.permission && permission )
      if ( !permission.isPermission(point.permission) )
        continue;

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

/*
 * Функция предзазначена для слияния двух или более одноуровневых ассоциативных массива (является чисто технической, для внутренних потребностей модуля)
 * @param  {object}   hash1,hash2,....,hashN   любое количество одноуровневых ассоциаьтивных массивов
 * @return {object} сумарный ассоциативный массив
 */
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



/*
 * Функция предзазначена поиска всех онлайн игроков, соответствующих шаблону
 * @param  {regexp} re регулярное выражение содержащее шаблон уже введенной строки
 * @return {object} сумарный ассоциативный массив содержащий всех пользователей соответствующих шаблону
 */
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




/*
 * Функция предзазначена для того чтобы определить, является ли игрок в онлайне или нет
 * @param  {string} user ник игрока
 * @return {boolean} true если игрок онлайн, иначе - false
 */
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

/*
 * Функция проверяет все возможные дополнения для текущей ситуации сравнивая их с шаблоном
 * @param  {string} patern строка содержащая часть команды введенной пользователем (от пробела или начала строки до следующего пробела или конца строки)
 * @param  {object} list одноуровневый ассоциативный массив, ключами которого являются возможные варианты автодополнений
 * @return {string} строка содержащяя пепрвый совравший с шаблоном вариант автодополнения
 */
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
