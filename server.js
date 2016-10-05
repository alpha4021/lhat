var express = require('express');
const log = require('./lib.js').log;
const path = require('path');
const jade = require('jade');
const internet = require('./internet.js');
const async = require('async');
const EventEmitter = require('events');
var bodyParser = require('body-parser');
const emitter = new EventEmitter();
emitter.setMaxListeners(1);
var p_public = path.join(__dirname, 'public');
var app = express();
var ip = '127.0.0.1';
var port = 8888;
var ac = {c:0,e:0};//count of c and e in alist, [0]=c,[1]=e

//--http--//
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.listen(port,function(){
	var _fn = "server.js";
	log(_fn,"Listening port "+port);
	log(_fn,"__dirname = "+__dirname);
});

app.get('/',function(req,res){
	var _fn = "get root";
	log(_fn,"");
	res.sendStatus(200);
});
app.get('/test',function(req,res){
	var _fn = 'test';
	log(_fn,'');
	var reply = jade.renderFile(p_public+'/test.jade');
	res.send(reply);
	
});
app.get('/am',function(req,res){
	var _fn = "get am";
	var reply = jade.renderFile(p_public+'/am.jade');
	res.send(reply);
});
app.get(/ec$/,function(req,res){
	var _fn = "get ec";
	log(_fn,"");
	//get ec
	var reply = jade.renderFile(p_public+'/ec.jade');
	res.send(reply);
});
app.get(/cc$/,function(req,res){
	var _fn = "get cc";
	log(_fn,"");
	//get cc
	var reply = jade.renderFile(p_public+'/cc.jade');
	res.send(reply);
});
app.post('/alist/:type([ace])',function(req,res){
	var _fn = "post alist";
	var type = req.params.type;
	log(_fn,type);
	//var data = {a:alist.filter(function(i){return i.type==req.params.type;})};
	switch(type){
		case 'a':
			res.send(alist);
			break;
		case 'c':
		case 'e':
			res.send(alist.filter(function(i){return i.type==type;}));
			break;
	}
});
app.get('/:p(esd|csd|ccu|cit)/:id(\\d+)',function(req,res){
	var _fn = "get";
	var p = req.params.p;
	var id = req.params.id;
	log(_fn,p+':'+id);
	async.series(
	[function(callback){
		switch(p.charAt(0)){
			case 'c':internet.getPlayer(id,callback);break;
			case 'e':internet.getEnemy(id,callback);break;
			default:break;
		}
	}],function(err,result){
		var reply;
		var data = result[0];
		switch(p.substring(1)){
			case "sd":reply = jade.renderFile(p_public+'/xsd.jade',{name:data.name,type:p.charAt(0),skills:data.skills,drop:data.drop});break;
			case "cu":reply = jade.renderFile(p_public+'/'+p+'.jade',{name:data.name,connections:data.connections,unions:data.unions});break;
			case "it":reply = jade.renderFile(p_public+'/'+p+'.jade',{name:data.name,equipments:[data.hand1,data.hand2,data.armor,data.support_item1,data.support_item2,data.support_item3,data.bag],items:data.items});break;
		}
		res.send(reply);
		
	}
	);
	
});

