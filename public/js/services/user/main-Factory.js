
angular.module('ProductsMainCtrl')

.factory('productsMainFactory', ['$http', '$rootScope', '$timeout',  function($http, $rootScope, $timeout) {
	'use strict';
	function showCarouselSale(data) {
		var currProducts = data.ALL_PRODUCTS[data.currentTypeProducts];
		var i;
		var productsWithSale = [];
		for (i = 0; i < currProducts.length; i++) {
			if (currProducts[i].sale.bool) {
				productsWithSale.push(currProducts[i])
			}
		}
		data.carouselView = productsWithSale;
		data.carouselShow = true;
	}
	return {
		getData : function(typeProducts, scope, event) {
			scope.data.activeItems.currentProducts = typeProducts;
			scope.data.currentTypeProducts = typeProducts;
			if (event) {event.preventDefault();}
			scope.$emit('startSpinner');
			$http.post(scope.data.url.getDb, {'kindProduct' : typeProducts})
				.success(function(res) {
					'use strict'
					var	products;
					products = res[scope.data.currentTypeProducts];
					scope.data.ALL_PRODUCTS[scope.data.currentTypeProducts] = products;
					scope.data.currentProducts = products;
					scope.data.all_brends = res.allBrends[0];
					scope.data.MIN_AND_MAX_VALUES = res.valMinMax[0];
					//lastPageInPagination
					scope.$watch('data.amountPages', function(newVal) {
						scope.$broadcast('changePagination', newVal)
					})
					scope.data.amountPages = Math.ceil((products.length)/(scope.data.numberProductsView));
					//create start view
					scope.view_mainList = products.slice(0, scope.data.numberProductsView);
					showCarouselSale(scope.data)
					scope.$emit('stopSpinner');
					$('#main_bg_spinner').fadeOut(300)
					$rootScope.$emit('setCtrlDescr', 'user-products')
					if (scope.data.firstLoadDb) {
						if ($rootScope.rootUser && $rootScope.rootUser.username) {
							$rootScope.$emit('showWebAssistant', "Здраствуйте! " + $rootScope.rootUser.username);
						}
						else {
							$rootScope.$emit('showWebAssistant', "Здраствуйте! Если вы не авторизованы - ваши возможности ограничены!");
						}
						scope.data.firstLoadDb = false;
					}
					if (products.length == 0) {
						$timeout(function() {
							$rootScope.$emit('showWebAssistant', "БД - '" + typeProducts  + "' пустая, зайдите под администратором и добавьте бд");
						},6000)
						
					}				
				})
				.error(function(err) {console.log(err)});	
		},
		toggleBar : function(typeBar, scope) {
			'use strict';
			scope.data.url.bar = "../../template/products/products-" + typeBar + ".html"
			scope.data.activeItems.productsBar = typeBar;
			if(typeBar === 'info')	{
				scope.data.activeItems.mainList = false;

			}
			else {
				scope.data.activeItems.mainList = true;
				if(typeBar === 'search')	{
					scope.view_mainList = undefined;
				}
				else {
					scope.data.activeItems.mainList = true;
					scope.view_mainList = scope.data.ALL_PRODUCTS[scope.data.currentTypeProducts].slice( 0, scope.data.numberProductsView );
				}
			} 	
		},
		createView : function(scope, page) {
			'use strict';
			var i;
			var thisProduct;
			var pushBoolean;
			var arrProducts;
			var arrProductsLength;
			var type;
			var brands;
			var userSliderValues;
			var arrSliders;
			var arrSlidersLength;
			var arrView;
			var sale;
			var listProductsStartPosition;
			var listProductsEndPosition;
			var viewProductsWithPagination;

			if (scope.data.activeItems.productsBar === "search") {
				arrProducts = scope.data.currentProducts;
				arrProductsLength  = arrProducts.length;
				type = scope.data.currentTypeProducts;
				brands = scope.data.brendsThisProducts;
				userSliderValues = {};
				arrSliders = scope.data.slidersView;
				arrSlidersLength = arrSliders.length;
				arrView = [];
				sale = scope.data.productsWithSale;
				function compareValuesSlider(userValSlider, arr, product) {	
					'use strict';
					var i;
					var userValues;
					var productValue;
					var prop;				
					top:
					for (prop in userValSlider) {
						userValues = userValSlider[prop];
						productValue = product[prop];
						//raiting (because reiting - object)
						if ((typeof product[prop]) === "object") {
							productValue = product[prop].val;
						}
						else {
							productValue = product[prop]
						}
						if (	(productValue >= userValues.min)  && 	(productValue <= userValues.max)	 ) {
							continue top;
						}
						else {
							return false
						}
					}
					return true;	
				};
				for ( i = 0; i < arrSlidersLength; i++) {
					userSliderValues[arrSliders[i].nameSlider] = {};
					userSliderValues[arrSliders[i].nameSlider]['min'] = arrSliders[i].min;
					userSliderValues[arrSliders[i].nameSlider]['max'] = arrSliders[i].max;  
				}
				top:
				for (i = 0; i < arrProductsLength; i++) {
					thisProduct = arrProducts[i];
					// test brand
					if (brands[thisProduct.brand]) {
						if (sale) {
							// test sale
							if (thisProduct.sale.bool) {
								//test sliders value
								pushBoolean = compareValuesSlider(userSliderValues, arrView, thisProduct)
							}
							else {
								continue top;
							}
						}
						else {
							//test sliders value
							pushBoolean = compareValuesSlider(userSliderValues, arrView, thisProduct)
						}
						if (pushBoolean) {	
							arrView.push(thisProduct) 
						}
					}	
				}
				scope.view_mainList = arrView;
			}
			else {
				listProductsStartPosition = (page - 1) * scope.data.numberProductsView;
				listProductsEndPosition = listProductsStartPosition + scope.data.numberProductsView;
				arrProducts = scope.data.ALL_PRODUCTS[scope.data.currentTypeProducts];
				scope.view_mainList = arrProducts.slice(listProductsStartPosition, listProductsEndPosition)
			} 
		},
		addCompare : function(product, scope) {
			'use strict';
			var	i,
					index,
					arr;
			arr = scope.data.compareProducts;
			if (arr.length == 0) {
				arr.push(product);
				scope.data.checkedButtonsCompare[product._id] = true;
			}
			else {
				for (i = 0; i < arr.length; i++) {
					if (arr[i]._id === product._id) {
						index = i;
						
						break;
					}
				}
				if (index || index == 0) {
					arr.splice(index,1);
					delete scope.data.checkedButtonsCompare[product._id];
				}
				else {
					if (arr.length > 8) {
						$rootScope.$emit('showWebAssistant', "Не более 9 товаров")
						// message 
					}
					else {
						arr.push(product);
						scope.data.checkedButtonsCompare[product._id] = true;
					}
				}
			}
		},
		toggleProductBasket : function(product, scope) {
			'use strict';
			var objBasketId = scope.data.checkedButtonsBasket;
			var i;
			var userBasket;
			var newProductBasket;
			if (objBasketId[product._id]) {
				$http.post(scope.data.url.deleteBasket, {
						'userId' : $rootScope.rootUser._id, 
						'productId' : product._id})
						.success(function(doc) {
							if (doc.success) {
								delete objBasketId[product._id]; //uncheck btn
								userBasket = $rootScope.rootUser.basket;
								for (i = 0; i < userBasket.length; i++) {
									if (userBasket[i]._id === product._id) {
										userBasket.splice(i, 1)
										break;
									}
								}
							}
							else {
								$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
							}
						})
						.error(function(err) {
							 $rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
						})
			}
			else {
				newProductBasket = {};
				newProductBasket.kind = product.kind;
				newProductBasket._id = product._id;
				newProductBasket.brand = product.brand;
				newProductBasket.model = product.model;
				newProductBasket.price = product.price;
				newProductBasket.imgSmall = product.img.small;
				$http.post(scope.data.url.setBasket, {'userId' : $rootScope.rootUser._id, 'product' : newProductBasket})
					.success(function(doc) {
						if (doc.success) {
							objBasketId[product._id] = true; // check btn
							$rootScope.rootUser.basket.push(newProductBasket)
						}
						else {
							$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
						}
					})
					.error(function(err) {
						 $rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
					})
			}
			
		}
	}
}]);