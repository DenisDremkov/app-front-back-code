angular.module('AdminMainCtrl',[])

.controller('adminMainCtrl', ['$scope', '$http', 'mainUrl', function($scope,  $http, mainUrl) {
	'use strict';
	$scope.currentTab = 'products';
	$scope.db = {
		products : undefined,
		users : undefined,
		analitika: undefined
	};
	$scope.url = mainUrl.url + '/get';
	$scope.currentTemplate = 'template/admin/admin-products.html';
	$scope.toggleTabs = function(typeDb, event) {
		event.preventDefault();
		switch (typeDb) {
			case "products":
				$scope.currentTab = 'products';
				$scope.currentTemplate = 'template/admin/admin-products.html';
				break;
			case "users":
				$scope.currentTab = 'users';
				$scope.currentTemplate = 'template/admin/admin-users.html';
				break;
			case "analitika":
				$scope.currentTab = 'analitika';
				$scope.currentTemplate = 'template/admin/admin-analitika.html';
				break;
	}}}]);


