exports.substractTotalExperience = substractTotalExperience;
function substractTotalExperience(player, exp){
	var curexp = getTotalExperience(player);
	if(curexp < exp)
		return false;

	setTotalExperience(player, curexp - exp);
	return true;

}

exports.addTotalExperience = addTotalExperience;
function addTotalExperience(player, exp){
	var curexp = getTotalExperience(player);
	setTotalExperience(player, curexp + exp);
	return true;

}

exports.setTotalExperience = setTotalExperience;
function setTotalExperience(player, exp){
	exp=exp<<3;


	//This method is used to update both the recorded total experience and displayed total experience.
	//We reset both types to prevent issues.
	if (exp < 0)
		return console.warn("ExpFix setTotalExperience Experience is negative!");

	player.setExp(0);
	player.setLevel(0);
	player.setTotalExperience(0);

	//This following code is technically redundant now, as bukkit now calulcates levels more or less correctly
	//At larger numbers however... player.getExp(3000), only seems to give 2999, putting the below calculations off.
	var amount = 0+exp;
	while (amount > 0) {
		var expToLevel = getExpAtLevel(player);
		amount -= expToLevel;
		if (amount >= 0) {
			// give until next level
			player.giveExp(expToLevel);
		}
		else {
			// give the rest
			amount += expToLevel;
			player.giveExp(amount);
			amount = 0;
		}
	}
}

exports.getExpAtLevel = getExpAtLevel;
function getExpAtLevel(player){
	return _getExpAtLevel( player.getLevel() );
}

exports._getExpAtLevel = _getExpAtLevel;
function _getExpAtLevel(level){
	// if (level > 29)
	// 	return 62 + (level - 30) * 7;
	// if (level > 15)
	// 	return 17 + (level - 15) * 3;
	// return 17;
	if (level > 30)
		return 9*level-158;
	if (level > 15)
		return 5*level - 38;
	return 2*level+7;
}

exports.getExpToLevel = getExpToLevel;
function getExpToLevel(level) {
	var currentLevel = 0;
	var exp = 0;

	while ( currentLevel < level) {
		exp += _getExpAtLevel(currentLevel);
		currentLevel++;
	}

	if (exp < 0) 
		exp = 0; //Integer.MAX_VALUE;

	return exp;
}

//This method is required because the bukkit player.getTotalExperience() method, shows exp that has been 'spent'.
//Without this people would be able to use exp and then still sell it.
exports.getTotalExperience = getTotalExperience;
function getTotalExperience(player){
	var currentLevel = player.getLevel();
	var exp = Math.round( getExpAtLevel(player) * player.getExp() );

	while (currentLevel > 0) {
		currentLevel--;
		exp += _getExpAtLevel(currentLevel);
	}
	if (exp < 0)
		exp = 0; //Integer.MAX_VALUE;

	return exp>>>3;
}
	
exports.getExpUntilNextLevel = getExpUntilNextLevel;
function getExpUntilNextLevel(player) {
	var exp = Math.round( getExpAtLevel(player) * player.getExp() );		
	var nextLevel = player.getLevel();
	return _getExpAtLevel(nextLevel) - exp;
}


