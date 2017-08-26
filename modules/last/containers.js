/**
 * @author Surmanidze Roman aka lastuniverse
 * @license MIT
 */

/**
 * ### Интерфейс для регистрации скилов и управления ими
 * 
 * Данный модуль содержит в себе класс для объектов контейнеров и класс для объектов добавляемых в контейнер. 
 * 
 * **зависимости:**
 * - utils - стандартный модуль ScriptCraft
 * - modules/last/users - модуль для централизованного хранения данных пользователя с кэшированием для более быстрого доступа
 * - modules/last/eventex - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/eventemmiter - собственно eventemmiter
 *      
 * 
 * @module last/containers
 *
 * @example
 * //   подключаем модуль
 * var  containers = require('last/containers');
 * 
 */


/*    
    в некоторых местах не согласен с написаным))
    Вот мое предложение:/
    предлагаю такой подход - классов будет 2.

    1. класс контейнер, содержащий в себе следующие методы и свойства:

    - setMethod(methodname, callback) - метод переопределения имеющихся методов

    - register(subObjName, subObject) - метод регистрации по "имени" подобъектов (таких как скилы или эффекты)

    - subObjects - приватное свойство (замыкание) содержащее в себе ассоциативный массив зарегестрированных в объекте данного класса подобъектов

    - getObjectByName ( subObjName ) - метод получения зарегестрированного подобъекта по его имени

    - removeObjectByName( subObjName ) - разрегестрирует и удаляет подобъект по его имени

    - getObjectsForUser ( username | userobject ) - метод получения зарегестрированного подобъекта по его имени

    - getUsersForObject ( subObjName | subObject ) - метод получения списка игроков имеющих subObject (скил или эффект или еще что :)

    - events - экзкмпляр класса EventEmmiter, для работы с событиями

    - events.emit("eventName", event) - метод для вызова слушателей собития (event содержить JSON с данными события)

    - events.on("eventName", callback) и events.once("eventName", callback) - методы для навешивания слушателей события, каждый callback будет получать 1 параметр event содержащий JSON с данными подобъекта вызвавшего событие и данные самого события

    объект будет генерировать события, вызываемые при соответствующих изменениях в любом из подобъектов:
    "onEnabled", "onDisabled", "onPaused", "onUnPaused",
    "onCall"
    а для подобъектов имеющих временный эффект "onStart", "onEnd"



    2. базовый класс подобъектов ( собственно скилов или эффектов)
    который уже будет похож на то что ты написал, и содержать в себе все что ты описал
    но также будет иметь ряд специфичных методов


    - setMethod(methodname, callback) - метод переопределения имеющихся методов

    - hasUser( username | userobject ) - возвращает false если данный подобъект не примениялся(не применяется) к пользователю, или возвращает JSON с текущим статусом применения подобъекта к рользователю

    - getUsers ( ) - метод получения списка игроков имеющих subObject (скил или эффект или еще что :) ассоциативный массив статусов, где ключи - nik игрокаоы

    - enable( true | false ) - включает / выключает подобъект

    - isEnabled() - возвращает true если подобъект включен, false если выключен

    - pause( time ) - ставит подобъект на паузу для всех игроков

    - isPaused() - бла-бла-бла

    - pauseForUser( username | userobject, time ) - ставит подобъект на паузу для указанного игрока

    - isPausedForUser(username | userobject) - бла-бла-бла

    - callForUser( username | userobject, params ) - применяет подобъект к игроку, params - это JSON с параметрами применения, могут менятся в зависимости от типа и реализации подобъекта

    - events - экзкмпляр класса EventEmmiter, для работы с событиями

    - events.emit("eventName", event) - метод для вызова слушателей собития (event содержить JSON с данными события)

    - events.on("eventName", callback) и events.once("eventName", callback) - методы для навешивания слушателей события, каждый callback будет получать 1 параметр event содержащий JSON с данными о событии

    объект будет генерировать события:
    "onEnabled", "onDisabled", "onPaused", "onUnPaused",
    "onCall"
    а для подобъектов имеющих временный эффект "onStart", "onEnd"


*/


 
'use strict';

