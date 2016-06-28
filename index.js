// 'nodejsdremkov@mail.ru'-'angular2016'

var express = require("express");
var appServer = express();
var port = process.env.PORT || 3000;
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var bcrypt = require('bcryptjs');
var path = require("path");
var fs = require('fs');
var fse = require('fs-extra');
var mkdirp = require('mkdirp');
var expressSession = require('express-session');
var random = require('./random-JSON-objects.js')
var server = require('http').Server(appServer);
var io = require('socket.io')(server);
var sendAdminMail = require('./app_modules/node-mailer.js')
var testMinMaxAndBrand = require('./app_modules/testMinMaxValuesAndBrand.js')
var updateDbImg = require('./app_modules/uploadProductImg.js');
var clearValuesMinMax = require('./app_modules/clearValuesMinMax.js')
var incrementServerValue=0;
var incrementClientValue=0;
var multer = require('multer');
var upload = {
	avatar : 			multer({ dest : './public/img/users/avatars/'}),
	small_laptop : 	multer({	dest : './public/img/products/small/laptop'}),
	big_laptop : 		multer({	dest : './public/img/products/big/laptop'}),
	slide1_laptop : 	multer({	dest : './public/img/products/slide1/laptop'}),
	slide2_laptop : 	multer({	dest : './public/img/products/slide2/laptop'}),
	slide3_laptop : 	multer({	dest : './public/img/products/slide3/laptop'}),
	slide4_laptop : 	multer({	dest : './public/img/products/slide4/laptop'}),
	small_tablet : 	multer({	dest : './public/img/products/small/tablet'}),
	big_tablet : 		multer({	dest : './public/img/products/big/tablet'}),
	slide1_tablet : 	multer({	dest : './public/img/products/slide1/tablet'}),
	slide2_tablet : 	multer({	dest : './public/img/products/slide2/tablet'}),
	slide3_tablet : 	multer({	dest : './public/img/products/slide3/tablet'}),
	slide4_tablet : 	multer({	dest : './public/img/products/slide4/tablet'})
}
var setRandomProducts = require('./app_modules/setRandomProducts.js')
var analitikaVisits = require('./app_modules/analitikaVisits.js')
var models = require('./app_modules/models.js')
var config = require('./app_modules/config.js')
var mongoose = require("mongoose");
mongoose.connect(config.urlDbMongo);
mongoose.connection;
var mongooseMethods = require('./app_modules/mongoose-methods.js')
appServer.use(express.static(path.join(__dirname, "public")));
appServer.use(cookieParser());
appServer.use(bodyParser.json());
appServer.use(expressSession({
	secret : 'mySecretCode',
	resave : false,
	saveUninitialized : false
}));


// ++++++++++++++++++++++++++++++++++++++   only one admin in session   ++++++++++++++++++++++++++++++++++++++++++++++++++
	// данный скрипт предусматривает наличие одного администратора в текущий момент времени на сервере - 
	// в базе mongo ставится отметка, которая каждый раз при попытке кого либо зайти под правами администратора проверяется
	// блокирует доступ другим пользователям имеющим доступ администратора 
	// (права админа в открытом доступе, т.е. любой посетитель может зайти в систему под правами администратора и протестировать сайт), 
	// (пользователи уведомляются, с предложением зайти позже). 
	// Причина - во избежание накладок (удаление данных и пр.). если в течении 30 cek - 6*5 сек не приходят 
	// ответы от текущего админа - socket, значит пользователь закрыл страницу в базе mongo ставится отметка
	// открывающая доступ другим пользователям желающим работать под правами админа. на клиентской стороне 
	// соответсвующие скрипты находятся в autentific-controller.
	io.on('connection', function(socket) {
	  socket.on('adminInSession', function(customer) {
			incrementClientValue++
	  });
	});
	function inspectThenAdminLogout() {
		incrementServerValue = 0;
		incrementClientValue = 0;
		io.emit('inspectAdminInSession');
		var intervalInspectAdmin = setInterval(function() {
			incrementServerValue++
			if (incrementServerValue  > incrementClientValue+2) {
				models.user.findOne({'username' : 'admin'}, function(err, result) {
					if (err) {
						throw err;
						sendAdminMail(err)
					}
					result.adminInSession = false;
					result.save(function(err,save) {
						if (err) {
							throw err;
							sendAdminMail(err)						
						}
						clearInterval(intervalInspectAdmin)
					})
				})
			} 
		},5000)
	}




