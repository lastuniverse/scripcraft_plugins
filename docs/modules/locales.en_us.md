<a name="module_last/locales"></a>

## last/locales
### Interface for working with locales

This module contains the basic functions of downloading localizations and sending localized messages to users

**Example**  
```js
configuration file for the module locales.js: data/config/modules/locales.json
{
	"enable": true,
    "default": "ru_ru", // default locale.
    "colors":{
    	"event":"brightgreen",	// the color of messages sent by the event function
    	"warn":"darkgreen",		// the color of messages sent by the warn function
    	"warn":"red",			// the color of messages sent by the warn function
    	"help":"aqua"			// the color of messages sent by the help function
    }
}

file with messages in English: data/locales/plugin/test/en_us.json
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

file with messages in Russian: data/locales/plugins/test/ru_ru.json
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


example of a plugin using locales.js: plugins/test.js
 
// connect the module
var  locales = require('last/locales');

// load the locale. The first parameter is the path, the second is the module name, the third is the default language of the plug-in
var locale = locales.init("./scriptcraft/data/locales/plugins/", "test", "ru_ru");

...

// !!! suppose that the default locale of the plugin is "ru_ru". And the user in his minecraft client exposed English
locale.help(player,"${help}"); 
// output to chat:
//   <playername> help1 message
//   <playername> help2 message

locale.echo(player,"${msg.test1}"); 
// output to chat:
//   <playername> test1 message

locale.echo(player,"${msg.test2}"); 
// output to chat:
//   <playername> test2 message

locale.echo(player,"${test}",{"key1": 11111, "key2": "abcdef" }); 
// output to chat:
//   <playername> test message 11111 abcdef

locale.warn(player,"${help.0}"); 
// output to chat:
//   <playername> help1 message

locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc"); 
// output to chat:
//   <playername> aaa help1 message bbb test1 message ccc

locale.warn(player,"aaa ${help.0} bbb ${msg.test1} ccc ${test} ddd",{"key1": 11111, "key2": "value of key2" }); 
// output to chat:
//   <playername> aaa help1 message bbb test1 message ccc test message 11111 value of key2 ddd

// if there is no localization file for the player's language, the messages will be displayed in the language specified when calling locales.init(...)
// locale.warn(...), locale.help(...), locale.echo(...) and locale.event(...) differ only in text messages, otherwise their functionality is identical.
// more details on the capabilities of the module, you can read the description of its functions.
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
The function creates an object with a locales

**Kind**: static property of [<code>last/locales</code>](#module_last/locales)  
**Returns**: <code>object</code> - A sample of the Locales class containing methods for working with skill  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to the folder with locales |
| module | <code>string</code> | module name |
| lang | <code>string</code> | default language |

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
Constructor of class Locales. Initializes an instance of the class by loading all the locales for the specified module into it.


| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to the folder with locales |
| module | <code>string</code> | module name |
| lang | <code>string</code> | default language |

<a name="module_last/locales..Locales+setDebugMode"></a>

#### locales.setDebugMode(value)
The function sets the debugging mode. In this mode, if there are no keys, special notifications will be inserted

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | true/false |

<a name="module_last/locales..Locales+load"></a>

#### locales.load(path, module)
The function loads all available locales

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to the folder with locales |
| module | <code>string</code> | module name |

<a name="module_last/locales..Locales+findMsg"></a>

#### locales.findMsg(key, lang)
The function searches for a phrase by key for the specified language, if the language is not specified or there is no localization, the language specified in this.lang is used

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | complex key to the desired phrase |
| lang | <code>string</code> | default language |

<a name="module_last/locales..Locales+sendMsg"></a>

#### locales.sendMsg(player, message)
the function sends a message message to the user {player} if it is online.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>object</code> | Object containing player data, including the selected localization. |
| message | <code>string</code> | message text. |

<a name="module_last/locales..Locales+getMessage"></a>

#### locales.getMessage(player, message, keys) ⇒ <code>string</code>
the function returns a message in the user's language (if there is a localization file for this language)

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  
**Returns**: <code>string</code> - message in the user's language.  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>object</code> | Object containing player data, including the selected localization |
| message | <code>string</code> | text, can contain special inserts of type "$ {complex .key}" which will be replaced with values from the localization file |
| keys | <code>object</code> | associative array with values |

<a name="module_last/locales..Locales+printf"></a>

#### locales.printf(player, color, message, keys)
This function sends a message message to the user (users) player, after replacing all lines of the form $ {name} with values ​​of the associative array keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name |
| color | <code>string</code> | color. See scriptcraft/modules/utils/string-exts.js |
| message | <code>string/object/array</code> | is a string, an array or an associative array containing strings that can contain special inserts of type "$ {complex .key}" that will be replaced with values ​​from the localization file |
| keys | <code>object</code> | associative array with values |

<a name="module_last/locales..Locales+echo"></a>

#### locales.echo(player, message, keys)
This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name. |
| message | <code>string/object/array</code> | is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file. |
| keys | <code>object</code> | associative array with values. |

<a name="module_last/locales..Locales+warn"></a>

#### locales.warn(player, message, keys)
This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name. |
| message | <code>string/object/array</code> | is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file. |
| keys | <code>object</code> | associative array with values. |

<a name="module_last/locales..Locales+event"></a>

#### locales.event(player, message, keys)
This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name. |
| message | <code>string/object/array</code> | is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file. |
| keys | <code>object</code> | associative array with values. |

<a name="module_last/locales..Locales+help"></a>

#### locales.help(player, message, keys)
This function sends a message message to the user(users) {player}, after replacing all lines of the form ${complex.key} with values ​​of the associative array keys.

**Kind**: instance method of [<code>Locales</code>](#module_last/locales..Locales)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string/object/array</code> | A string containing the user name or array of such strings (normal or associative) or an object containing the name property with the user name. |
| message | <code>string/object/array</code> | is a string, an array or an associative array containing strings that can contain special inserts of type "${complex.key}" that will be replaced with values ​​from the localization file. |
| keys | <code>object</code> | associative array with values. |

