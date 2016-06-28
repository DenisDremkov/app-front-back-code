// angular.module('GoodsCtrl')

angular.module('appStore')

.directive('starReiting',[ '$http', function($http) {
	return {
		templateUrl : "../../template/directives/directive-starReiting.html",
		scope: true,
		link: function (scope, element, attributes) {
			'use strict';
			scope.getClass = function(thisStar) {
				var	reitGoods = Number(attributes.setReiting),
						delta;
				if (reitGoods>=thisStar) {
					return 'fa fa-star';
				}
				else {
					delta = thisStar - reitGoods;					
					if ( delta >= 0.3  &&  delta <=0.7) {
						return 'fa fa-star-half-o';
					} 
					else {
						if (delta < 0.3) {
							return 'fa fa-star';
						}
						if (delta > 0.7) {
							return 'fa fa-star-o';
						}	
					}
				}
			};
			scope.starHover = function(hoverEvent, event, index) {
				var	elem = event.currentTarget,
						icons = $(elem).parent().parent().find('i'),
						iconsLength = icons.length;
				switch (hoverEvent) {
					case 'enter' :
						for (var i = 0; i < iconsLength; i++) {
							if (i < index) {
								$(icons[i]).addClass('fa_star_hover')
							}
						}
					break;
					case 'leave' :
						$(icons).removeClass('fa_star_hover')
					break;
				}
			};
			// user can set the rating only one
			scope.setReiting = function(event, index) {
				'use strict'
				event.preventDefault();
				var 	elem = event.currentTarget,
					 	icons = $(elem).parent().parent().find('i'),
					 	iconsLength = icons.length,
						idProduct = attributes.idProduct,
						kindProduct = attributes.kindProduct,
						idUser = scope.rootUser._id, // (rootscope)
						i,
						url = scope.data.url.setReiting;
				if (idUser && scope.rootUser.rights === "user") {
					if (scope.rootUser.objRaiting[idProduct]) { // test in rootscope
						scope.$emit('showWebAssistant', "Вы уже рейтинговали данный товар ранее");
					}
					else {
						$http.post(url, {
							'idUser' : idUser, 
							'idProduct' : idProduct, 
							'kindProduct' : kindProduct, 
							'raiting' : index})
							.success(function(doc) {
								if (doc.success) {
									scope.rootUser.objRaiting[idProduct] = true;
									scope.$emit('showWebAssistant', "Рейтинг установлен, переустановить рейтинг данному товару вы не сможете");
									for (i = 0; i < iconsLength; i++) {
										if (i < index) { 
											$(icons[i]).addClass('fa_star_click')
										}
										else {
											$(icons[i]).removeClass('fa_star_click')
										}
									}
								}
								else {
									scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
								}
							})
							.error(function(err) {
								scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
							})
					}	
				}
				else {
					scope.$emit('showWebAssistant', "рейтинговать могут только зарегестрированные пользователи");
				}
			}
		}
	}
}])