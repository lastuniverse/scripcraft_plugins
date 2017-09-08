<a name="module_last/locales"></a>

## last/locales
### Интерфейс для работы с локалями

Данный модуль содержит в себе основные функции загрузки локализаций и отправки локализованных сообщений пользователям

**Example**  
```js
файл настроек модуля locales.js: data/config/modules/locales.json
{
	"enable": true,
    "default": "ru_ru", // локаль, используемая по умолчанию.
    "colors":{
    	"event":"brightgreen",	// цвет сообщений отправляемых функцией event
    	"warn":"darkgreen",		// цвет сообщений отправляемых функцией warn
    	"warn":"red",			// цвет сообщений отправляемых функцией warn
    	"help":"aqua"			// цвет сообщений отправляемых функцией help
    }
}

файл с сообщениями на английском языке: data/locales/plugin/test/en_us.json
{
	"msg":{
		"test1": "test1 message",
		"test2": "test3 message",
	},
	"help" [
		"help1 message",
		"help2 message"
	],
	"test": "test message ${key1} ${key2}"
}

файл с сообщениями на русском языке: data/locales/plugins/test/ru_ru.json
{
	"msg":{
		"test1": "тест1 сообщение",
		"test2": "тест2 сообщение",
	},
	"help" [
		"хелп1 сообщение",
		"хелп2 сообщение"
	],
	"test": "тест сообщение ${key1} ${key2}"
}

пример плагина использующего locales.js: plugins/test.js

//   подключаем модуль
var  locales = require('last/locales');

// загружаем локаль. первый параметр - путь, второй - название модуля, третий - язык плагина по умолчанию
var locale = locales.init("./scriptcraft/data/locales/plugins/", "test", "ru_ru");

...

// !!! предположим что по умолчанию локаль плагина "ru_ru". А пользователь в своем клиенте майнкрафта выставил английский язык

locale.help(player,"${help}"); 
// вывод в чат:
   <playername> help1 message
//   <playername> help2 message

locale.echo(player,"${msg.test1}"); 
// вывод в чат:
//   <playername> test1 message

locale.echo(player,"${msg.test2}"); 
// вывод в чат:
//   <playername> test2 message

locale.echo(player,"${test}",{"key1": 11111, "key2": "abcdef" }); 
// вывод в чат:
//   <playername> test message 11111 abcdef

locale.warn(player,"${help.0}"); 
// вывод в чат:
//   <playername> help1 message

locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc"); 
// вывод в чат:
//   <playername> aaa help1 message bbb test1 message ccc

locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc ${test} ddd",{"key1": 11111, "key2": "value of key2" }); 
// вывод в чат:
//   <playername> aaa help1 message bbb test1 message ccc test message 11111 value of key2 ddd

// если файл с локализацией для языка игрока отсутствует, то сообщения будут выводится на языке, указанном при вызове locales.init(...)
// locale.warn(...), locale.help(...), locale.echo(...) и locale.event(...) отличаются только цыетом сообщений, в остальном их функционал идентичен.
// более подробно ознакомится с возможностями модуля вы можете прочитав описание его функций.
```

