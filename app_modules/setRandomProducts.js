

// ============================РЕКУРСИЯ В РЕКУРСИИ С КОЛЛБЭКАМИ ==================================
// (основная рекурсия - добавление товара, дочерняя - добавление фотографий текущего товара)
// 1. сначала сохраняется сам продукт,
// 2. создается запись в бд комментариев для данного товара
// 3. в бд комментариев добавляются случайное колличество комментариев (до 15 шт. каждому товару) 
// из готовой базы (файл - random-JSON-object в корневом каталоге), стартовая позиция тоже случайная
// 4. база комментариев сохраняется.
// 5. в базу комментариев записывается ид продукта а в базу с самим продуктом ид базы комментариев для быстрого поиска в дальнейшем
// 6. после из готовой базы фотографий случайно берутся изображения и присваиваются имена и копии данных изображений данному текущему продукту в цикле. 
// фотографии добавляются таким образом чтобы "small" и  "big" фото совпадали для popup увеличения
// 7. при добавлении фотографий запускается вотчер, который при добавлении всех фотографий данного товара в цикле увеличивает основной счетчик на 1, 
// что сигнализирует об успешном добавлении всех баз и фотографий данного продукта
// 8. главный вотчер следит за основным счетчиком, который как только станет равным количеству товаров отпрвит ответ админу об успешном добавлении всех продуктов
// 9. socket сообщениями админ уведомляется о статусе добавления (счетчик и периодические сообщения от вэб-ассистента)
// 10. также проверяется в базе бренд добавляемого товара и если бренд товара отсутсвует в основной базе брендов то добавляется в данную базу
// 11. также сравниваются  минимальные и максимальные значения для слайдеров и при необходимости заменяются.
var fse = require('fs-extra');
var saveRandomProducts = function(req, res, next, models, random, io) {
	'use strict'
	var 	productDb,
			commentsDb,
			nameDb_comments,
			arrComments,
			start,
			randomStart,
			i,
			allRandomProducts,
			numberProducts,
			end,
			pathImg,
			pathImgConstant,
			randomValue,
			counterAddImg,
			thisNameImg,
			arrNameImg, 
			delta,
			counter,
			smallAndBigRandomValue,
			minAndMaxValuesDb,
			arrPropertys;
	console.log('func')
	arrPropertys = ['price', 'screenDiagonal', 'numCores', 'frontCamera', 'mainCamera', 'memory', 'ramMemory']
	arrNameImg = ['small', 'big', 'slide1', 'slide2', 'slide3', 'slide4']		
	numberProducts = req.body.number;
	allRandomProducts = random.randomProducts;
	start = Math.floor(Math.random()*(allRandomProducts.length - numberProducts));
	end = Number(start) + Number(numberProducts);
	delta = end - start;
	function addNewProduct() {
		productDb = new models[allRandomProducts[start].kind](allRandomProducts[start]);
		//save db product + create db comments + push random comments
		productDb.save(function(err,saveProduct) {
			if (err) {
				throw err;
				sendAdminMail(err)
			}
			nameDb_comments = "comments_" +  saveProduct.kind;
			commentsDb = new models[nameDb_comments]({
				'idProduct' : saveProduct._id,
				'comments' : []	
			});
			arrComments = random.randomComments;
			randomValue = Math.floor(Math.random()*15);
			randomStart = (Math.ceil(Math.random()*180));
			for (i = randomStart; i < (randomStart+randomValue); i++) {
				commentsDb.comments.push(arrComments[i])
			}
			// save in db product - id db comments and number comments
			commentsDb.save(function(err, saveCommDb) {
				productDb.comments = { 
					'summ' : saveCommDb.comments.length,
					'idComments' : saveCommDb._id
				}
				counterAddImg = 6;
				smallAndBigRandomValue = undefined;
				function addImg() {
					thisNameImg = arrNameImg[counterAddImg - 1];
					if (thisNameImg === 'big' || thisNameImg === 'small') {
						if (!smallAndBigRandomValue) {
							smallAndBigRandomValue = Math.ceil(Math.random()*4)
						}
						randomValue = smallAndBigRandomValue || Math.ceil(Math.random()*4)
					}
					else {
						randomValue = Math.ceil(Math.random()*4)
					}
					pathImgConstant = './public/img/constants/' + thisNameImg + '/' + saveProduct.kind + '/' + randomValue + '.png';
					pathImg = './public/img/products/' + thisNameImg + '/' + saveProduct.kind + '/' + saveProduct._id + '.png';
					fse.copy(pathImgConstant, pathImg, { replace: false }, function (err) {
						if (err) {
							throw err;
							sendAdminMail(err)
						}
						productDb.img[thisNameImg] = productDb._id + '.png';
						counterAddImg--
						if (counterAddImg) {
							addImg()
						}
						else {
							productDb.save(function(err, saved) {
								if (err) {
									throw err;
									sendAdminMail(err)
								}
								productDb = saved;
								counter = end - start;
								io.emit('addNewRandomProduct',  {
									'counter' : counter, 
									'delta' : delta,
									'kind' : productDb.kind
								});
								//test max min
								models.minAndMaxVal.find({}, function(err, result) {
									if (err) {
										throw err;
										sendAdminMail(err)
									}
									minAndMaxValuesDb = result[0]
									for (i = 0; i < arrPropertys.length; i++) {
										if (productDb[arrPropertys[i]] > minAndMaxValuesDb[productDb.kind][arrPropertys[i]].max) {
											minAndMaxValuesDb[productDb.kind][arrPropertys[i]].max = productDb[arrPropertys[i]];
										}
										if (productDb[arrPropertys[i]] < minAndMaxValuesDb[productDb.kind][arrPropertys[i]].min) {
											minAndMaxValuesDb[productDb.kind][arrPropertys[i]].min = productDb[arrPropertys[i]];
										}
									}
									//save db max-min 
									minAndMaxValuesDb.save(function(err, saved) {
										if (err) {
											throw err;
											sendAdminMail(err)
										}
										if (saved) {
											models.brands.find({}, function(err, resultBrends) {
												if (err) {
													throw err;
													sendAdminMail(err)
												}
												'use strict';
												var brands;
												var j;
												var thisBrands;
												var newBrand = true;
												if (resultBrends) {
													brands = resultBrends[0];
													thisBrands = brands[productDb.kind]
													for (j = 0; j < thisBrands.length; j++) {
														if (thisBrands[j] === productDb.brand) {
															newBrand = false;
															break;
														}
													}
													if (newBrand) {
														thisBrands.push(productDb.brand)
														brands.save(function(err, saved) {
															if (err) {
																throw err;
																sendAdminMail(err)
															}
															if (saved) {
																start++
																if (start == end) {
																	res.send({success:true})
																}
																else {
																	addNewProduct()
																}
															}
														})
													}
													else {
														start++
														if (start == end) {
															res.send({success:true})
														}
														else {
															addNewProduct()
														}
													}
												}
											})
										}
									})
								})
							})
						}
					})
				}
				if (counterAddImg) {
					addImg()
				}	
			}) 
		})
	}
	if (start != end) {
		addNewProduct()
	}
}

module.exports = {
	'saveRandomProducts' : saveRandomProducts
}