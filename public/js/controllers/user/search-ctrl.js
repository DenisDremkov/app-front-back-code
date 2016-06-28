
angular.module('ProductsSearchCtrl',[])

.controller('productsSearchCtrl', ['$scope', 'productsSearchFactory',  function($scope, productsSearchFactory) {
		$scope.showAllBrends = false;
		$scope.orderByReverse = {
			'price' : true,
			'raiting' : true
		}
		$scope.$on('createNewSliders', function() {
			productsSearchFactory.createNewSliders($scope, $scope.data)
		});
		$scope.$on('createNewCheckox', function() {
			var arrBrends = $scope.data.all_brends[$scope.data.currentTypeProducts]
			$scope.data.brendsThisProducts = productsSearchFactory.createNewCheckBox(arrBrends, $scope)
		});				
		$scope.toggleCheckBox = function(brend) {
			$scope.data.brendsThisProducts[brend] = !$scope.data.brendsThisProducts[brend];
			$scope.$emit('newValuesCheckbox');
		};
		$scope.toggleAllBrends = function() {
			var arrBrends = $scope.data.all_brends[$scope.data.currentTypeProducts]
			$scope.data.brendsThisProducts = productsSearchFactory.createNewCheckBox(arrBrends, $scope);
			$scope.$emit('newValuesCheckbox');
		}
		$scope.toggleSale = function() {
			$scope.data.productsWithSale = !$scope.data.productsWithSale;
			productsSearchFactory.testEmptyBrends($scope)
			$scope.$emit('toggleSale');
		}
		$scope.testEmptyBrends = function() {
			productsSearchFactory.testEmptyBrends($scope)
		}
		$scope.orderBy = function(property) {
			var price = $('#orderBySearchPrice');
			var raiting =  $('#orderBySearchRaiting');
			if (property === 'price') {
				price.addClass('orderBy_active');
				raiting.removeClass('orderBy_active')
				if ($scope.orderByReverse.price) {
					$scope.data.orderByListFromSearch.nameProp = 'price'
					$scope.orderByReverse.price = false;
					price.find('i').addClass('toggleOrderByParams')
				}
				else {
					$scope.data.orderByListFromSearch.nameProp = '-price'
					$scope.orderByReverse.price = true
					price.find('i').removeClass('toggleOrderByParams')
				}
			}
			//raiting
			else {
				raiting.addClass('orderBy_active');
				price.removeClass('orderBy_active')
				if ($scope.orderByReverse.raiting) {
					$scope.data.orderByListFromSearch.nameProp = 'raiting.val'
					$scope.orderByReverse.raiting = false
					raiting.find('i').addClass('toggleOrderByParams')
				}
				else {
					$scope.data.orderByListFromSearch.nameProp = '-raiting.val'
					$scope.orderByReverse.raiting = true
					raiting.find('i').removeClass('toggleOrderByParams')
				}
			}
		}
}]);




