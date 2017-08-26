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
 * - modules/last/eventex - экземпляр класса EventEmmiter созданный для межмодульного взаимодействия через вызовы событий
 * - modules/last/eventemmiter - собственно eventemmiter
 *      
 * 
 * @module last/timetools
 *
 * @example
 * //   подключаем модуль
 * var  time_tools = require('last/timetools');
 * 
 */

 'use strict';

var utils = require('utils');
var eventex =  require('last/eventex');
var Eventemitter =  require('last/eventemmiter');

// Глобальный для всех скилов евент эмиттер
// var Events = new Eventemitter();

exports.now = now;
function now(){
	var now = Date.now;
	if(now)
		now = new Date().getTime();
	return now;
}


/**
 * Функция позволяет вызвать callback с задержкой указанной в time
 * @param  {Function} callback функция обработчик обратного вызова 
 * @param  {[type]}   time     задержка вызова в мс
 */
exports.callAfterTime = callAfterTime;
function callAfterTime(callback,time){
	var isNext = true;
	function next() { isNext = false; }
	function hasNext() { return isNext;	}
	var self = this;
	utils.nicely( next, hasNext, function(){
		callback.call(self);
	}, time );
}