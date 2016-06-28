var models = require('./models.js')
var fs = require('fs');
var sendAdminMail = require('./node-mailer.js')
module.exports = function(req, res) {
	'use strict'
	var 	idProduct,
			kindImg,
			typeDb,
			oldIdImg,
			typeFile,
			typeAction,
			idImg;
	idProduct = req.body.id;
	kindImg = req.body.kindImg;
	typeDb = req.body.typeDb;
	idImg = req.file.filename;
	typeAction = req.body.typeAction;
	typeFile = "." + (req.file.mimetype).substring(6);
	function renameFile(typeDb, idProduct, typeFile, kindImg, idImg) {
		var fullNameImg;
		models[typeDb].findById(idProduct, function(err, productDb) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			if (productDb) {
				fullNameImg = idProduct + typeFile;	
				fs.rename('public/img/products/' + kindImg +"/" + typeDb + "/" + idImg, 'public/img/products/' + kindImg +"/" + typeDb + "/" + fullNameImg, function(err) {
					if (err) {
						throw err;
						sendAdminMail(err)
					}
				   productDb.img[kindImg] = fullNameImg;	
					productDb.save(function(err,doc) {
						if (err) {
							throw err;
							sendAdminMail(err)
						}
						if (doc) {
							setTimeout(function() {
								res.send({'kindImg': kindImg})
							}, 1000)
						} 
					});
				});
			}
		})
	}
	if (typeAction === 'edit') {
		oldIdImg = req.body.idImg
		fs.unlink('public/img/products/' + kindImg +"/" + typeDb + "/" + oldIdImg, function (err) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			renameFile(typeDb, idProduct, typeFile, kindImg, idImg)
		});	
	}
	else {
		renameFile(typeDb, idProduct, typeFile, kindImg, idImg)
	}
}