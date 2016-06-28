angular.module('AdminProductsCtrl',[])

.controller('adminProductsCtrl', ['$scope', 'adminProductsFactory', '$http', 'Upload', 'socket', '$rootScope', '$timeout', 'mainUrl', function($scope, adminProductsFactory,  $http, Upload, socket, $rootScope, $timeout, mainUrl) {
	'use strict';
	
// =================================================================MAIN VALUES===================================================================
	//constanta - main db
	$scope.DB = {
		'tablet' : { 	russ : "Планшеты", 	value : undefined,	img : 'tablet.png'	},
		'laptop' : {	russ : "Ноутбуки",	value : undefined,	img : 'laptop.png'	}
	}
	// add random products to db 
	$scope.numRandomProducts =  undefined;
	//number products in db
	$scope.numProducts = { 	'laptop' : 0,	'tablet' : 0	}
	//balans in db
	$scope.balansInDb = undefined;
	//url
	$scope.url = mainUrl.url;
	//tablet or laptop (name)
	$scope.currentDb = {	name : undefined }
// ==================================================ACTIONS - CHANGE VIEW (search, add, edit)=====================================================
	$scope.productAction = { 	search : true,  add : false, 	edit : false 	}

// ========================================================================SEARCH===================================================================
	//number products on 1 page
	$scope.numProductsInView = 5; 
	//scope for current type product (tablet or laptop)
	$scope.view = undefined;
	// main view for user
	$scope.mainView = undefined;
	//start number product in list with pagination 
	$scope.numberProduct = undefined;
	// scope for view pagination
	$scope.viewWithPagination = undefined;
	//action - type of find 
	$scope.typeSearch = {	pages : true,	values : false 	}
	// find - type values
	$scope.search = {
		id : undefined,
		brand : undefined,
		model : undefined
	}
	$scope.searchInputValues = {
		id : undefined,
		brand : undefined,
		model : undefined
	}
	
// =======================================================ADD NEW PRODUCT===================================================. 
	//prepared product values
	$scope.togglePreparedProduct = true;
	//model for new product
	$scope.product_val = {
		kind : undefined,
		brand : undefined,
		model : undefined,
		guarantee : undefined,
		price : undefined,
		operSystem : undefined,
		cpu : undefined,
		numCores : undefined,
		memory : undefined,
		ramMemory : undefined,
		screenDiagonal : undefined,
		screenResolution : undefined,
		frontCamera : undefined,
		mainCamera : undefined,
		battery : undefined,
		colours : [],
		sale : {	bool : undefined,	discount : undefined, descript : undefined},
	};
	//colors
	$scope.product_newColour = undefined;
	//images
	$scope.product_img = {
		small 		: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false}, 
		big 			: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false}, 
		slide1 		: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false}, 
		slide2 		: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false}, 
		slide3 		: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false}, 
		slide4 		: {'file' : undefined, 'load_img_begin' : false, 'loaded' : false} 
	};
	// +++++++++++++++++++ validation new product ++++++++++
	//validation all values new product
	$scope.valid = {
		kind : 					{'value' : false, 'pattern' : '^[а-яА-ЯёЁa-zA-Z0-9]+$'	},
		brand : 					{'value' : false, 'pattern' : '^[а-яА-ЯёЁa-zA-Z0-9]+$'	},
		model : 					{'value' : false, 'pattern' : '^[а-яА-ЯёЁa-zA-Z0-9]+$'	},
		guarantee :  			{'value' : false, 'pattern' : '^[ 0-9]+$'			},
		price : 					{'value' : false, 'pattern' : '^[ 0-9]+$'			},
		operSystem : 			{'value' : false, 'pattern' : '([\s\S]*)'			},
		cpu : 					{'value' : false, 'pattern' : '^[а-яА-ЯёЁa-zA-Z0-9]+$'	},
		numCores : 				{'value' : false, 'pattern' : '^[ 0-9]+$'			},
		memory : 				{'value' : false, 'pattern' : '^[ 0-9]+$'			},
		ramMemory : 			{'value' : false, 'pattern' : '^[ 0-9]+$'			},
		screenDiagonal : 		{'value' : false, 'pattern' : '^[0-9.,]+$'		},
		screenResolution : 	{'value' : false, 'pattern' : '([\s\S]*)'			},
		frontCamera : 			{'value' : false, 'pattern' : '^[0-9.,]+$'		},
		mainCamera : 			{'value' : false, 'pattern' : '^[0-9.,]+$'		},
		battery : 				{'value' : false, 'pattern' : '^[ 0-9]+$'			}

	};
	$scope.saleValid = {
		discount :		{'value' : false, 'pattern' : '^[ 0-9]+$'	},
		descript : 		{'value' : false, 'pattern' : '([\s\S]*)'	}
	}
	//validation button (add to db, add images) 
	$scope.valid_btn = {
		btn_setProductDb : true,
		btn_setImgDb : false
	};
	// then server answer - id new product set in this value, after admin can add images
	$scope.product_id = undefined;
	