* [last/locales](#module_last/locales)
    * _static_
        * [.init](#module_last/locales.init) ⇒ <code>object</code>
    * _inner_
        * [~Locales](#module_last/locales..Locales)
            * [new Locales(path, module, lang)](#new_module_last/locales..Locales_new)
            * [.setDebugMode(value)](#module_last/locales..Locales+setDebugMode)
            * [.load(path, module)](#module_last/locales..Locales+load)
            * [.findMsg(key, lang)](#module_last/locales..Locales+findMsg)
            * [.sendMsg(player, message)](#module_last/locales..Locales+sendMsg)
            * [.getMessage(player, message, keys)](#module_last/locales..Locales+getMessage) ⇒ <code>string</code>
            * [.printf(player, color, message, keys)](#module_last/locales..Locales+printf)
            * [.echo(player, message, keys)](#module_last/locales..Locales+echo)
            * [.warn(player, message, keys)](#module_last/locales..Locales+warn)
            * [.event(player, message, keys)](#module_last/locales..Locales+event)
            * [.help(player, message, keys)](#module_last/locales..Locales+help)

<a name="module_last/locales.init"></a>

### last/locales.init ⇒ <code>object</code>
Функция создает объект с локалью

**Kind**: static property of [<code>last/locales</code>](#module_last/locales)  
**Returns**: <code>object</code> - Экземпляр класа Locales содержащий методы для работы со скилом  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | путь к папке с локалями |
| module | <code>string</code> | имя модуля |
| lang | <code>string</code> | язык по умолчанию |

<a name="module_last/locales..Locales"></a>

### last/locales~Locales
**Kind**: inner class of [<code>last/locales</code>](#module_last/locales)  

* [~Locales](#module_last/locales..Locales)
    * [new Locales(path, module, lang)](#new_module_last/locales..Locales_new)
    * [.setDebugMode(value)](#module_last/locales..Locales+setDebugMode)
    * [.load(path, module)](#module_last/locales..Locales+load)
    * [.findMsg(key, lang)](#module_last/locales..Locales+findMsg)
    * [.sendMsg(player, message)](#module_last/locales..Locales+sendMsg)
    * [.getMessage(player, message, keys)](#module_last/locales..Locales+getMessage) ⇒ <code>string</code>
    * [.printf(player, color, message, keys)](#module_last/locales..Locales+printf)
    * [.echo(player, message, keys)](#module_last/locales..Locales+echo)
    * [.warn(player, message, keys)](#module_last/locales..Locales+warn)
    * [.event(player, message, keys)](#module_last/locales..Locales+event)
    * [.help(player, message, keys)](#module_last/locales..Locales+help)

<a name="new_module_last/locales..Locales_new"></a>

#### new Locales(path, module, lang)
Конструктор класса Locales. Инициализирует экземпляр класса загружая в него нужную локаль для указаного модуля


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | путь к папке с локалями |
| module | <code>string</code> | имя модуля |
| lang | <code>string</code> | язык по умолчанию |

<a name="module_last/locales..Locales+setDebugMode"></a>

#### locales.setDebugMode(value)
Функция устанавливает режим отладки. В этом режиме при отсутствии ключей будут вставлятся специальные уведомления

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | true или false |

<a name="module_last/locales..Locales+load"></a>

#### locales.load(path, module)
Функция загружает все доступные локали

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | путь к папке с локалями |
| module | <code>string</code> | имя модуля |

<a name="module_last/locales..Locales+findMsg"></a>

#### locales.findMsg(key, lang)
Функция ищет фразу по ключу для указанного языка, если язык не указан или остутствует локализация, используется язык указанный в this.lang

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | комплексный ключ к нужной фразе |
| lang | <code>string</code> | язык по умолчанию |

<a name="module_last/locales..Locales+sendMsg"></a>

#### locales.sendMsg(player, message)
функция отправляет сообщение message пользователю player если он онлайн

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>object</code> | обьект содержащий данные об игроке, включающие выбранную им локализацию |
| message | <code>string</code> | текст сообшения |

<a name="module_last/locales..Locales+getMessage"></a>

#### locales.getMessage(player, message, keys) ⇒ <code>string</code>
функция возвращает сообщение на языке пользователя (если имеется файл локализации для этого языка)

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  
**Returns**: <code>string</code> - сообщение на языке пользователя.  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>object</code> | обьект содержащий данные об игроке, включающие выбранную им локализацию |
| message | <code>string</code> | текст, может содержать спец вставки типа"${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

<a name="module_last/locales..Locales+printf"></a>

#### locales.printf(player, color, message, keys)
Данная функция отправляет сообщение message пользователю(пользователям) player, предварительно заменив в сообщении все строки вида ${name} на значения ассоциативного массива keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | строка содержащая имя пользователя или массив таких строк (обычный или ассоциативный) или обьект содержащий свойство name с именем пользователя |
| color | <code>string</code> | цвет. Смотри scriptcraft/modules/utils/string-exts.js |
| message | <code>string/object/array</code> | строка, массив или ассоциативный массив содержащий строки, которые могут содержать специальные вставки типа "${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

<a name="module_last/locales..Locales+echo"></a>

#### locales.echo(player, message, keys)
Данная функция отправляет сообщение message пользователю(пользователям) player, предварительно заменив в сообщении все строки вида ${name} на значения ассоциативного массива keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | строка содержащая имя пользователя или массив таких строк (обычный или ассоциативный) или обьект содержащий свойство name с именем пользователя |
| message | <code>string/object/array</code> | строка, массив или ассоциативный массив содержащий строки, которые могут содержать специальные вставки типа "${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

<a name="module_last/locales..Locales+warn"></a>

#### locales.warn(player, message, keys)
Данная функция отправляет сообщение message пользователю(пользователям) player, предварительно заменив в сообщении все строки вида ${name} на значения ассоциативного массива keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | строка содержащая имя пользователя или массив таких строк (обычный или ассоциативный) или обьект содержащий свойство name с именем пользователя |
| message | <code>string/object/array</code> | строка, массив или ассоциативный массив содержащий строки, которые могут содержать специальные вставки типа "${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

<a name="module_last/locales..Locales+event"></a>

#### locales.event(player, message, keys)
Данная функция отправляет сообщение message пользователю(пользователям) player, предварительно заменив в сообщении все строки вида ${name} на значения ассоциативного массива keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | строка содержащая имя пользователя или массив таких строк (обычный или ассоциативный) или обьект содержащий свойство name с именем пользователя |
| message | <code>string/object/array</code> | строка, массив или ассоциативный массив содержащий строки, которые могут содержать специальные вставки типа "${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

<a name="module_last/locales..Locales+help"></a>

#### locales.help(player, message, keys)
Данная функция отправляет сообщение message пользователю(пользователям) player, предварительно заменив в сообщении все строки вида ${name} на значения ассоциативного массива keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | строка содержащая имя пользователя или массив таких строк (обычный или ассоциативный) или обьект содержащий свойство name с именем пользователя |
| message | <code>string/object/array</code> | строка, массив или ассоциативный массив содержащий строки, которые могут содержать специальные вставки типа "${комплексный.ключ}" которые будут заменены на значения из файла локализации |
| keys | <code>object</code> | ассоциативный массив со значениями |