var utils = require('utils');
var users = require('last/users');
var eventex =  require('last/eventex');
var timetools =  require('last/timetools');
var Eventemitter =  require('last/eventemmiter');

// Глобальный для всех скилов евент эмиттер
// var Events = new Eventemitter();




/**
 * Добавляет раздел "containers" в data игрока
 * в data/last_users-store.json  
 */
eventex.events.on("onPlayerJoin", function ( event ) {
	var player = users.getPlayer(event.player);
	var modulename = "containers";

	// проверяем хранилище для контейнеров
	// если хранилища нет - создаем его
	if( !player.data[modulename] )
		player.data[modulename] = { };

	// проверяем хранилище для каждого зарегестрированного контейнера
	// если хранилища нет - создаем его
	for(var i in containers){
		if( !player.data[modulename][i] )
			player.data[modulename][i] = {};
	}
	
});



/**
 * Конструктор класса Baseclass.
 * @constructor
 * @param   {string}  containerName  название создаваемого контейнера
 * от этого класса наследуются классы Container и Subobject
 */

function Baseclass() {
	this.name = "unnamed";
	this.class = "baseclass";
	// Мы ведь хотим навешивать обработчики событий для вызова того или иного метода в объекте?
	// this.events = new Eventemitter();
}


/**
 * Функция устанавливающая обработчики для функций заглушек. Так как наши функции заглушки делают вызов соответствующих событий
 * @param {string}   methodName название метода в объекте (может быть levelUp, levelDown и так далее)
 * @param {Function} callback   обработчик вызываемый при вызове метода methodName
 */
Baseclass.prototype.setMethod = function(methodName,callback) {
	// this.handlers[methodName] = callback;
	var self = this;
	this[methodName]=function(){
		// вызываем callback
		var event = callback.apply(self, arguments);

		// превращаем имя метода в имя события (например имя метода "levelUp" станет таким именем события "onLevelUp" )
		var evenName = "on"+methodName.charAt(0).toUpperCase() + methodName.substr(1);

		// формируем объект event
		event[self.type] = self;

		// вызываем все зарегестрированные обработчики события вызова метода с названием переданном в methodName
		self.events.emit(evenName, event);

		return result;
	}
};

/**
 * Функция делает ссылки на методы прараметры к себе в this
 * @param   {object}  skillMethods  объект содержащий необходимые методы и параметры
 */
Baseclass.prototype.mergeFrom = function(methods) {
	// Добавляем методы если были переданы
	if( methods && typeof methods === "object" ){
		for (var item_name in methods) {
			var item = methods[item_name];
			if( item && typeof item === "function" ){
				this.setMethod(item_name,item);
			}else{
				this[item_name] = item;
			}
		}
	}

};

/**
 * Функция еммитирует событие для слушателей контейнера и объекта
 * @param   {string|array}	eventName	Имя события
 * @param   {object} 		event  		Данные о событии
 */
Baseclass.prototype.emit = function( eventName, event ){
	var eventList = eventName;
	if( this.class === "baseclass")
		return;

	if(typeof eventName === "string")
		eventList = [eventName];
	
	for(var i in eventList){
		var name = eventList[i];
		event.eventname = name;

		this.events.emit(name,event);

		if(this.container)
			this.container.events.emit(name,event);
	}
}

/**
 * Преобразует текст в целое число
 * @param  {string} number текст который надо преобразовать в число
 * @return {number}        преобразованный в число текст
 */
Baseclass.prototype.toInt = function(number){
	//var result = Math.floor(Number(number));
	var result = Math.floor(parseInt(''+number,10));
	if( isNaN(result) ) result = 0;
	return result;
}








// Хранилище в памяти для зарегестрированных контейнеров. При загрузке оно пустое и заполняется контейнерами через интерфейс регистрации.
var containers = {};