// ++++++++++++++++++++++++++++++++++++++   analitika visits site   ++++++++++++++++++++++++++++++++++++++++++++++++++
	// inspect server date for transfer data in arhiv (day, month, year)
	analitikaVisits.inspectServerDate();
	// analitikaVisits.startServer_createDb();
	// analitikaVisits.setAllArhivRandomValues() 



// ==========================================================  USER POSTS BEGIN  ==========================================
	// + session for users
	appServer.post('/inspectSession',
		//test - admin in session? if 'true' then send to user message that site can work incorrect(admin can delete products or users) 
		function(req, res, next) {
			models.user.findOne({'username' : 'admin'}, function(err, result) {
				if (err) {
					throw err;
					sendAdminMail(err)
				}
				if (result.adminInSession) {
					req.adminInSession = true;
					next()
				}
				else {
					req.adminInSession = false;
					next()
				}
			})
		},
			function(req, res, next) {
				//analitika visits site
				analitikaVisits.inspectVisits(req);
				//if user use sessions
				if (req.cookies['user.session']) {
					mongooseMethods.findById_(req, next, 'user', req.cookies['user.session']);
				}
				// if user dont use sessions
				else {res.send({
					'adminSession' : req.adminInSession
				})}
			},
				//increment values visits for this user
				function(req, res, next) {
					if (req.resultFindById) {
						var userDb = req.resultFindById;
						userDb.visits++;
						mongooseMethods.save_(req, next, userDb)
					}
					else {res.send({
						'adminSession' : req.adminInSession
					})}
				},
					function(req, res, next) {
						if (req.resultSave) { 
							res.send({
							'adminSession' : req.adminInSession,
							'user' : req.resultSave
							})
						}
						else { 
							res.send({'adminSession' : req.adminInSession}) 
						}
					})
	// + login
	appServer.post('/login', 	
		function(req, res, next) {	
			mongooseMethods.findOne_(req, next, 'user', { "username" : req.body.username })
		},
			function(req, res, next) {
				'use strict';
				var 	userClient,
						salt,
						successPassw,
						userServer;
				userClient = req.body;
				userServer = req.resultFindOne;
				if (userServer) {
					successPassw = bcrypt.compareSync(userClient.password, userServer['password']);
					if (successPassw) {
						//for admin
						if (userClient.username === 'admin') {
							// if admin in session
							if(userServer.adminInSession) {
								res.send({'admin': 'inSession'})	
							}
							else {
								// if admin is not session
								userServer.adminInSession = true
								userServer.save(function(err, save) {
									if (err) {
										throw err;
										sendAdminMail(err)
									}
									inspectThenAdminLogout()
									res.send(userServer)
								})	
							}
						}
						else {
							// for user
							if (userClient.session) {
								//set session values and update number visits this user
								userServer.visits++;
								userServer.session = true;						
								res.cookie('user.session', userServer._id, { maxAge: 7*24*60*60, httpOnly: true })
								userServer.save();
								res.send(userServer)	
							}
							else {
								//destroy session
								userServer.visits++;
								userServer.session = false;
								res.cookie('user.session', userServer._id, { maxAge: 0});
								userServer.save();
								res.send(userServer)
							}
						}		
					}
					else {
						res.send("Некорректный пароль")
					}
				}
				else {
					res.send("Некорректный логин")
				}}); 
	// + registration new user
	appServer.post('/registr',
		// test login  
		function(req, res, next) {	
			mongooseMethods.findOne_(req, next, 'user', { 
				"username" : req.body.username 
			})
		},
			//if login free, create new user
			function(req, res, next) {
				var 	newUser,
						newUserDb,
						salt,
						hashPassw,
						commentsUser,
						commentsUserDb;
				if (req.resultFindOne) {
					res.send("логин занят")
				}
				else {
					newUser = new models.user;
					newUser.username = req.body.username;
					salt = bcrypt.genSaltSync(10);
					hashPassw = bcrypt.hashSync(req.body.password, salt);				
					newUser.password = hashPassw;
					newUser.email = req.body.email;
					newUser.rights = "user";
					newUser.visits = 0;
					newUser.session = false;
					newUser.basket = [];
					newUser.comments = [];
					newUser.raitings = [];
					mongooseMethods.save_(req, next, newUser)
				}
			},
				// create db with comments for this user
				function(req, res, next) {
					if (req.resultSave) { 
						newUserDb = req.resultSave;
						commentsUser = {
							'idUser' : newUserDb._id,	
							'comments' : [] 
						};
						commentsUser = new models.comments_users(commentsUser);
						mongooseMethods.save_(req, next, commentsUser)
					}
					else {
						res.send("сбой на сервере, повторите позже")
					}
				},
					//write in user database id database with comments 
					function(req, res, next) {
						if (req.resultSave) {
							commentsUserDb =  req.resultSave;
							newUserDb.commentsId = commentsUserDb._id;
							mongooseMethods.save_(req, next, newUserDb)
						}
						else {
							res.send("сбой на сервере, повторите позже")
						}
					},	
						//send id newUser - for post avatar 
						function(req, res, next) {
							if (req.resultSave) { 
								 res.send({'_id': newUserDb._id}) 
							}
							else {
								 res.send("сбой на сервере, повторите позже") 
							}
						});
	// + user add avatar
	appServer.post('/postAvatar',
		//upload avatar user 
		upload.avatar.single('file'),
			function(req, res, next) {	
				mongooseMethods.findById_(req, next, 'user', req.body.id) 
			}, 
				// rename file img avatar and update user values in db (idAvatar)
				function(req, res, next) {
					if (req.resultFindById) {
						var userDb = req.resultFindById;
						var idAvatar = req.file.filename;
						var typeAvatar = "." + (req.file.mimetype).substring(6);
						var fullNameAvatar = idAvatar + typeAvatar;
						userDb.avatarId = fullNameAvatar;			
						fs.rename('public/img/users/avatars/' + idAvatar, 'public/img/users/avatars/' + idAvatar + typeAvatar, function(err) {
						    if ( err ) {	throw err; 	 sendAdminMail(err)};
						});
						userDb.avatarId = fullNameAvatar;
						mongooseMethods.save_(req, next, userDb)
						res.send({'id': idAvatar})
					}
					else {
						res.send('повторите позже')
					}
				});
	// + user add new product in product basket
	appServer.post('/setProductBasket',
		function(req, res, next) {
			mongooseMethods.findById_(req, next, 'user', req.body.userId)
		},
			function(req, res, next) {
				if (req.resultFindById) {
					req.resultFindById.basket.push(req.body.product);
					mongooseMethods.save_(req, next, req.resultFindById)
				}
				else {
					res.send({success: false})
				}
			},
				function(req, res, next) {
					if (req.resultSave) { res.send({success: true})	}
					else { res.send({success: false}) }
				});
	// + user delete product from basket
	appServer.post('/deleteProductBasket', 
		function(req, res, next) {
			mongooseMethods.findById_(req, next, 'user', req.body.userId)
		},
			function(req, res, next) {
				'use strict';
				var arrBasket;
				var arrBasketLength;
				var i;
				var userDb;
				if (req.resultFindById) {
					userDb = req.resultFindById;
					arrBasket = userDb.basket;
					arrBasketLength = arrBasket.length;
					for (i = 0; i < arrBasketLength; i++) {
						if (arrBasket[i]._id === req.body.productId) {
							arrBasket.splice(i, 1)
							break;
						}
					}
					mongooseMethods.save_(req, next, userDb)
				}
				else {res.send({success: false})}
			},
				function(req, res, next) {
					if (req.resultSave) { res.send({success: true})	}
					else { res.send({success: false}) }
				});
	// + user set reiting for products
	appServer.post('/setReiting', 
		// save raiting in db product
		function(req, res, next) {
			mongooseMethods.findById_(req, next, req.body.kindProduct, req.body.idProduct)
		},
			//update db with products
			function(req, res, next) {
				var productDb;
				var newRaiting;
				if (req.resultFindById) {
					productDb = req.resultFindById;
					productDb.raiting.sum += req.body.raiting;
					productDb.raiting.num += 1;
					newRaiting = (productDb.raiting.sum / productDb.raiting.num).toFixed(2);
					productDb.raiting.val = newRaiting;
					req.productId = productDb._id
					mongooseMethods.save_(req, next, productDb);
				}
				else {
					res.send({'success' : false})
				}
			},
				//save raiting in db user
				function(req, res, next) {
					if (req.resultSave) {
						mongooseMethods.findById_(req, next, 'user', req.body.idUser)
					}
					else {res.send({'success' : false})}
				},
					function(req, res, next) {
						if (req.resultFindById) {
							var userDb = req.resultFindById;
							userDb.raitings.push(req.productId)
							mongooseMethods.save_(req, next, userDb)
						}
						else {res.send({'success' : false})}
					},
						function(req, res, next) {
							if (req.resultSave) {
								res.send({'success' : true})
							}
							else {res.send({'success' : false})}
						})
	// + user add new comment for product
	appServer.post('/setComment',
		//db-comments for this product . find product
		function(req, res, next) {
			mongooseMethods.findById_(req, next, "comments_" + req.body.kindProduct, req.body.idComments)
		},	
			//db-comments for this product . add comment
			function(req, res, next) {
				if (req.resultFindById) {
					var thisProductComments = req.resultFindById;
					thisProductComments.comments.push({
						'user' : req.body.user,
						'dateMilisec' : req.body.milisec,
						'text' : req.body.text
					});
					mongooseMethods.save_(req, next, thisProductComments)
					delete req.resultFindById;
				}
				else {res.send({success:false})}
			},
				//db-product : find product
				function(req, res, next) {
					if (req.resultSave) {
						mongooseMethods.findById_(req, next, req.body.kindProduct, req.body.idProduct)
						delete req.resultSave;
					}
					else {res.send({success:false})}
				},	
					//db-product : increment summ comments
					function(req, res, next) {
						if (req.resultFindById) {
							var dbProduct = req.resultFindById
							dbProduct.comments.summ++;
							mongooseMethods.save_(req, next, dbProduct)
							delete req.resultFindById;
						}
						else {res.send({success:false})}
					},
						// db-comments-user : find note this user
						function(req, res, next) {
							if (req.resultSave) {
								mongooseMethods.findById_(req, next, 'comments_users', req.body.idCommentsUser)
								delete req.resultSave;
							}
							else {res.send({success:false})}
						},
							// db-comments-user : add comment to db-comments this user
							function(req, res, next) {
								if (req.resultFindById) {
									var dbCommentsUser = req.resultFindById;
									dbCommentsUser.comments.push({
										'product' : req.body.idProduct,
										'productKind' : req.body.kindProduct,
										'dateMilisec' : req.body.milisec,
										'text' : req.body.text
									})
									mongooseMethods.save_(req, next, dbCommentsUser)
									delete req.resultFindById;
								}
								else {res.send({success:false})}
							},
								//send success message
								function(req, res, next) {
									if (req.resultSave) {
										res.send({success:true})
									}
									else {res.send({success:false})}
								});
	// + user logout (destroy session) and destroy admin session 
	appServer.post('/logOut', 
		function(req, res) {
			if (req.body.userRights === "admin") {
				models.user.findOne({'username' : 'admin'}, function(err, result) {
					if (err) {
						throw err;
						sendAdminMail(err)
					}
					result.adminInSession = false;
					result.save(function(err,save) {
						if (err) {
							throw err;
							sendAdminMail(err)						
						}
					})
				})
			}
			res.cookie('user.session', { maxAge: 0})
			res.send({"deleteCookie":true})
		});
	// + user get comments then click bar "info"
	appServer.post('/getComments', function(req, res) {
		var db = "comments_" + req.body.db;
		var idComments = req.body.idComments;
		models[db].findById(idComments, function(err, doc) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			if (doc) {
				res.send(doc.comments)
			}
		})});
	// + start application (post all db)
	appServer.post('/getDb', 
		//db products
		function(req, res, next) {
			req.responseData = {};
			mongooseMethods.findAll_(req, next, req.body.kindProduct)
		},
			// db brands
			function(req, res, next) {
				if (req.resultFindAll) {
					req.responseData[req.body.kindProduct] = req.resultFindAll;
				}
				else {res.send({success:false})}
				req.resultFindAll = undefined;
				mongooseMethods.findAll_(req, next, 'brands')
			},
				//min and max values for sliders
				function(req, res, next) {
					if (req.resultFindAll) {
						req.responseData['allBrends'] = req.resultFindAll;
					}
					else {res.send({success:false})}
					req.resultFindAll = undefined;
					mongooseMethods.findAll_(req, next, 'minAndMaxVal')
				},
					function(req, res, next) {
						if (req.resultFindAll) {
							req.responseData['valMinMax'] = req.resultFindAll;
							res.send(req.responseData)
						}
						else {res.send({success:false})}
						mongooseMethods.findAll_(req, next, 'minAndMaxVal')
					});
