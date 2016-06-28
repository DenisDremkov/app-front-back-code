angular.module('AdminMainCtrl')

.directive('inspectAdmin', function($rootScope){
	return{
		restrict: 'A',
		priority: 100000,
		scope: false,
		link: function(){
		},
		compile:  function(element, attr, linker){
			if ($rootScope.rootUser.rights !== 'admin') {
				element.children().remove();
				element.remove();
			}
		}
	}
});