/**
 * Функция производит создание контейнера и его регистрацию 
 * @param   {string}    containerName  название контейнера
 * @return  {object}    Экземпляр класа Container содержащий методы для работы с ...
 */
exports.CreateContainer = CreateContainer;
function CreateContainer(containerName) {
	var container = new Container(containerName);
	containers[containerName] = container;
	return container;
};


/**
 * Конструктор класса Container.
 * @constructor
 * @param   {string}  containerName  название создаваемого контейнера
 */

exports.Container = Container;
function Container(containerName) {
	// далее пересохраняем в объект данные о названии контейнера
	this.name = containerName;

	this.class = "container";

	this.list = {};

	this.paused = 0;

	this.events = new Eventemitter();
};

// наследуемся от Baseclass
Container.prototype = new Baseclass();

/**
 * Функция регистрации подобъекта
 * @param   {string}  subObjName Название регистрируемого объекта
 * @param   {object}  subObject  Регистрируемый в контейнере объект
 * @return  {boolean}      Возвращает результат выполнения, или false если обработчик не был определен методом setMethod(...)
 */
Container.prototype.register = function(subObjName, subObject) {
	// сохраняем ссылку на контейнер в регистрируемом объекте
	subObject.container = this;

	// сохраняем ссылку на регистрируемый объект в контейнере
	this.list[subObjName] = subObject;
};

/**
 * Функция производит поиск подобъекта по его имени
 * @param   {string}  subObjName Название регистрируемого объекта
 * @return  {boolean|object}     Возвращает объект соответствующий subObjName, или false если объекта с таким именем не зарегестрировано
 */
Container.prototype.getObjectByName = function( subObjName ){
	if( !this.list[subObjName] )
		return false;
	return this.list[subObjName];
}

/**
 * Функция производит поиск подобъекта по его имени и удаляет его
 * @param   {string}  subObjName Название регистрируемого объекта
 * @return  {boolean|object}     Возвращает true если объект удален, или false если объекта с таким именем не зарегестрировано
 */
Container.prototype.removeObjectByName = function( subObjName ){
	if( !this.list[subObjName] )
		return false;
	delete this.list[subObjName];
	return true;
}


/**
 * Функция производит поиск всех подобъектов, примененных к пользователю
 * @param   {string|object}  user  	Имя пользователя или объект содержащий пользователя
 * @return  {boolean|object}  		Возвращает ассоциативный массив найденых объектов, или false если объектов не найдено
 */
Container.prototype.getObjectsForUser = function( user ){
	var result = {};
	for (var i in this.list ) {
//console.log("!!!! getObjectsForUser 01 "+i);
		var test = this.list[i].hasUser(user);

		if( test ){
//console.log("!!!! getObjectsForUser 02 ");
			result[i] = this.list[i];
		}
	}
//console.log("!!!! getObjectsForUser 03 "+JSON.stringify(Object.keys(result)));
	return result;
}

/**
 * Функция возвращает ассоциативный массив содержащий все включенные зарегестрированные подобъекты
 * @param   {string|object}  user  	Имя пользователя или объект содержащий пользователя
 * @return  {boolean|object}  		Возвращает ассоциативный массив найденых объектов, или false если объектов не найдено
 */
Container.prototype.getAllObjects = function(){
	var result = {};
	for (var i in this.list ) {
		if( this.list[i].isEnabled() )
			result[i] = this.list[i];
	}
	return result;
}


/**
 * Функция производит поиск всех онлайн игроков, к котороым примененн объект
 * @param   {string|object}  subObject	Название объекта или сам объект
 * @return  {boolean|object}    		Возвращает ассоциативный массив найденых онлайн пользователей, или false если пользователей не найдено
 */
Container.prototype.getUsersForObject = function( subObject ){
	var obj = subObject;
	if( typeof obj === "string" )
		obj = this.getObjectByName(obj);
	if( !obj )
		return false;
	return obj.getUsers();	
}












