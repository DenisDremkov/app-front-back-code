

var models = require('./models.js');
var sendAdminMail = require('./node-mailer.js')
//==================create db (day, month, year) for analitic=====================
function createDb(nameDb, noteDb) {
	'use strict';
	function createNoteDb() {
		'use strict';
		var 	newNote;	
		newNote = new models[nameDb](noteDb);
		return newNote;
	}
	models[nameDb].find({}, function(err, data) {
		'use strict';
		var newDb;
		if (err) {
			throw err;
			sendAdminMail(err)
		};
		if (!data[0]) {
			newDb = createNoteDb();
			newDb.save(function(err, resultSave) {
				if (err) {
					throw err;
					sendAdminMail(err)
				}
			})
		}
	})
}
//====================month in arhiv=======================
function setMonthInArhiv () {
	models.analitikaMonth.find({}, function(err, data) {
		'use strict'
		if (err) throw err;
		var 	newDb,
				oldDb,
				date;
		if (data[0]) {
			newDb = new models.analitikaMonth;
			oldDb = data[0];
			date = (new Date());
			newDb.month = String(date.getMonth()) + "-" + String(date.getFullYear());
			newDb.visits = oldDb.visits;
			newDb.uniqVisits = oldDb.uniqVisits;
			var dayJSON = JSON.stringify(oldDb.days)
			newDb.save(function(err) {
				if (err) {
					throw err;
					sendAdminMail(err)
				}
			});
			oldDb.remove(function(err) {
				if (err) {
					throw err;
					sendAdminMail(err)
				}
			});
		}
	})	
};
//==================set 1.day in arhiv(month), 2. month in arhiv(year) /// 00:00 time - action=====================
function setDayInArhiv (transferMonth) {	
	console.log(transferMonth)
	models.analitikaDay.find({}, function(err, dataDay) {
		'use strict';
		var 	newDb_day,
				oldDb_day,
				oldDay_arhiv = {},
				db_month,
				date,
				thisDayForArhiv;
		if (err) {throw err;	sendAdminMail(err)}
		if (dataDay[0]) {
			oldDb_day = dataDay[0];
			//transfer day in month
			models.analitikaMonth.find({}, function(err, dataMonth) {
				if (err) {throw err;	sendAdminMail(err)};
				if (dataMonth[0]) {
					dataMonth[0].visits += oldDb_day.visits;
					dataMonth[0].uniqVisits += oldDb_day.uniqVisits;
					oldDay_arhiv.day = oldDb_day.day;
					oldDay_arhiv.visits = oldDb_day.visits;
					oldDay_arhiv.uniqVisits = oldDb_day.uniqVisits;
					dataMonth[0].days.push(oldDay_arhiv);
					dataMonth[0].save(function(err, save) {
						'use strict';
						if (err) {throw err;	sendAdminMail(err)}
						// clear db day
						if (save) {
							oldDb_day.day = new Date().getDate();
							oldDb_day.visits = 0;
							oldDb_day.uniqVisits = 0;
							delete oldDb_day.ipArray;
							oldDb_day.ipArray = [];
							oldDb_day.save(function(err, save) {
								'use strict';
								if (err) {throw err;	sendAdminMail(err)}
								// if month end - transfer month in year
								if (transferMonth) {
									console.log('transferMonthInYear')
									setMonthInArhiv()
								}
							})
						}
					})
				}
			})
		}
	})	
};
// then server start first - create all db for analitika
var createDb_startServer = function () {
	createDb('analitikaDay', {
		"day" : new Date().getDate(),
		"visits" : 0,
		"uniqVisits" : 0,
		"ipArray" : []	
	})
	createDb('analitikaMonth', {
		"month" : new Date().getMonth(),
		"visits" : 0,
		"uniqVisits" : 0,
		"days" : []	//json 
	})
	createDb('analitikaYear', {
		"year" : new Date().getFullYear(),
		"months" : [] //json 
	})
};
// =================inspect server date for transfer data in arhiv========================================
var inspectServerDate = function () {
	'use strict'
	var	startServerDate,
			todayServerDate,
			yesterday,
			transferMonth;
	startServerDate = (new Date).getDate();
	todayServerDate = (new Date).getDate();
	setInterval(function() {
		yesterday = todayServerDate;
		todayServerDate = (new Date).getDate();
		if (todayServerDate !== yesterday) {
			//change month //month in year
			if (todayServerDate < startServerDate) {
				transferMonth = true;
				setDayInArhiv(transferMonth)
				startServerDate = 1;
				yesterday = 1;
				todayServerDate = 1;
			}
			//change day
			else {
				transferMonth = false;
				setDayInArhiv(transferMonth)
				yesterday = todayServerDate;
			}
		}	
	}, 1000)
};
//random values
var setAllArhivRandomValues = function  () {	
	'use strict';
	var objDay;
	var thisMonth;
	var dayinMonth;
	var i;
	var j;
	var summVisitsMonth = 0;
	var summUniqVisitsSumm = 0;
	var arrMonth = [31, 28, 31, 30, 31, 30]
	var arrMonthDays;
	var arrYear = [];
	var arrYearJSON = [];
	var thisMonthJSON;
	var todayDate;
	var yearDb;
	var monthDb;
	var daysThisMonth;
	for (i = 0; i <  arrMonth.length; i++) {
		dayinMonth = arrMonth[i];
		summVisitsMonth = 0
		summUniqVisitsSumm = 0
		arrMonthDays = [];
		//create all days for this month
		for (j = 0; j < dayinMonth; j++) {
			objDay = {};
			objDay.day = j;
			objDay.visits = Math.ceil(Math.random() * 20) + 150;
			summVisitsMonth += objDay.visits;	
			objDay.uniqVisits =  Math.ceil(Math.random() * 20) + 100;
			summUniqVisitsSumm += objDay.uniqVisits
			arrMonthDays.push(objDay)	
		}
		//summ visits and summ uniq visits
		thisMonth = {};
		thisMonth.month = i;
		thisMonth.visits = summVisitsMonth;
		thisMonth.uniqVisits = summUniqVisitsSumm;
		thisMonth.days = arrMonthDays;
		thisMonthJSON = JSON.stringify(thisMonth)
		arrYear.push(thisMonth)
		arrYearJSON.push(thisMonthJSON)
	}
	models.analitikaYear.find({}, function(err, yearDb) {
		//не учитываем текущий месяц. будет потом добавлен
		for (i = 0; i < (arrYearJSON.length - 1 ); i++) {
			yearDb[0].months.push(arrYearJSON[i])
		}
		yearDb[0].save(function(err, saveYear) {
			//save may
			if (saveYear) {
				models.analitikaMonth.find({}, function(err, data) {
					if (data[0]) {
						monthDb = data[0];
						todayDate = new Date().getDate() - 1;
						daysThisMonth = arrYear[5].days.splice(0, todayDate)
						monthDb.month = new Date().getMonth();
						summVisitsMonth = 0;
						for (i = 0; i < daysThisMonth.length; i++) {
							summVisitsMonth += daysThisMonth[i].visits
						}
						monthDb.visits = summVisitsMonth;
						summUniqVisitsSumm = 0;
						for (i = 0; i < daysThisMonth.length; i++) {
							summUniqVisitsSumm += daysThisMonth[i].uniqVisits
						}
						monthDb.uniqVisits = summUniqVisitsSumm
						for (var i = 0; i < daysThisMonth.length; i++) {
							monthDb.days.push(daysThisMonth[i])
						}
						monthDb.save(function(err,save) {
							if (save) {
								// console.log(save)
							}
						})
					}
				})
			}
		})
	})
}
// inspect visits for analitika
var inspectVisits = function(req) {
	'use strict'
	var 	db,
			ipClient,
			ipArr,
			ipArrLength,
			i,
			uniqClient = true;
	ipClient = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	models.analitikaDay.find({}, function(err, data) {
		if (err) {
			throw err;
			sendAdminMail(err)
		};
		if (data[0]) {
			db = data[0];
			db.visits++;
			ipArr = db.ipArray;
			ipArrLength = db.ipArray.length;
			for (i = 0; i < ipArrLength; i++) {
				if (ipArr[i] === ipClient) {
					uniqClient = false;
					break;
				}
			}
			if (uniqClient) {
				db.uniqVisits++;
				db.ipArray.push(ipClient);
			}
			db.save(function(err,save) {
				if (err) {throw err;	sendAdminMail(err)}
			})
		}
	})
};

module.exports = {
	"startServer_createDb" : createDb_startServer,
	"inspectVisits" : inspectVisits,
	"setAllArhivRandomValues" : setAllArhivRandomValues,
	"inspectServerDate" : inspectServerDate
}
