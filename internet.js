const http = require('http');
const fs = require('fs');
const async = require('async');
const lib = require('./lib.js');
const log = lib.log;
const T_C = "character";
const T_E = "enemy";
module.exports = {
	getPlayer: getPlayerJson,
	updatePlayer: updatePlayerJson,
	getEnemy: getEnemyJson
};


function getEnemyJson(id,callback){
	var _fn = arguments.callee.name;
	var uri = lib.f_uri(T_E,id);
	log(_fn,"uri="+uri);
		fs.readFile(uri,'utf8',function(err,data){
			if(err){
				log(_fn,err);
				callback(err,null);
				return;
			}
			var enemy_json = JSON.parse(data);
			log(_fn,"Return JSON");
			callback(null,enemy_json);
		});
}

function updatePlayerJson(id,callback){
	//var _fn = "updatePlayerJson";
	var _fn = arguments.callee.name;
	var fmtime, omtime;
	var url = lib.f_url(id);
	var uri = lib.f_uri(T_C,id);
	//var file = fs.createWriteStream("./"+id+".json");
	fs.stat(uri,function(err,stats){
		fmtime = stats===undefined?0:Date.parse(stats.mtime);//file last modified time
	});
	http.get(url,function(res){
		//console.log(res.statusCode);
		omtime = (res.statusCode==200)?Date.parse(res.headers['last-modified']):0;//online file last modified time
		log(_fn,fmtime+" "+omtime);
		if(omtime == 0){callback("error 1",null);return;}
		if(fmtime>omtime){
			log(_fn,"File is already latest.");
			callback(null,true);
		} else {
			log(_fn,"File updating...");
			//fs.appendFileSync(uri,res,{flag: 'w'});
			res.pipe(fs.createWriteStream(uri));
			callback(null,false);
		}
	});
	
}
function getPlayerJson(id,callback){
	var _fn = arguments.callee.name;
	var uri = lib.f_uri(T_C,id);
	log(_fn,"uri="+uri);
	fs.readFile(uri,'utf8',function(err,data){
		if(err){
			log(_fn,err);
			callback(err,null);
			return;
		}
		var player_json = JSON.parse(data);
		log(_fn,"Return JSON");
		callback(null,player_json);
	});
}
