
angular.module('AdminAnalitikaCtrl')

.factory('adminAnalitikaFactory', ['$http', '$rootScope',  function($http, $rootScope) {

	return {
		getDbYear : function(scope) {
			'use strict';
			var arrMonthJSON;
			var arrMonth = [];
			var i;
			var month;
			var maxValueVisits;
			var widthPercent;
			var arrNameMonth = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
			$rootScope.$emit('startSpinner')
			$http.get(scope.url.getDb)
				.success(function(result) {
					if ( result.error ) {
						$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже")
					}
					else {
						arrMonthJSON = result.arhiv[0].months
						//parse json
						for (i = 0; i < arrMonthJSON.length; i++) {
							month = JSON.parse(arrMonthJSON[i])
							arrMonth.push(month)
						}
						arrMonth.push(result.presentMonth[0])
						// set name month and find maximum value visits
						maxValueVisits = 0
						for (i = 0; i < arrMonth.length; i++) {
							arrMonth[i].nameMonth = arrNameMonth[i];
							if (arrMonth[i].visits > maxValueVisits)
							maxValueVisits = arrMonth[i].visits;
						}
						scope.maximumValueVisits = maxValueVisits;
						scope.dbYear = arrMonth;
						scope.numberMonth = arrMonth.length;
						// grafic - responsive, can use 12 items(month) 
						widthPercent = (100 / scope.numberMonth).toFixed(1) - 0.1
						scope.widthGraficItems.width = widthPercent + "%" ;
						$rootScope.$emit('stopSpinner')
						$rootScope.$emit('setCtrlDescr', 'admin-analitika')
					}	
				})
				.error(function(err) {
					$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
				})
		},
		showDetails : function(indexMonth, scope) {
			'use strict';
			var currMonth = scope.dbYear[indexMonth];
			var currMonthDays = currMonth.days;
			var currMonthDaysLength = currMonthDays.length;
			var i;
			var maxVisits = 0;
			var widthPercent;
			//find maximum number visits that set height for items
			for (i = 0; i < currMonthDaysLength; i++) {
				if (currMonthDays[i].visits > maxVisits) {
					maxVisits = currMonthDays[i].visits
					currMonthDays[i].day;
				}
			}
			scope.currentMonth = currMonth;
			scope.maximumValueVisitsMonth = maxVisits;
			scope.lineIndent.top = maxVisits;
			scope.lineIndent.middle = Math.ceil(maxVisits*0.6).toFixed(0);
			scope.lineIndent.bottom = Math.ceil(maxVisits*0.3).toFixed(0);
			widthPercent = (100 / currMonthDaysLength).toFixed(1) - 0.1
			scope.currentMonthDaysWidth.width = widthPercent + "%" ;
			scope.currentMonthDays = currMonthDays;
			for (i = 0; i < currMonthDays.length; i++) {
				scope.bottom.visits[i] =     { 'bottom' : Math.ceil( (currMonthDays[i].visits     / scope.maximumValueVisitsMonth) * 300) + "px"};  
				scope.bottom.uniqVisits[i] = { 'bottom' : Math.ceil( (currMonthDays[i].uniqVisits / scope.maximumValueVisitsMonth) * 300) + "px"};
			}
			scope.activeView.currentMonth = true;
			scope.activeView.arhivMonth = false;
		}			
	}
}]);