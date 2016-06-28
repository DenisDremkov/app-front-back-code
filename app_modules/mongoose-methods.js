
var models = require('./models.js')
var sendAdminMail = require('./node-mailer.js')

function findById_(req, next, db, id) {
	models[db].findById(id, function(err, result) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		if (result) {
			req.resultFindById = result;
			next();
		}
		else {
			req.resultFindById = false;
			next();
		}
	})
}
function save_(req, next, object) {
	object.save(function(err, result) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		if (result) {
			req.resultSave = result;
			next()
		}
		else {
			req.resultSave = false;
			next()
		}
	})
}
function findOne_(req, next, db, objectFind) {
	models[db].findOne(objectFind, function(err, result) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		if (result) {
			req.resultFindOne = result;
			next();
		}
		else {
			req.resultFindOne = false;
			next();
		}
	})
}
function findAll_(req, next, nameDb) {
	models[nameDb].find({}, function(err, result) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		if (result) {
			req.resultFindAll = result;
			next();
		}
		else {
			req.resultFindAll = false;
			next();
		}
	})
}

function remove_(req,  next, object) {
	object.remove(function(err, removed) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		if (removed) {
			req.resultRemove = removed;
			next();
		}
		else {
			req.resultRemove = false;
			next();
		}
	})
}

		
module.exports = {
	'findById_' : findById_,
	'save_' : save_,
	'findOne_' : findOne_,
	'findAll_' : findAll_,
	'remove_' : remove_
}