/**
 * Функция производит создание контейнера и его регистрацию 
 * @param   {string|object}    containerName  название контейнера или объект контейнера
 * @return  {object}    Экземпляр класа Container содержащий методы для работы с ...
 */
exports.CreateSubObject = CreateSubObject;
function CreateSubObject(containerName,subObjectName) {
	container = containerName;
	if( typeof container === "string" )
		container = containers[container];
	if( !container )
		return false;

	// var container = new Container(containerName);
	// containers[containerName] = container;
	// return container;
};



/**
 * Конструктор класса Subobject.
 * @constructor
 * @param   {string}  containerName  название создаваемого контейнера
 */

exports.Subobject = Subobject;
function Subobject(SubObjectName) {
	// далее пересохраняем в объект данные о названии объекта
	this.name = SubObjectName

	this.class = "subobject";

	this.enable = true;

}


// наследуемся от Baseclass
Subobject.prototype = new Baseclass();


/**
 * Функция проверяет, применен ли данный объект к пользователю
 * @param   {string|object}  username  	Имя пользователя или объект содержащий пользователя
 * @return  {boolean|object}			Возвращает false если не применен, или JSON со статусом применения и данными про привязке объекта к пользователю
 */
Subobject.prototype.hasUser = function( username ){
	var user = utils.player(username);
	if( !user )
		return false;
	var player = users.getPlayer(user);
	var container = this.container;
	if(!player.data.containers || !player.data.containers[container.name]|| !player.data.containers[container.name][this.name] )
		return false;
	var result = {
		userdata: player.data.containers[container.name][this.name],
		status: this.hasUserStatus(player)
	};
	return result;
}

/**
 * Функция проверяет, статус применения данного объекта к пользователю
 * @param   {string|object}  user  	Имя пользователя или объект содержащий пользователя
 * @return  {boolean|object}		Возвращает false если не применен, или JSON со статусом применения
 */
Subobject.prototype.hasUserStatus = function( username ){
	// тут пока ХЗ что должно быть (время действия, сила действия, хз откуда это должно приходить, пока не ясно)
	// думаю что эта фанка должна переопределятся каждым скилом или эффектом по своему и возвращать актуальное для скила или эффекта
	var user = utils.player(username);
	if( !user )
		return {};
	return {};
}


/**
 * Функция связывает объект и пользователя
 * @param   {string|object} username  	Имя пользователя или объект содержащий пользователя
 * @param   {object}  		params  	JSON с параметрами
 */
Subobject.prototype.attachForUser = function( username, params ){
	var player = users.getPlayer(username);
	if(!player)
		return false;
	var container = this.container;
	if(!player.data.containers || !player.data.containers[container.name] )
		return false;
	var data = player.data.containers[container.name];
	if(!data[this.name])
		data[this.name] = params;
	return data[this.name];
}

/**
 * Функция связывает объект и пользователя
 * @param   {string|object} username  	Имя пользователя или объект содержащий пользователя
 */
Subobject.prototype.detachFromUser = function( username ){
	var player = users.getPlayer(username);
	if(!player)
		return false;
	var container = this.container;
	if(!player.data.containers || !player.data.containers[container.name] )
		return false;
	var data = player.data.containers[container.name];
	if(!data[this.name])
		return false;

	delete data[this.name];
}


/**
 * Функция включает / выключает подобъект
 * @param   {boolean}  value  	true - включить, false - выключить
 */
Subobject.prototype.Enable = function( value ){
	this.enable = value?true:false;

	// готовим объект евента
	var event = {
		subobject: this,
		time: timetools.now()
	};

	if( this.enable ){
		// эмитируем события onEnable для всех слушателей объекта и для всех слушателей контейнера
		this.emit( "onEnable" , event );
	}else{
		// эмитируем события onDisable для всех слушателей объекта и для всех слушателей контейнера
		this.emit( "onDisable" , event );
	}
}