// #==========================================================  USER END ================================================


// #===========================================================  ADMIN BEGIN =============================================
// createDb for analica
// analitikaVisits.createDb_Visits_startServer();
// analitikaVisits.setArhivVisits();
// + admin delete user from all db (user-db, comments-db, image-db)
appServer.post('/deleteUser',
	//remove user from db-users
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'user', req.body.idUser)
	},
		function(req, res, next) {
			if (req.resultFindById) {
				var userDb = req.resultFindById;
				req.userIdCommentDb = userDb.commentsId;
				req.userIdAvatar = userDb.avatarId;
				mongooseMethods.remove_(req, next, userDb);
			}
			else {
				res.send({success: false})
			}
		},
			// remove user from db-comments-user
			function(req, res, next) {
				if (req.resultRemove) { 
					delete req.resultFindById;
					mongooseMethods.findById_(req, next, 'comments_users', req.userIdCommentDb)
				}
				else { res.send({success: false}) }
			},	
				function(req, res, next) {
					if (req.resultFindById) {
						var userCommentsDb =  req.resultFindById;
						delete req.resultRemove
						mongooseMethods.remove_(req, next, userCommentsDb)
					}
					else { res.send({success: false}) }
				},
					//remove avatar user
					function(req, res, next) {
						if (req.resultRemove) { 
							var avatarId = req.userIdAvatar;
							if (avatarId) {
								var pathDeleteImg = './public/img/users/avatars/' + avatarId;
								fs.unlink(String(pathDeleteImg), function (err) {
									if (err) {
										throw err;
										sendAdminMail(err)
									}
									// mail
									res.send({'success' : true, 'avatar': true})
								});
							}
							else {
								res.send({'success' : true, 'avatar': false})
							}
						}
						else { res.send({success: false}) }
					});
