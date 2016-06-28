
angular.module('appStore')

.factory('socket', ['socketFactory',  function(socketFactory) {
	'use strict';
	return socketFactory()
}]);
