angular.module('AdminAnalitikaCtrl',[])

.controller('adminAnalitikaCtrl', ['$scope', '$http', 'adminAnalitikaFactory', '$rootScope', 'mainUrl', function($scope,  $http, adminAnalitikaFactory, $rootScope, mainUrl) {
	'use strict';

	$scope.url = {	getDb : mainUrl.url + '/getAnalitikaDb' }
	$scope.activeView = { 'arhivMonth' : true,	'currentMonth' : false }
	
	//========================ALL MONTH THIS YEAR + PRESENT MONTH==========================
	$scope.dbYear = undefined;
	$scope.numberMonth = undefined;
	$scope.widthGraficItems = { 'width' : undefined	};
	$scope.maximumValueVisits = undefined;
	
	//================================CURRENT MONTH (DETAILS)=============================
	$scope.currentMonth = undefined;
	$scope.currentMonthDays = undefined;
	$scope.currentMonthDaysWidth = { 'width' : undefined	};
	//items position in grafic
	$scope.bottom = {
		'visits' : {},
		'uniqVisits' : {} }
	$scope.daysInCurrentMonth = undefined;
	$scope.maximumValueVisitsMonth = undefined;
	// scale date in current month grafic
	$scope.activeItemGrafic = {'date' : undefined}
	// gorizontal line - grafic current month
	$scope.lineIndent = {
		'top' : undefined,
		'middle' : undefined,
		'bottom' : undefined	}

	adminAnalitikaFactory.getDbYear($scope)
	
	$scope.showDetails = function(indexMonth) { 
		adminAnalitikaFactory.showDetails(indexMonth, $scope) }
	
	$scope.hoverItemGrafic = function(index, event) {
		if (event === 'over') {	$scope.activeItemGrafic.date = index }
		else { $scope.activeItemGrafic.date = undefined	}}
	
	$scope.toggleView = function(nameView) {
		if (nameView === 'currentMonth') {
			$scope.activeView.currentMonth = true;
			$scope.activeView.arhivMonth = false;}
		else {
			$scope.activeView.currentMonth = false;
			$scope.activeView.arhivMonth = true;}}
	
	$scope.$watch('dbYear', function(newVal) {
		if (newVal) {
			$scope.setHeightItemGraficArhiv = function(indexMonth, typeVisits) {
				var dbVisits = $scope.dbYear[indexMonth][typeVisits];
				var viewHeight = String((300 * dbVisits) / $scope.maximumValueVisits) + 'px';
				return {	'height' : viewHeight }	}
		}
	})	
}]);