app.get('/:a(acs2|als2)/:type([ce])/:lid(\\d+)/',function(req,res){
	var _fn = req.params.a;
	var type=req.params.type;
	var lid = req.params.lid;
	log(_fn,type+lid);
	var pos = alist.map(function(e){return (e.type+e.lid+'');}).indexOf(type+lid+'');
	if(pos == -1)res.sendStatus(404);
	var data;
	switch(_fn){
		case "acs2":data = {data:alist[pos].cs[2],pos:pos};break;
		case "als2":data = {data:alist[pos].ls[2],pos:pos};break;
	}
	var reply = jade.renderFile(p_public+'/'+_fn+'.jade',data);
	res.send(reply);
	
});
app.post('/:a(acs2|als2)/:type([ce])/:lid(\\d+)/:cmd([ar])',function(req,res){
	var type=req.params.type;
	var lid = req.params.lid;
	var cmd = req.params.cmd;
	var pos = alist.map(function(e){return (e.type+e.lid+'');}).indexOf(type+lid+'');
	var _fn = req.params.a;
	switch(cmd){
		case 'a':
			var s_type = req.body.type;
			var s_value = req.body.value;
			log(_fn,type+lid+'->'+pos+','+cmd+' '+s_type+':'+s_value);
			switch(_fn){
				case "acs2":
					if(alist[pos].cs[2]===undefined)alist[pos].cs[2] = [];
					alist[pos].cs[2].push({type:s_type,value:s_value});
					log(_fn,'alist[pos].cs[2].length='+alist[pos].cs[2].length);
				break;
				case "als2":
					if(alist[pos].ls[2]===undefined)alist[pos].ls[2] = [];
					alist[pos].ls[2].push({type:s_type,value:s_value});
					log(_fn,'alist[pos].ls[2].length='+alist[pos].ls[2].length);
					break;
			}
			break;
		case 'r':
			//if(alist[pos].cs[2]===undefined)alist[pos].cs[2] = [];
			var s2id = req.body.s2id;
			log(_fn,type+lid+'->'+pos+','+cmd+' '+s2id);
			switch(_fn){
				case "acs2":
					alist[pos].cs[2].splice(s2id,1);
					if(alist[pos].cs[2].length===undefined)alist[pos].cs[2] = [];
					log(_fn,'alist[pos].cs[2].length='+alist[pos].cs[2].length);
				break;
				case "als2":
					alist[pos].ls[2].splice(s2id,1);
					if(alist[pos].ls[2].length===undefined)alist[pos].ls[2] = [];
					log(_fn,'alist[pos].ls[2].length='+alist[pos].ls[2].length);
			}
			break;
		
	}
	emitter.emit('a');
	emitter.emit('a'+type);
	res.sendStatus(200);
});

app.post('/add/:type/:id(\\d+)',function(req,res){
	//add entity to global list
	var _fn = "post:add";
	var id = req.params.id;
	var type = req.params.type;
	log(_fn,type+id);
	async.series([function(callback){
		switch(type){
		case 'c':
			//load character
			internet.getPlayer(id,function(err,data){
				if(err){
					log(_fn,err);
					callback(err,null);
				}
				else {
					alist.push({
						type:"c",
						id:id,
						name:data.name,
						action:data.action,
						status:"b",
						hate:0,
						lid:(ac.c++),
						hp:data.max_hitpoint,
						effect:data.effect,
						cs:[null,0,[],0],//regen,reduc,wall
						bs:[null,false,false,false,false,0,false,false,[]],
						ls:[null,0,[],false,false],
						os:[false,false,false,false,false,false,1,'U'],
						data:data
						});//index: i in clink
					callback(null,'c');
				}
			});
			break;
		case 'e':
			//load enemy
			internet.getEnemy(id,function(err,data){
				if(err){
					log(_fn,err);
					callback(err,null);
				}
				else {
					alist.push({
						type:"e",
						id:id,
						name:data.name,
						action:data.action,
						status:"b",
						//hate:data.hate,
						lid:(ac.e++),
						hp:data.max_hitpoint,
						effect:data.effect,
						cs:[null,0,[],0],//regen,reduc,wall
						bs:[null,false,false,false,false,0,false,false,[]],
						ls:[null,0,[],false,false],//fatique,weak,KO,death
						os:[false,false,false,false,false,false,1,'U'],
						data:data
					});//index: i in elink
					callback(null,'e');
				}
			});
			break;
		}
	}],function(err,result){
		res.sendStatus(200);
		log(_fn,"alist.length:"+alist.length+" alist[x]="+alist[alist.length-1]+" result[0]="+result[0]);
		emitter.emit('a');
		emitter.emit('a'+result[0]);
	});
});
app.post('/remove/alid/:alid(\\d+)',function(req,res){
	var _fn = "post:remove";
	var alid = req.params.alid;
	log(_fn,'alid='+alid);
	alist.splice(alid,1);
	emitter.emit('a');
	emitter.emit('a'+req.body.type);
	
});
app.post('/remove/:type/:lid(\\d+)',function(req,res){
	var _fn = "post:remove";
	var lid = req.params.lid;//list id by its type: elist id or clist id
	var type = req.params.type;
	log(_fn,type+lid);
	//replace iterator to this?
	//var pos = alist.map(function(e){return (e.type+e.lid+'');}).indexOf(type+lid+'');
	var alid = -1;
	for(var i = 0;i<alist.length;i++){
		if(alist[i].type==type && alist[i].lid==lid){alid = i;break;}
	}
	if(alid = -1){log(_fn,"error: alist id not found.");return;}
	
	alist.splice(alid,1);
	
	emitter.emit('a');
	emitter.emit('a'+type);
});

