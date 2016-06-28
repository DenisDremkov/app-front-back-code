angular.module('appStore')


.directive('webAssistant',  ['$timeout', function($timeout) {
	return {
		template : "<div>\
							<img  class='assistant_img' src='img/assistant.png' alt='assistant'>\
							<p  class = 'assistant_message'>{{webAssistantMessage}}</p>\
						</div>",
		scope: true,
		link: function (scope, element, attributes) {
			scope.$watch('webAssistantChange', function(newVal, oldVal) {
				var imgElem = element.find('img');
				var messageElem = element.find('p');
				if (newVal && newVal != oldVal) {
					element.css('display' , 'block')
					$timeout(function() {
						imgElem.css('opacity', 1)
						$timeout(function() {
							messageElem.css('opacity', 1)
						},500)
					},500)
					$timeout(function() {
						element.css('display' ,'none')
						imgElem.css('opacity', 0)
						messageElem.css('opacity', 0)
					},5000)
				}
			})
		}
	}
}])