/**
 * Функция проверяет включен ли подобъект
 * @return  {boolean|object} Возвращает true если подобъект включен, false если выключен
 */
Subobject.prototype.isEnabled = function(){
	return this.enable;
}


/**
 * Функция включает или выключает скилл для которого вызвана (действует на указанного пользователя)
 * @param   {string|object}	username	Имя пользователя или ссылка на объект пользователя
 * @param   {boolean}  		value  		Если true то скил будет включен, если false отключен
 */
Subobject.prototype.enableForUser = function(username, value) {
	var player = users.getPlayer(username);
	if(!player)
		return false;
	var container = subObject.container;
	if(!player.data.containers || !player.data.containers[container.name] )
		return false;
	var data = player.data.containers[container.name];
	if(!data[this.name])
		data[this.name] = {};

	data[this.name].enable = value?true:false;

	// готовим объект евента
	var event = {
		subobject: this,
		time: timetools.now()
	};

	if( data[this.name].enable ){
		// эмитируем события onEnable для всех слушателей объекта и для всех слушателей контейнера
		this.emit( "onEnableForUser" , event );
	}else{
		// эмитируем события onDisable для всех слушателей объекта и для всех слушателей контейнера
		this.emit( "onDisableForUser" , event );
	}

	return data[this.name];
};


/**
 * Функция проверяет наличие данного скила у пользователя и возвращает объект с данными скила у пользователя если у него такой скил есть и скил включен
 * @param   {string}  user  Имя пользователя или ссылка на объект пользователя
 * @return {boolean}        Возвращает возвращает true если у пользователя такой скил есть и включен иначе false
 */

Subobject.prototype.isEnabledForUser = function(user) {
//console.log("++ isEnabledForUser 01");
	if(!this.enable)
		return false;
	var player = users.getPlayer(user);
	if(!player)
		return false;
	var container = this.container;
	if(!player.data.containers || !player.data.containers[container.name])
		return false;
	var data = player.data.containers[container.name];
	if(!data[this.name])
		return false;
	if(!data[this.name].enable)
		return false;
//console.log("++ isEnabledForUser 06");
	return data[this.name];
};


/**
 * Функция ставит объект на паузу
 * @param   {number}  time  время паузы в милисекундах
 * @param   {object}  params  	Дополнительные параметрыЮ которые будут переданы в евент
 */
Subobject.prototype.pause = function( time, params ){
	this.paused = timetools.now()+time;

	// готовим объект евента
	var event = {
		subobject: this,
		time: time,
		end: this.paused,
		params: params
	};
	// эмитируем события onGlobalPaused и onPaused для всех слушателей объекта и для всех слушателей контейнера
	this.emit( ["onGlobalPaused","onPaused"] , event );
	var self = this;
	// далее эмитируем событие снятия с паузы через указанное время +300 мс
	timetools.callAfterTime(function(){
		// возврат если еще на паузе
		if( self.isGlobalPaused() )
			return;
		// эмитируем события onGlobalUnPause и onPause для всех слушателей объекта и для всех слушателей контейнера
		self.emit( "onGlobalUnPaused", event );
	},time+300);	
}

/**
 * Функция проверяет стоит ли объект на паузе
 */
Subobject.prototype.isGlobalPaused = function(){
	var time = timetools.now()
	if( time < this.paused )
		return this.paused-time;
	return 0;
}


/**
 * Функция ставит объект на паузу
 * @param   {string|object}  username  	Имя пользователя или объект содержащий пользователя
 * @param   {int}     time  	Время блокировки в миллисекундах
 * @param   {object}  params  	Дополнительные параметрыЮ которые будут переданы в евент
 * @param   {number}  time  время паузы в милисекундах
 */
