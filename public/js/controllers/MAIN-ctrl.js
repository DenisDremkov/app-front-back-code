

angular.module('MainCtrl',[])

.controller('mainCtrl', ['$scope',  '$rootScope', '$timeout',  'socket', '$interval', function($scope, $rootScope, $timeout, socket, $interval) {
	'use strict';
		//WEB ASSISTANT
	//====================================================
	$scope.webAssistantShow = false;
	$scope.webAssistantChange = 0;
	$scope.webAssistantMessage = undefined;
	$rootScope.$on('showWebAssistant', function(e, message) {
		$scope.webAssistantMessage = message;
		$scope.webAssistantChange++;
	})
		//SPINNER BG
	//====================================================
	$rootScope.mainSpinner = false;
	$rootScope.$on('startSpinner', function() {
		$rootScope.mainSpinner = true;
	})
	$rootScope.$on('stopSpinner', function() {
		$rootScope.mainSpinner = false;
	})
		//CONTROLLER DESCRIPTION
	//=====================================================
	$rootScope.ctrlDescr = false;
	$rootScope.ctrlDescrName = false;
	$rootScope.ctrlDescrTemplate = false;
	$rootScope.$on('setCtrlDescr', function(e, nameCtrl) {
		switch (nameCtrl) {
			case "user-products": 
				$rootScope.ctrlDescrName = "user-products";
				$rootScope.ctrlDescrTemplate = "../../template/descriptionCtls/descript-user-products.html"
				break;
			case "admin-products": 
				$rootScope.ctrlDescrName = "admin-products";
				$rootScope.ctrlDescrTemplate = "../../template/descriptionCtls/descript-admin-products.html"
				break;
			case "admin-users": 
				$rootScope.ctrlDescrName = "admin-users";
				$rootScope.ctrlDescrTemplate = "../../template/descriptionCtls/descript-admin-users.html"
				break;
			case "admin-analitika": 
				$rootScope.ctrlDescrName = "admin-analitika";
				$rootScope.ctrlDescrTemplate = "../../template/descriptionCtls/descript-admin-analitika.html"
				break;
		}
	//then page ready scale button description for started page (user products)
	$('#btn_descriptionController').addClass('btn_descripCtrl_active');
	$timeout(function() {
		$('#btn_descriptionController').removeClass('btn_descripCtrl_active');
	}, 1500)
	})
	//click on button "description controller"
	$scope.showDescrCtrl = function() {
		var height = Math.floor(($(window).height())*0.25)
		$('body').css('padding-bottom', height + 'px')
		$('#btn_descriptionController').css('bottom', height + 'px')
		$rootScope.ctrlDescr = true;
	}
	$scope.hideDescrCtrl =  function() {
		var height = Math.floor(($(window).height())*0.25)
		$('body').css('padding-bottom', 0)
		$('#btn_descriptionController').css('bottom', 5)
		$rootScope.ctrlDescr = false;
	}
	
}]);
