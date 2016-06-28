
angular.module('appStore')
.directive("pagination", function () {
	return {
		templateUrl: "../../template/directives/directive-pagination.html",
		scope: true,
		link: function (scope, element, attributes) {
			'use strict';
			var	arrPagLength,
					arrPag,
					i,
					pagLastValue;
			scope.$on('changePagination', function(e, newPagLastVal) {
				pagLastValue = newPagLastVal;
				if (scope.pag) {
					delete scope.pag;
				}
				scope.pag = {
					first : {val : 1, current : '', disabled : 'disabled_pag'},
					prev : {disabled : 'disabled_pag'},
					prevDot : {disabled : 'disabled_pag'},
					p1 : {val : 1, current : 'current_pag', disabled : ''},
					p2 : {val : 2, current : '', disabled : ''},
					p3 : {val : 3, current : '', disabled : ''},
					p4 : {val : 4, current : '', disabled : ''},
					p5 : {val : 5, current : '', disabled : ''},
					nextDot : {disabled : ''},
					next : {disabled : ''},
					last :  {val : undefined, current : '', disabled : ''}
				};
				scope.pag.last.val = newPagLastVal;
				arrPag = [scope.pag.p1, scope.pag.p2, scope.pag.p3, scope.pag.p4, scope.pag.p5];
				arrPagLength = arrPag.length;
				if (pagLastValue <= 5) {
					scope.pag.last.disabled = 'disabled_pag disabled_pag_';
					scope.pag.next.disabled = 'disabled_pag disabled_pag_';
					scope.pag.nextDot.disabled = 'disabled_pag disabled_pag_';
					for (i = 0; i < arrPagLength; i++) {
						if (arrPag[i].val > pagLastValue) {
							arrPag[i].disabled = 'disabled_pag disabled_pag_';
						}
					}
				};
			});
			function clearCurrentItems() {
				scope.pag.first.current = '';
				scope.pag.p1.current = '';
				scope.pag.p2.current = '';
				scope.pag.p3.current = '';
				scope.pag.p4.current = '';
				scope.pag.p5.current = '';
				scope.pag.last.current = '';
			};
			scope.changePag = function(next_prev, event) {
				'use strict'
				event.preventDefault();
				var 	i,
						newPage,
						i_last = {bool : false, val : undefined};			
				switch (next_prev) {
					case '+':
						clearCurrentItems();
						scope.pag.first.disabled = '';
						scope.pag.prev.disabled = '';
						scope.pag.prevDot.disabled = '';
						for (i = 0; i < arrPagLength; i++) {
							arrPag[i].val += 5;
							if (arrPag[i].val > pagLastValue) {
								arrPag[i].disabled = 'disabled_pag';						
							};
							if (arrPag[2].val <= pagLastValue) {
								newPage = arrPag[2].val;
								arrPag[2].current = 'current_pag';
							}
							if (arrPag[i].val == pagLastValue) {
								i_last.bool = true;
								i_last.val = i; // if i = 0;
							}
							if (arrPag[i].val === pagLastValue) {
								scope.pag.last.disabled = 'disabled_pag';
								scope.pag.next.disabled = 'disabled_pag';
								scope.pag.nextDot.disabled = 'disabled_pag';
							}; 
						}
						if (i_last.bool) {
							clearCurrentItems();
							newPage = arrPag[i_last.val].val;
							arrPag[i_last.val].current = 'current_pag';
							scope.$emit('newPageFromPagination', newPage);
						} 
						else {
							scope.$emit('newPageFromPagination', newPage);
						}						
					break;
					case '-':
						clearCurrentItems();
						scope.pag.last.disabled = '';
						scope.pag.next.disabled = '';
						scope.pag.nextDot.disabled = '';
						for (i = 0; i < arrPagLength; i++) {
							arrPag[i].disabled = '';
							arrPag[i].val -= 5;
							if (arrPag[0].val == 1) {
								scope.pag.first.disabled = 'disabled_pag';
								scope.pag.prev.disabled = 'disabled_pag';
								scope.pag.prevDot.disabled = 'disabled_pag';
							}
							if (arrPag[0].val == 1) {
								newPage = arrPag[0].val;
								arrPag[0].current = 'current_pag';
							}
							else {
								newPage = arrPag[2].val;
								arrPag[2].current = 'current_pag';
							}								
						}
						scope.$emit('newPageFromPagination', newPage);
					break;
				}	
			};
			scope.currentPage = function(pageNumber, page) {
				'use strict'
				scope.$emit('newPageFromPagination', pageNumber);
				clearCurrentItems();
				scope.pag[page].current = 'current_pag';
			}		
		}
	}
})
