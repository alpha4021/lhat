function parse(input){
	//a+bD
	var x = input.split('+');
	x[1] = x[1].slice(0,-1);
	return x;
}
function roll(x){
	//x[0] + x[1]D
	var y = [];	
	var r = parseInt(x[0]);
	for(var i = 0;i<x[1];i++){
		y[i] = Math.floor(Math.random() * 6 + 1);
		r += y[i];
	}
	;
	var c1 = y.filter(function(x){return x==1;}).length;
	if(y.filter(function(x){return x==6;}).length >= 2)r = 'c';
	if(y.filter(function(x){return x==1;}).length == y.length)r = 'f';
	console.log(y.toString()+"->"+r);
	return r;
}
function RtoString(a,b){
	return a+"+"+b+"D";
}
while(roll(parse('0+2D'))!='c'){}