// ====================================  EDIT-UPDATE  ========================================
	$scope.product_kind = undefined;
	$scope.toggleComments = false;
	$scope.btnCommentsName = 'Показать комментарии';
	$scope.editCurrProductComments = undefined;	
	

// ======================================================================================================================================
	// get start data 
	adminProductsFactory.getNumberDbProducts($scope);
	$scope.getDb = function(nameDb, event) {
		adminProductsFactory.getDb(nameDb, $scope)	}
	//action db
	$scope.clearDbProduct =	function() {
		adminProductsFactory.clearDb($scope)}
	$scope.setRandomProductDb = function() {
		adminProductsFactory.setRandomProductDb($scope.numRandomProducts, $scope)}
	
	// CHANGE VIEW ==================================================================================
	$scope.toggleView = function(nameView) {
		adminProductsFactory.toggleView(nameView, $scope)};
	
	// VIEW - SEARCH =================================================================================
	$scope.findValues = function() {
		adminProductsFactory.findValues($scope)}
	$scope.findPages = function() {
		adminProductsFactory.findPages($scope)}
	$scope.deleteProduct = function(id) {
		adminProductsFactory.deleteProduct(id, $scope)}
	$scope.editProduct = function(id) {
		adminProductsFactory.editProduct(id, $scope)}
	
	// VIEW - ADD NEW PRODUCT ========================================================================
	$scope.createNewObjectProduct = function() {
		adminProductsFactory.createNewObjectProduct($scope)};
	$scope.addPreparedProduct = function() {
		adminProductsFactory.addPreparedProduct($scope)};
	$scope.addNewColor = function() {
		adminProductsFactory.addNewColor($scope)};
	$scope.removeColor = function(color){
		adminProductsFactory.removeColor(color, $scope)};
	$scope.validationAddColor = function() {
		adminProductsFactory.validationAddColor($scope)}
	$scope.setProductDb = function() {
		adminProductsFactory.setProductDb($scope)}
	$scope.setImgDb = function(typeAction) {
		adminProductsFactory.setImgDb($scope, Upload, typeAction)};
	
//EDIT (UPDATE) product===========================================================================
	$scope.updateProductDb = function() {
		adminProductsFactory.updateProductDb($scope)}
	//delete comment
	$scope.editCurrProductDeleteComment = function(idComment) {
		adminProductsFactory.editCurrProductDeleteComment(idComment, $scope)}
	//edit - get comments for current product
	$scope.getCurrentProductComments = function(event) {
		event.preventDefault();
		adminProductsFactory.getCurrentProductComments($scope)}
	//balans in db
	$scope.summProducts = function() {
		var summ;
		summ = 150 - ($scope.numProducts.laptop + $scope.numProducts.tablet);
		if (summ > 0) { $scope.balansInDb = summ }
		else {$scope.balansInDb = 0}
		if ($scope.numProducts.laptop == 0 && $scope.numProducts.tablet == 0)  {
			$scope.balansInDb = 150;
			$scope.numRandomProducts = undefined;}}
// =====================================================================================================
	//sockets
	socket.on('addNewRandomProduct', function (data) {
		adminProductsFactory.sokcetMessage(data, $scope)});
	
	//then admin select page search click page (click on new page) 
	$scope.$on('newPageFromPagination', function(e, pageNumber) {
		var begin = (pageNumber-1)*$scope.numProductsInView;
		var end =  begin + $scope.numProductsInView;
		$scope.numberProduct = begin;
		$scope.mainView = $scope.view.slice(begin, end)});

	//watchers
	$scope.$watch('view', function(newVal) {
		if (newVal) {
			var lastPagePagination = Math.ceil(newVal.length/$scope.numProductsInView);
			$scope.$broadcast('changePagination', lastPagePagination)
			$scope.mainView = $scope.view.slice(0, $scope.numProductsInView)	
		}})
}]);