// + admin get db analica (all months this year and present month)
appServer.get('/getAnalitikaDb',
	// find arhiv month 
	function(req, res, next) {
		mongooseMethods.findAll_(req, next, 'analitikaYear')
	},
		// find present month
		function(req, res, next) {
			if (req.resultFindAll) {
				req.yearAnalitika = req.resultFindAll;
				mongooseMethods.findAll_(req, next, 'analitikaMonth')
			}
			else {
				res.send({error:true})
			}
		},
			function(req, res, next) {
				if (req.resultFindAll) {
					res.send({
						'presentMonth' : req.resultFindAll,
						'arhiv' : req.yearAnalitika
					})
				}
				else {
					res.send({error:true})
				}
			})
// + admin delete comment for current user
appServer.post('/deleteComment', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'comments_users', req.body.idCommentsDb)
	},
		function(req, res, next) {
			'use strict';
			var objCommentsThisUser;
			var arrCommentsThisUser;
			var idThisCommentDb;
			var idDeletedComment = '"' + req.body.idDeletedComment + '"';
			var index;
			var i;
			if (req.resultFindById) {
				objCommentsThisUser = req.resultFindById;
				arrCommentsThisUser = objCommentsThisUser.comments;
				for (i = 0; i < arrCommentsThisUser.length; i++) {
					idThisCommentDb = JSON.stringify(arrCommentsThisUser[i]._id)
					if (idThisCommentDb === idDeletedComment) {
						index = i;
						break;
					}
				}
				if (index || index == 0) {
					arrCommentsThisUser.splice(index, 1)
					mongooseMethods.save_(req, next, objCommentsThisUser)
				}
				else {
					res.send({'success' : false});
				}
			}
			else {res.send({'success':false})}
		},
			function(req, res, next) {
				if (req.resultSave) {
					res.send({'success' : true})
				}
				else {res.send({'success' : false})}
			})
