
angular.module('ProductsInfoCtrl',[])

.controller('productsInfoCtrl', ['$scope', '$http', 'productsInfoFactory', 'mainUrl',  function($scope, $http, productsInfoFactory, mainUrl) {
	$scope.currentProduct = undefined;
	$scope.userComment = undefined;
	$scope.userCommentLength = undefined;
	$scope.productComments = undefined;
	$scope.currProductImgCarousel = undefined;
	$scope.reitObj = {};
	$scope.reitObj.val = 3.5;
	$scope.activeView = {show : 'options'};
	$scope.infoMessage = undefined;  
	$scope.setComment = function() {
		productsInfoFactory.setComment($scope, $scope.data.url.setComment)
	};
	$scope.toggleInfoView = function(nameView, event) {
		event.preventDefault();
		$scope.activeView.show = nameView;
	};
	$scope.inspectLength	 = function() {
		$scope.userCommentLength = $scope.userComment.length;
		if ($scope.userCommentLength < 300 && $scope.userCommentLength >= 0) {
			$scope.infoMessage = 300 - $scope.userCommentLength;
		}
		else {
			$scope.infoMessage = "большое сообщение"
		}
	}
	$scope.$on('showInfoProduct', function(event, product) {
		productsInfoFactory.showInfo($scope, product)
	})
}]);




