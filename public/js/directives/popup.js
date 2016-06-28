angular.module('appStore')

.directive('popupImg', function() {
	return {
		template : "<a href='#' class='popup_img_link' ng-click = 'getPopupImg(goods, $event)' ng-mouseenter='scaleImg()' ng-mouseleave='scaleImg()'>\
							<i class='fa fa-search-plus'></i>\
						</a>",
		scope: true,
		link: function (scope, element, attributes) {
			'use strict';
			scope.getPopupImg = function(goods, event) {
				event.preventDefault();
				var 	name,
						img,
						close,
						closeElem,
						elemLink,
						imgWrap,
						url;
				//create image element
				url = '/img/products/big/' + attributes.kindProduct + '/' + attributes.idImg;
				img = angular.element('<img>');
				img.attr("src", url);
				img.addClass('popup_inner_img');
				//create image element wrapper
				imgWrap = angular.element('<div>');
				imgWrap.addClass('popup_inner_wrap');
				//create close element
				close = angular.element('<div id="close_img_popup" class = "popup_img_close" ng-click = "closePopup()"></div>');
				close.append(angular.element('<i class="fa fa-times" aria-hidden="true"></i>'))
				close.addClass('btn_close');
				//show popup
				imgWrap.append(img);
				element.append(imgWrap);
				element.append(close);
				element.addClass('popup_img');
				$('body').css("overflow","hidden");
				// add eventlistener on btn_close after append elements
				closeElem = document.getElementById('close_img_popup');
				closeElem.addEventListener('click', function() {
					$('body').css("overflow","visible");
					element.removeClass('popup_img');
					img.remove();
					imgWrap.remove();
					close.remove();
				})
			};
		}
	}
})