// + admin delete avatar for current user
appServer.post('/deleteAvatar', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'user', req.body.idUser)
	},
		function(req, res, next) {
			if (req.resultFindById) {
				var userDb = req.resultFindById;
				req.idAvatar = userDb.avatarId
				userDb.avatarId = undefined;
				mongooseMethods.save_(req, next, userDb)
			}
			else {res.send({success:false})}
		},
			function(req, res, next) {
				if (req.resultSave) {
					var idAvatar = req.idAvatar;
					pathDeleteImg = './public/img/users/avatars/' + idAvatar;
					fs.unlink(String(pathDeleteImg), function (err) {
						if (err) {
							throw err;
							sendAdminMail(err)
						}
						res.send({'success' : true})
					});	
				}
				else {res.send({'success' : false})}
			})
// find user by login
appServer.post('/getUserByLogin', 
	//find user
	function(req, res, next) {
		models.user.findOne({'username': req.body.login}, function(err, user) {
			if (err) {
				throw err;
				res.send({success:false})
			}
			if (user) {
				req.user = user
				next()
			}
			else {res.send({success:false})}
		})
	},
		// find db-comments for this user
		function(req, res, next) {
			mongooseMethods.findById_(req, next, 'comments_users', req.user.commentsId)
		},
			function(req, res, next) {
				var jsonComments
				if (req.resultFindById) {
					jsonComments = JSON.stringify(req.resultFindById.comments);
					console.log(jsonComments)
					res.send({
						'success':true,
						'user' : req.user,
						'comments' : jsonComments
					})
				}
				else {
					res.send({success:false, commentsError : true})
				}
			})
