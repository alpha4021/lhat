function parseRoll(input){
	//a+bD
	//if constant, return as a+0D
	if(input.indexOf('+')==-1)return [input,0];
	var x = input.split('+');
	x[1] = x[1].slice(0,-1);
	return x;
}
function roll(x,bs,toki){
	//B-W-I-Mu-Ma-Me-Mi-F
	//BS1: M   -1D
	//BS2: !M  -1D
	//BS4: all -1D
	//BS7: fumble
	toki = toki || 'B';
	bs = bs || [null,false,false,false,false,false,false,false,false];
	bs[1] = (bs[1]&&toki.charAt(0)=='M') || false;
	bs[2] = (bs[2]&&toki.charAt(0)!='M') || false;
	bs[4] = bs[4] || false;
	//console.log(toki);
	//console.log(bs[1]);
	//console.log(bs[2]);
	//console.log(bs[4]);
	//x[0] + x[1]D
	var y = [];	
	var r = parseInt(x[0]);
	var rn = x[1] - (bs[1]?1:0)*1 - (bs[2]?1:0)*1 - (bs[4]?1:0)*1;
	//console.log(x[1]+(bs[1]?1:0)+(bs[2]?1:0)+(bs[4]?1:0));
	if (rn < 0){
		return -1;
	}
	for(var i = 0;i<rn;i++){
		y[i] = Math.floor(Math.random() * 6 + 1);
		r += y[i];
	}
	;
	if(y.length == 0){}//escape when roll num = 0
	else if(y.filter(function(x){return x==6;}).length >= 2)r = 'c';
	else if(y.filter(function(x){return x==1;}).length == y.length || 
	(bs[7]&&y.filter(function(x){return x==1;}).length >= 1)
	)r = 'f';
	console.log((y.length>0?(y.toString()+" +"):"")+x[0]+" ->"+r);
	return r;
}
function RtoString(a,b){
	return a+"+"+b+"D";
}
function against(rp,ra){
	//return true if active wins
	if(rp=='c' || ra =='f')return false;
	else if(Number.isInteger(rp) && Number.isInteger(ra))return rp<ra;
	else return true;
}