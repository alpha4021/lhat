const log = require('./lib.js').log;
module.exports = {
	roll: roll,
	sumRoll: sumRoll,
	rollCompare: rollCompare,
	rollAgainst: rollAgainst,
	parse: parse,
	toString:toString
};

function rollDice(a,b){
		//a+bD, dice only here
		var _fn = "roll";
		log(_fn,"roll "+a+"+"+b+"D");
		var x = [];
		x[0] = a;
		//var x = 0;
		for(var i = 1;i<=b;i++){
			x[i] = Math.floor((Math.random() * 6) + 1);
			//x += Math.floor((Math.random() * 6) + 1);
		}
		//x+=a;
		log(_fn,"result: "+x.toString());
		return x;
		//should be determined before roll
		//萎縮 1 在「時機：主要動作、主要階段」的行動判定都會－1D。
		//放心 2 被動判定會－1D
		//惑乱 4 所有的判定都會－1D
	}
function roll(a,b,isBSD7){
	return {rolls:rollDice(a,b),isBSD7:isBSD7};
}
function sumRoll(x){
		var r = 0;
		for(var i = 0;i<x.length;i++){
			r+=x[i];
		}
		return r;
}
function rollCompare(x,target){
		log("rollCompare","result: "+(x>target));
		return x>target;
}
function rollAgainst(x,y){
		var _fn = "rollAgainst";
		//x = {rolls:[],isBSD7,}
		//x is active, y is passive
		//rolls[0] = a,others = b
		log(_fn,"compare ["+x.rolls+"] against ["+y.rolls+"]");
		var c6x=0,c6y=0,c1x=0,c1y=0;
		for(var i = 1;i<x.rolls.length;i++){
			if(x.rolls[i]==6){c6x++;continue;}
			if(x.rolls[i]==1){c1x++;continue;}
		}
		for(var i = 1;i<y.rolls.length;i++){
			if(y.rolls[i]==6){c6y++;continue;}
			if(y.rolls[i]==1){c1y++;continue;}
		}
		log(_fn,"c6x="+c6x+" c6y="+c6y);
		log(_fn,"c1x="+c1x+" c1y="+c1y);
		var isXCritical = (c6x>=2);
		var isYCritical = (c6y>=2);
		var isXFumble = x.isBSD7?(c1x>=1):(c1x==(x.rolls.length-1));
		var isYFumble = y.isBSD7?(c1y>=1):(c1y==(y.rolls.length-1));
		log(_fn,"XC="+isXCritical+" YC="+isYCritical);
		log(_fn,"XF="+isXFumble+" YF="+isYFumble);
		//dafault Critical: 2 or more [6]
		//default Fumble: all [1]
		//BSD7(慢心) Fumble: any [1] 		
		
		if(isYCritical || isXFumble){
			//1&&YC = X<Y, 1&&XF = X<Y
			log(_fn,"y wins.");
			return false;
		}
		else if((isXCritical && !isYFumble)||(isYFumble&&!isXFumble)){
			//XC&&!YC = X>Y, YF&&!XF = X>Y
			log(_fn,"x wins.");
			return true;
		}
		else {
			//rollCompare
			var srx = sumRoll(x);
			var sry = sumRoll(y);
			log(_fn,"srx="+srx+" sry="+sry);
			var ccc = rollCompare(srx,sry);
			if(ccc)log(_fn,"x wins.");
			else log(_fn,"y wins.");
			return ccc;
		}
		
}
function parse(input){
	//a+bD
	var x = input.split('+');
	x[1] = x[1].slice(0,-1);
	return x;
}
function toString(a,b){
	return a+"+"+b+"D";
}