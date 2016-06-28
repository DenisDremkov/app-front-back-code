
angular.module('ProductsInfoCtrl')

.factory('productsInfoFactory', ['$http', '$rootScope', '$timeout',  function($http, $rootScope, $timeout) {	
	
	function prettyDate(milisec) {
		'use strict';
		var	month,
				date,
				hours,
				minutes,
				prettyFullDate,
				fullDate;
		
		function prettyItem(value) {
			'use strict';
			var prettyValue;
			if (String(value).length === 1) {
				prettyValue = "0" + String(value);
			}
			else {
				prettyValue = value
			}
			return String(prettyValue);
		}
		fullDate = new Date(milisec);
		month = prettyItem(fullDate.getMonth() + 1 );
		date = prettyItem(fullDate.getDate())
		hours = prettyItem(fullDate.getHours())
		minutes = prettyItem(fullDate.getMinutes())		
		prettyFullDate = hours + ":" + minutes + ", " + date + "-" + month + "-" + String(fullDate.getFullYear());	
		return prettyFullDate;
	};

	return {
		prettyDatePublic : function(milliseconds) {
			return prettyDate(milliseconds)
		},
		setComment : function(scope, url) {
			'use strict';
			var 	i,
					commentDate,
					newComment = {},
					milisec;
			if ($rootScope.rootUser.rights && $rootScope.rootUser.rights === 'user') {
				if (scope.userCommentLength == 0) {
					$rootScope.$emit('showWebAssistant', "Введите сообщение"); 
				}
				else {
					if (scope.userCommentLength > 300) {
						$rootScope.$emit('showWebAssistant', "Вы превысили максимально допустимое кол-во символов"); 
					}
					else {
						milisec = new Date().getTime();
						$rootScope.$emit('startSpinner');
						$http.post(url, {
							'kindProduct' : scope.currentProduct.kind,
							'idProduct' : scope.currentProduct._id,
							'idComments' : scope.currentProduct.comments.idComments,
							'milisec' : milisec,
							'text' : scope.userComment,
							'user' : $rootScope.rootUser.username,
							'idCommentsUser' : $rootScope.rootUser.commentsId
						})
						.success(function(doc) {
							if (doc.success) {
								newComment.user = $rootScope.rootUser.username;
								newComment.date = prettyDate(milisec);
								newComment.text = scope.userComment;
								scope.productComments.push(newComment);
								$rootScope.$emit('showWebAssistant', "комментарий добавлен"); 
								$rootScope.$emit('stopSpinner')
							}
							else {
								$rootScope.$emit('stopSpinner')
								$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже"); 
							}
						})
						.error(function(err) {
							$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже"); 
							$rootScope.$emit('stopSpinner')
						})	
					}	
				}	
			}
			else {
				$rootScope.$emit('showWebAssistant', "комментарии могут оставлять только зарегестрированные пользователи"); 
			}
		}, 
		showInfo : function(scope, product) {
			'use strict';
			var 	arrCommentsLength,
					arrImgCarousel,
					i,
					objImg,
					prop,
					stringProp;
			//comments
			$rootScope.$emit('startSpinner')
			$http.post(scope.data.url.getComments, {
				"idComments" : product.comments.idComments,
				"db" : product.kind})
				.success(function(doc) {
					arrCommentsLength = doc.length;
					for (i = 0; i < arrCommentsLength; i++) {
						doc[i].date = prettyDate(doc[i].dateMilisec)
					}
					
					scope.productComments = doc;
					//carousel values
					arrImgCarousel = [];
					for (prop in product.img) {
						stringProp = JSON.stringify(prop)
						if ( (stringProp !== '"small"')  &&  (stringProp !== '"big"') ) {
							objImg = {};
							objImg.name = prop;
							objImg.fileName = product.img[prop]
							arrImgCarousel.push(objImg)
						}
						
					}
					scope.currProductImgCarousel = arrImgCarousel;
					scope.currentProduct = product;
					$rootScope.$emit('stopSpinner')
				})
				.error(function(err) {
					console.log(err)
				})	
		}
	}
}]);