// + admin get group users
appServer.post('/getGroupUsers', 
	function(req, res, next) {
		mongooseMethods.findAll_(req, next, 'user')
	},
		function(req, res, next) {
			if (req.resultFindAll) {
				var begin;
				var end;
				var postedUsers;
				begin = (req.body.page - 1) * req.body.viewNum;
				end = begin + req.body.viewNum;
				postedUsers = req.resultFindAll.slice(begin, end)
				res.send({
					'numberAllUsers' :  req.resultFindAll.length,
					'usersView' : postedUsers,
					'usersSumm' : req.resultFindAll.length
				})
			}
		})
// + for current user admin get comments this user
appServer.post('/getCurrentUserComments', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'comments_users', req.body.idCommentsDb)
	},
		function(req, res, next) {
			if (req.resultFindById) {
				res.send(req.resultFindById.comments)
			}
		})
// + for current product get comments
appServer.post('/getCurrentProductComments', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'comments_' + req.body.kindProduct, req.body.idCommentsDb)
	},
		function(req, res, next) {
			console.log(req.resultFindById)
			if (req.resultFindById.comments.length != 0) {
				res.send(req.resultFindById)
			}
			else {
				res.send({'commentsEmpty' : true})
			}			
		})
// + admin delete current comment for current product
appServer.post('/deleteProductComment', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, 'comments_' + req.body.kindProduct, req.body.idCommentsDb)
	},
		// delete comment from db-comments
		function(req, res, next) {
			'use strict';
			var arrComments;
			var arrCommentsLength;
			var idCommentDb;
			var i;
			if (req.resultFindById) {
				arrComments = req.resultFindById.comments;
				arrCommentsLength = arrComments.length;
				for (i = 0; i < arrCommentsLength; i++) {
					idCommentDb = JSON.stringify(arrComments[i]._id)
					if (idCommentDb === ('"'+req.body.idThisComment+'"')) {
						arrComments[i].remove(function(err, remove) {
							if (err) {	throw err;	sendAdminMail(err);	}
							mongooseMethods.save_(req, next, req.resultFindById)
						})
						break;
					}
				}
			}
			else {res.send({success:false})}
		},
			//find product
			function(req, res, next) {
				if (req.resultSave) {
					req.resultFindById = undefined;
					mongooseMethods.findById_(req, next, req.body.kindProduct, req.body.idProduct)
				}
				else {res.send({success:false})}
			},
				// change value summ comments in db-products for current product
				function(req, res, next) {
					if (req.resultFindById) {
						req.resultFindById.comments.summ--;
						req.resultSave = undefined;
						mongooseMethods.save_(req, next, req.resultFindById)
					}
					else {res.send({success:false})}
				},
					function(req, res, next) {
						if (req.resultSave) {
							res.send({success:true})
						}
						else {res.send({success:false})}
					})