Subobject.prototype.pauseForUser = function( username, time, params){

	var userdata = this.isEnabledForUser(username);
	if( !userdata )
		return false;

	userdata.paused = timetools.now()+time;

	// готовим объект евента
	var event = {
		subobject: this,
		player: utils.player(username),
		playerdata: userdata,
		time: time,
		end: userdata.paused,
		params: params
	};
	// эмитируем события onGlobalPause и onPause для всех слушателей объекта и для всех слушателей контейнера
	this.emit( "onPaused", event );
	var self = this;

	// далее эмитируем событие снятия с паузы через указанное время +300 мс
	timetools.callAfterTime(function(){
		// возврат если еще на паузе
		if( self.isPausedForUser(username) )
			return;
		// эмитируем события onUnPause для всех слушателей объекта и для всех слушателей контейнера
		self.emit( "onUnPaused", event );
	},time+300);	
}

/**
 * Функция проверяет стоит ли объект на паузе для конкретного игрока
 * @param   {string|object}  username  	Имя пользователя или объект содержащий пользователя
 */
Subobject.prototype.isPausedForUser = function(username){
	var userdata = this.isEnabledForUser(username);
	if( !userdata )
		return 0;

	var time = userdata.paused - timetools.now();
	var gtime = this.isGlobalPaused();
	if( gtime > time)	
		time = gtime;

	if(  time < 0  )
		return 0;

	return time;
}


/**
 * Функция запускет самостоятельный цикл повторений вызывая функцию callback
 * через заданные промежутки времени time до тех пор, пока она не вернет false
 * @param   {function} callback функция обратного вызова
 * @param   {number}   time  	время паузы в милисекундах
 * @param   {object}   params  	Дополнительные параметры которые будут переданы в евент
 * @param   {string|object}  username  	Имя пользователя или объект содержащий пользователя
 */
Subobject.prototype.repeat = function( callback, time, params, username ){
	time = this.toInt(time);
	
	// выходим если не задано время повторения
	if( !time )
		return;

	// не позволяем запускать слишком быстрые таймеры
	if( time<300 )
		time = 300;

	// готовим объект евента
	var event = {
		subobject: this,
		time: time,
		params: params,
		playerdata: false
	};
	// эмитируем события onGlobalPaused и onPaused для всех слушателей объекта и для всех слушателей контейнера
	this.emit( "onRepeatStart" , event );

	var self = this;

	function repeat_handler(){
		delete event.action;
		delete event.paused;

		// возврат c прекращением цикла обработки если выключен
		if( self.isEnabled() ){
			event.action = "disabled";
			return self.emit( "onRepeatStop" , event );;
		}

		// возврат c переносом цикла обработки если на глобальной паузе
		// возобновится после снятия паузы
		var gtime = self.isGlobalPaused();
		if( gtime ){
			event.action = "paused";
			event.paused = gtime;
			repeat_next(gtime);
			return self.emit( "onRepeatPaused" , event );
		}


		// если был передан игрок получаем ссылку на его данные по текущему субобъекту
		if( username ){
			events.playerdata = self.enableForUser(username);
			// возврат c прекращением цикла обработки если выключен для игрока
			if( !events.playerdata ){
				event.action = "disabled";
				return self.emit( "onRepeatStop" , event );
			}

			// возврат c переносом цикла обработки если на паузе для игрока
			// возобновится после снятия паузы
			var utime = self.isPausedForUser(username);
			if( utime ){
				event.action = "paused";
				event.paused = utime;
				repeat_next(utime);
				return self.emit( "onRepeatPaused" , event );
			}
		}

		// производим вызов функции обратного вызова )))
		var test = callback(event);

		// далее эмитируем событие повторения
		self.emit( "onRepeat" , event );

        // возврат c прекращением цикла обработки если вернула false
        if(!test){
            event.action = "ended";
            // эмитируем событие onRepeatStop для всех слушателей объекта и для всех слушателей контейнера
            return self.emit( "onRepeatStop" , event );
        }
        
        // иначе продолжаем повторять вызовы
        repeat_next(time);
	}
	
	function repeat_next(ntime){
		timetools.callAfterTime( repeat_handler, ntime );
	}
}
