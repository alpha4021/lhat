const path = require('path');
module.exports = {
	f_url: function(id){
		return "http://lhrpg.com/lhz/api/"+id+".json";
	},
	f_uri: function(type,id){
		return path.join(__dirname,"/public/"+type+"/"+id+".json");
	},
	log: function(_fn,message){
		var tab = "";
		var now = new Date().toLocaleString('zh-hant',{hour12:false});
		switch(_fn.length){
			case 0:case 1:case 2:case 3:case 4:case 5:case 6: case 7:
			tab +="\t";
			case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:
			tab +="\t";
			case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:
			tab +="\t";

		}
		console.log(_fn+tab+now+"\t"+message);
	},

	
};
//module.exports.log("lib","lib.js imported.");