// + admin update harachteristics for current product
appServer.post('/updateProduct', 
	function(req, res, next) {
		mongooseMethods.findById_(req, next, req.body.kind, req.body._id)
	},
		function(req, res, next) {
			if (req.resultFindById) {
				var productDb = req.resultFindById;
				var newValues = req.body;
				productDb.brand = newValues.brand;
				productDb.model = newValues.model;
				productDb.battery = newValues.battery;
				productDb.cpu = newValues.cpu;
				productDb.frontCamera = newValues.frontCamera;
				productDb.guarantee = newValues.guarantee;
				productDb.mainCamera = newValues.mainCamera;
				productDb.memory = newValues.memory;
				productDb.numCores = newValues.numCores;
				productDb.operSystem = newValues.operSystem;
				productDb.price = newValues.price;
				productDb.ramMemory = newValues.ramMemory;
				productDb.screenDiagonal = newValues.screenDiagonal;
				productDb.screenResolution = newValues.screenResolution;
				productDb.colours = newValues.colours
				productDb.sale.bool = newValues.sale.bool;
				productDb.sale.discount = newValues.sale.discount;
				productDb.sale.descript = newValues.sale.descript;
				mongooseMethods.save_(req, next, productDb)
			}
			else {res.send({success:false})}
		},
			function(req, res, next) {
				if (req.resultSave) {
					testMinMaxAndBrand(req, next, req.resultSave)
				}
				else {res.send({success:false})}
			},
				function(req, res, next) {
					if (req.resultTestCompare) {
						res.send({success:true})
					}
					else {res.send({success:false})}
				})
// + admin delete product from all databases (product, comments, images)
appServer.post('/deleteProduct',
	//find
	function(req, res, next) {
		mongooseMethods.findById_(req, next, req.body.productType, req.body.id)
	},	//remove main db
		function(req, res, next) {
			if (req.resultFindById) {
				req.idComments = req.resultFindById.comments.idComments;
				req.kindProduct = req.resultFindById.kind;
				req.allImgJSON = JSON.stringify(req.resultFindById.img);
				mongooseMethods.remove_(req, next, req.resultFindById)
			}
			else {res.send({success : false})}
		},
			function(req, res, next) {
				if (req.resultRemove) {
					mongooseMethods.findById_(req, next,'comments_' + req.kindProduct, req.idComments)
				}
				else {res.send({success : false})}
			},	
				//remove db with comments
				function(req, res, next) {
					if (req.resultFindById) {

						mongooseMethods.remove_(req, next, req.resultFindById)
					}
					else {res.send({success : false})}
				},
					//remove images
					function(req, res, next) {
						var allImg;
						if (req.resultRemove) {
							allImg = JSON.parse(req.allImgJSON);
							for(key in allImg) {
								pathDeleteImg = './public/img/products/' + String(key) + '/' + req.kindProduct + "/" + String(allImg[key]);
								fs.unlink(String(pathDeleteImg), function (err) {
									if (err) {
										throw err;
										sendAdminMail(err)
									}
								})
							}
							res.send({success : true})
						}
						else { res.send({success : false})}
					})
// + admin get current db products
appServer.post('/getDbAdmin', 
	function(req, res) {
		models[req.body.nameDb].find({}, function(err, data) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			res.send(data)
	})})
// + admin get number all products in db
appServer.get('/getNumberDbProducts', 
	function(req, res, next) {
		mongooseMethods.findAll_(req, next, 'tablet')
	},
		function(req, res, next) {
			if (req.resultFindAll) {
				req.numDbProducts = {'tablet' : req.resultFindAll.length}
				delete req.resultFindAll;
			}
			else {
				res.send('false')
			}
			mongooseMethods.findAll_(req, next, 'laptop')
		},
			function(req, res, next) {
				if (req.resultFindAll) {
					req.numDbProducts.laptop = req.resultFindAll.length;
					res.send(req.numDbProducts)
				}
				else {
					res.send('false')
				}
			})
