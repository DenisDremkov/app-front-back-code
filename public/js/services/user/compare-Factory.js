
angular.module('ProductsCompareCtrl')

.factory('productsCompareFactory', ['$http',  function($http) {
	return {
		selectMinMaxValues : function(newValue) {
			'use strict';
			var arr;
			var i;
			var prop;
			var max;
			var min;
			var allProp = {};
			var arrMinMax = {};
			var resultSort;
			arr = newValue;
			for (prop in arr[0]) {
				if (typeof arr[0][prop] === 'number' && prop !== '__v' ) {
					allProp[prop] = [];
				}
			}
			allProp['raiting'] = [];
			for (i = 0; i < arr.length; i++) {
				for(prop in allProp) {
					if (prop === 'raiting') {
						allProp[prop].push(arr[i][prop].val)
					}
					else {
						allProp[prop].push(arr[i][prop])	
					}
				}
			}
			function compareNumeric(a, b) {
				if (a > b) return 1;
				if (a < b) return -1;
			}
			for (prop in allProp) {
				resultSort = allProp[prop].sort(compareNumeric);
				arrMinMax[prop] = {};
				arrMinMax[prop]['min'] = resultSort[0];
				arrMinMax[prop]['max'] = resultSort[resultSort.length-1];
			}
			return arrMinMax;
		},
		setClass : function(option, value, scope) {
			if (scope.arrCompareProducts.length > 1 ) {
				switch (value) {
				case  scope.valueMinMax[option]['min']:
					if (option === "price") {
						return 'max_value'
					}
					else {
						return 'min_value'
					}
					break;
				case  scope.valueMinMax[option]['max']:
					if (option === "price") {
						return 'min_value'
					}
					else {
						return 'max_value'
					}
					break;
				default :
					return ''
					break;
				}
			}
			else {
				return ''
			}
		}	
	}
}]);
