angular.module('AdminUsersCtrl',[])

.controller('adminUsersCtrl', ['$scope', '$http', 'adminUsersFactory', 'mainUrl', function($scope,  $http, adminUsersFactory, mainUrl) {
	'use strict';
	
	$scope.allUsers = {};
	$scope.summAllUsers = undefined;
	$scope.currentGroupUsers = undefined;
	$scope.currentUser = undefined;
	$scope.currentUserComments = undefined;
	// start index user in list
	$scope.startIndex = 0;
	$scope.currentUserComments
	// $scope.currentUserBasket = undefined;
	$scope.currentUserAvatar = 'avatar.jpg';
	// number users in view. default - 10 users - 1 page in pagination
	$scope.usersInViewNumber = 5;  
	//number pages in pagination
	$scope.amountPages = undefined;
	// find user (login)
	$scope.userLogin = undefined 
	$scope.url = {
		getGroupUsers: mainUrl.url + '/getGroupUsers',
		getCurrentUserComments : mainUrl.url + '/getCurrentUserComments',
		deleteComment : mainUrl.url + '/deleteComment',
		deleteAvatar : mainUrl.url + '/deleteAvatar',
		deleteUser : mainUrl.url + '/deleteUser',
		getUserByLogin : mainUrl.url + '/getUserByLogin'
	}
	$scope.activeItemsAdminUser = {
		'userBasket' : false,
		'userComments' : false
	}
	//load first 10 users in view
	adminUsersFactory.getUsers(1, $scope);
	$scope.findUser = function() {
		adminUsersFactory.findUserLogin($scope)}
	//user details
	$scope.userDetails = function(idUser, idComments) {
		adminUsersFactory.getCurrentUserDetails(idUser, idComments, $scope)}
	$scope.deleteUser = function(idUser) {
		adminUsersFactory.deleteUser(idUser, $scope)	}
	//delete bad image-avatar
	$scope.deleteAvatar = function() {
		adminUsersFactory.deleteAvatar($scope.currentUser._id, $scope)}
	//show basket current user
	$scope.showUserBasket = function() {
		$scope.activeItemsAdminUser.userBasket = true;
		$scope.activeItemsAdminUser.userComments = false;}
	//show comments current user
	$scope.showUserComments = function() {
		$scope.activeItemsAdminUser.userBasket = false;
		$scope.activeItemsAdminUser.userComments = true;}
	//delete bad comment
	$scope.deleteComment = function(idThisComment) { 
		adminUsersFactory.deleteComment(idThisComment, $scope.currentUser.commentsId, $scope)}
	//watcher - last page pagination value
	$scope.$watch('amountPages', function(newVal, oldVal) {
		if (newVal && newVal !== oldVal) {	
			$scope.$broadcast('changePagination', newVal);	
		}})
	//watch for change avatar
	$scope.$watch('currentUser', function(newVal, oldVal) {
		if (newVal && newVal.username) {
			$scope.currentUserAvatar = $scope.currentUser.avatarId || 'avatar.jpg';
		}
	})
	$scope.$on('newPageFromPagination', function(e, page) {
		adminUsersFactory.getUsers(page, $scope);
		$scope.startIndex = $scope.usersInViewNumber * (page - 1)
	});
}]);