app.post('/update/:type/:lid(\\d+)',function(req,res){
	var _fn = "post:update";
	var lid = req.params.lid;//list id by its type: elist id or clist id
	var type = req.params.type;
	var item = req.body.item;
	var value = req.body.value;
	var alid = -1;
	
	for(var i = 0;i<alist.length;i++){
		//log(_fn,"a "+alist[i].type+alist[i].lid);
		if(alist[i].type==type && alist[i].lid==lid){
			alid = i;
			break;
		}
	}
	log(_fn,type+lid+' alid='+alid);
	if(alid == -1){log(_fn,"error: alist id not found.");return;}
	log(_fn,"item="+item+" value="+value);
	
	switch(item){
		case 'bs8':
			if(value===undefined)value=[];alist[alid].bs[8] = value;break;
		case 'bs5'://alist[alid].bs[5] = value;break;
		case 'bs1':
		case 'bs2':
		case 'bs3':
		case 'bs4':
		case 'bs6':
		case 'bs7':alist[alid].bs[item.charAt(2)] = value;break;
		case 'cs3':
		case 'cs1':alist[alid].cs[item.charAt(2)] = value;break;
		case 'cs2':
			if(value===undefined)value=[];alist[alid].cs[2] = value;break;
		
		default:
		alist[alid][item] = value;
		break;
	}
	res.sendStatus(200);
	emitter.emit('a');
	emitter.emit('a'+type);
});

//--http--//
//--copy and paste--//
var sse_id = 0;
var sse_ress = {a:[],ae:[],ac:[]};
app.get('/sse/:channel', function(req, res) {
	var _fn = "get sse";
	// let request last as long as possible
	var channel = req.params.channel;
	//log(_fn,channel);
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');//send header to let client ready
	(function(sse_id) {
        sse_ress[channel][sse_id] = res;  // <- Add this client to those we consider "attached"
        log(_fn,'add connection channel:'+channel+' id:'+sse_id);
		req.on("close", function(){
			delete sse_ress[channel][sse_id];
			log(_fn,'delete connection channel:'+channel+' id:'+sse_id);
			});  // <- Remove this client when he disconnects
    })(++sse_id)
});

emitter.on('ae',()=>{
	log("emitter on",'ae');
	var data = {a:alist.filter(function(i){return i.type=='e';})};
	for(var x = 0;x<sse_ress['ae'].length;x++){
		if(sse_ress['ae'][x])sse_ress['ae'][x].write('data:'+JSON.stringify(data)+'\n\n');
	}
});
emitter.on('ac',()=>{
	log("emitter on",'ac');
	var data = {a:alist.filter(function(i){return i.type=='c';})};
	for(var x = 0;x<sse_ress['ac'].length;x++){
		if(sse_ress['ac'][x])sse_ress['ac'][x].write('data:'+JSON.stringify(data)+'\n\n');
	}
});
emitter.on('a',()=>{
	log("emitter on",'a');
	var data = {a:alist};
	for(var x = 0;x<sse_ress['a'].length;x++){
		if(sse_ress['a'][x])sse_ress['a'][x].write('data:'+JSON.stringify(data)+'\n\n');
	}
});

//-- for debug--//


//--content--//
var alist = [];//action
function countOf(x){
	return alist.filter(function(i){return i.type==x;}).length;//x = (c|e)
}
/*
alist = [<entity>]
entity = {
	type:(c|e),
	name:data.name,
	action:data.action,
	status:"b",
	hate:0,
	lid:clist.length-1,
	hp:data.max_hitpoint,
	effect:data.effect,
	cs:{},
	bs:{},
	os:{},
	data: <entity_data>
}
*/
//TODO: add entity
//TODO: remove entity
//TODO: Player Controller
//TODO: Battle Controller
//TODO: SSE update page