

//compare min and max values for sliders then new product ad to db
// для случайного добавления и для единичного
var models = require('./models.js')
var sendAdminMail = require('./node-mailer.js')
module.exports = function(req, next, product) {
	'use strict';
	var arrPropertys = ['price', 'screenDiagonal', 'numCores', 'frontCamera', 'mainCamera', 'memory', 'ramMemory'];
	var propertyDb;
	var i;
	var saveNewMinMaxValues = false;
	var next;
	var interval;
	function testBrend() {
		models.brands.find({}, function(err, resultBrends) {
			'use strict';
			var brands;
			var j;
			var thisBrands;
			var newBrand = true;
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			if (resultBrends) {
				brands = resultBrends[0];
				thisBrands = brands[product.kind]
				for (j = 0; j < thisBrands.length; j++) {
					if (thisBrands[j] === product.brand) {
						newBrand = false;
						break;
					}
				}
				if (newBrand) {
					thisBrands.push(product.brand)
					brands.save(function(err, saved) {
						if (err) {
							throw err;
							sendAdminMail(err)
						}
						if (saved) {
							req.resultTestCompare = true
							next()
						}
						else {
							req.resultTestCompare = false
							next()
						}
					})
				}
				else {
					req.resultTestCompare = true;
					next()
				}
			}
			else {
				req.resultTestCompare = false
				next()
			}
		})
	}
	models.minAndMaxVal.find({}, function(err, result) {
		if (err) {
			throw err;
			sendAdminMail(err)
		}
		propertyDb = result[0]
		for (i = 0; i < arrPropertys.length; i++) {
			if (product[arrPropertys[i]] > propertyDb[product.kind][arrPropertys[i]].max) {
				propertyDb[product.kind][arrPropertys[i]].max = product[arrPropertys[i]];
				saveNewMinMaxValues = true;
			}
			if (product[arrPropertys[i]] < propertyDb[product.kind][arrPropertys[i]].min) {
				propertyDb[product.kind][arrPropertys[i]].min = product[arrPropertys[i]];
				saveNewMinMaxValues = true;
			}
		}
		if (saveNewMinMaxValues) {
			propertyDb.save(function(err, saved) {
				if (err) {
					throw err;
					sendAdminMail(err)
				}
				if (saved) {
					testBrend()
				}
				else {
					req.resultTestCompare = false
					next()
				}
			})
		}
		else {
			testBrend()
		}	
	})
}