//	+ admin add new product to DataBase
appServer.post('/setProductDb', 
	function(req, res, next) {	
		mongooseMethods.save_(req, next, new models[req.body.kind](req.body))
	},
		// create new note for this product in db-comments
		function(req, res, next) {
			if (req.resultSave) {
				req.savedProduct = req.resultSave;
				var nameDb = "comments_" +  req.savedProduct.kind;
				var commentsDb = new models[nameDb]({
					'idProduct' : req.savedProduct._id,
					'comments' : []	
				});
				req.resultSave = undefined;
				mongooseMethods.save_(req, next, commentsDb)
			}
			else {res.send()}	
		},
			// set id note from db-comments to db-products for this product
			function(req, res, next) {
				if (req.resultSave) {
					req.savedProduct.comments = {
						'summ' : 0,
						'idComments' : req.resultSave._id
					}
					req.resultSave = undefined
					mongooseMethods.save_(req, next, req.savedProduct)
				}	
				else {res.send()}
			},
				// compare min and max values this product with values from db - min and max
				// and change values in db - "min and max" if this need
				// if brend of product is are new brend, then push in db "all brends" value new brand.
				function(req, res, next) {
					if (req.resultSave) {
						testMinMaxAndBrand(req, next, req.resultSave)
					}	
					else {res.send()}
				},
					function(req, res, next) {
						if (req.resultTestCompare) {
							res.send({id : req.resultSave._id})
						}	
						else {res.send()}
					})
// + clear all db with products (products, comments, images)
appServer.post('/clearProductCommentsImageDb', function(req, res) {
	'use strict';
	var counter = 0;
	var interval;
	var arrDbName = ['laptop', 'tablet', 'comments_laptop', 'comments_tablet'];
	var i;
	var pathTablet;
	var pathLaptop;
	var arrKindImg = ['small', 'big', 'slide1', 'slide2', 'slide3', 'slide4']
	// product and comments db 
	for (i = 0; i < arrDbName.length; i++) {
		models[arrDbName[i]].remove({}, function(err, doc) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			counter++
		})
	}
	// db min and max values
	models.minAndMaxVal.find({}, function(err, doc) {
		var db;
		var obj;
		db = doc[0];
		obj = clearValuesMinMax(db);
		obj.save(function(err, save) {
			if (err) {throw err; sendAdminMail(err)}
			if (save) {counter++}
		})
	})
	models.brands.find({}, function(err, doc) {
		if (err) {throw err; sendAdminMail(err)}
		doc[0].laptop.splice(0, doc[0].laptop.length)
		doc[0].tablet.splice(0, doc[0].tablet.length)
		doc[0].save(function(err, save) {
			if (err) {throw err; sendAdminMail(err)}
			if (save) {counter++}
		})
	})	
	interval = setInterval(function() {
		if (counter == arrDbName.length + 2) {
			clearInterval(interval)
			for (i = 0; i < arrKindImg.length; i++) {
				pathTablet = './public/img/products/' + arrKindImg[i] + '/tablet'; 
				pathLaptop = './public/img/products/' + arrKindImg[i] + '/laptop';
				fse.emptyDir(pathTablet, function (err) {
					if (err) {sendAdminMail(err)}
				})
				fse.emptyDir(pathLaptop, function (err) {
					if (err) {sendAdminMail(err)}
				}) 
			}
			res.send({success:true})	
		} 
	},200)})
// + add prepared Db to server (products, images, comments)
appServer.post('/setRandomsProductDb', 
	function(req, res, next) {
		var counterRequest = 0
		if (!counterRequest) {
			counterRequest++
			setRandomProducts.saveRandomProducts(req, res, next, models, random, io)
		}
	})


// + admin upload images for new product all edit product 
appServer.post('/setImgAdmin_small_laptop',    upload.small_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_big_laptop',   	  upload.big_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide1_laptop',   upload.slide1_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide2_laptop',   upload.slide2_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide3_laptop',   upload.slide3_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide4_laptop',   upload.slide4_laptop.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_small_tablet',    upload.small_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_big_tablet',   	  upload.big_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide1_tablet',   upload.slide1_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide2_tablet',   upload.slide2_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide3_tablet',   upload.slide3_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});
appServer.post('/setImgAdmin_slide4_tablet',   upload.slide4_tablet.single('file'), function(req, res) {	updateDbImg(req, res)});

// #===========================================================  ADMIN END =============================================


server.listen(port);
// console.log('server port - 3000');


