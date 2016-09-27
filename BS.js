const async = require('async');
module.exports = {
	calculateDamage: function (attack, wall, reduce, defense,callback_f) {
		async.waterfall([
				function (callback) {
					//damage against wall
					//if damage > wall, damage -= wall;wall=0;callback(null,damage);
					var damage = attack.value;
					console.log(attack);
					var a = wall;
					if (damage > wall) {
						damage = damage - wall;
						wall = 0;
						console.log('Wall: ' + a + '->' + wall);
						callback(null, damage);

					} else {
						wall = wall - damage;
						console.log('Wall: ' + a + '->' + wall);
						callback(true, null);
					}
					//if damage = wall, wall = 0;callback(true,null);
					//if damage < wall, wall -= damage;callback(true,null);

				},
				function (damage, callback) {
					//damage against reduce
					if (reduce == undefined || reduce == [])
						callback(null, damage); //if no reduce, next stage
					var reduct = 0;
					var source = "";
					for (at of attack.tags) {
						for (ri of reduce) {
							if (ri.type == at) {
								if (ri.value > reduct) {
									reduct = ri.value;
									source = ri.type;
								}
							}
						}
					}
					console.log("Reduce: " + source + ":" + reduct);
					//find max reduce from atk/def tags
					if (damage > reduct) {
						damage = damage - reduct;
						callback(null, damage);
					} else {
						callback(true, null);
					}
				},
				function (damage, callback) {
					//damage against defense
					switch (attack.type) {
					case 'physical':
					case 'magic':
						damage = damage - defense[attack.type];
						console.log("Defense: " + attack.type + ":" + defense[attack.type]);
						break;
					default:
						break;
					}
					if (damage <= 0)
						callback(true, null);
					else
						callback(null, damage);
				}
			],
			function (err, result) {
			if (err) {
				console.log("no damage dealt.");
				console.log("wall: " + wall);
				callback_f(null,{type:attack.type,value:0});
			} //no actual damage dealt
			else {
				console.log(attack.type);
				console.log(result + " pts of damage is dealt.");
				callback_f(null,{type:attack.type,value:result});
			} //deal damage to defender
		});
	}

};
