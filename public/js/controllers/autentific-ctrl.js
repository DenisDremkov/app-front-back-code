

angular.module('AutentificCtrl',[])

.controller('autentificCtrl', ['$scope', 'autentificFactory', 'Upload', '$rootScope', 'socket', 'mainUrl',  function($scope, autentificFactory, Upload, $rootScope, socket, mainUrl) {
	'use strict';
	// autentificated user
	$rootScope.rootUser = {};	
	// login and registr user
	$scope.user = {
		"username" : undefined,
		"password" : undefined,
		"password_" : undefined,
		"email" : 'eee@eee.ua',
		"session" : false
	};
	//image avatar
	$scope.avatarImg = undefined;
	$scope.pathAvatar = undefined;
	//user basket
	$scope.showUserBasket = false;
	$scope.summProductInBasket = undefined;
	//active items
	$scope.activItems = {
		"loginMain" : false,
		"private_account" : true,
		"loginForm" : true,
		"registrForm" : false,
		"tab_login" : true,
		"tab_registr" : false
	};
	//url
	$scope.url = {
		"session" : mainUrl.url +"/inspectSession",
		"login" : mainUrl.url +"/login",
		"registr" : mainUrl.url +"/registr",
		"logOut" : mainUrl.url +"/logOut",
		"postAvatar" : mainUrl.url +"/postAvatar",
		"postBasket" :mainUrl.url +"/postProductBasket",
		"deleteBasket" : mainUrl.url +"/deleteProductBasket"
	};
	
	autentificFactory.inspectSession($scope);

	$scope.login = function(action) {
		autentificFactory.login($scope)};

	$scope.logOut = function() {
		autentificFactory.logOut($scope)};

	$scope.toggleTabs = function(nameTab) {
		autentificFactory.toggleTabs(nameTab, $scope)};

	$scope.showLoginForm = function() {
		$scope.activItems.loginMain = true;};

	$scope.closeLoginForm = function() {
		$scope.activItems.loginMain = false;};	

	$scope.registr = function() {
		autentificFactory.registr($scope, Upload)};

	$scope.deleteProductAutentBasket = function(id) {
		$rootScope.$emit('deleteProductEmitFromBasket', id)};
	
		
	$scope.toggleUserBasket = function() {
		if ($rootScope.rootUser.basket.length == 0) { $rootScope.$emit('showWebAssistant', "Ваша корзина пуста")}
		else {$scope.showUserBasket = !$scope.showUserBasket}}
	$scope.$watch('rootUser.basket.length', function(newVal, oldVal) {
		var summ;
		var i;
		if (newVal || newVal == 0) {
			summ = 0;
			for (i = 0; i < $scope.rootUser.basket.length; i++) {
				summ += $scope.rootUser.basket[i].price
			}
			$scope.summProductInBasket = summ;
		}})
	socket.on('inspectAdminInSession', function(e, msg) {
		if ($rootScope.rootUser.rights !== 'admin') {
			autentificFactory.messageAdminLogin($scope, 'АДМИНИСТРАТОР ЗАШЕЛ В СЕТЬ!!!, </br> администратор может удалять товары, пользователей, </br> поэтому, во избежание некорректного отображения информации у вас на странице, </br>  рекомендуем Вам зайти позже')
		}
	})
}]);


