
angular.module('AdminUsersCtrl')

.factory('adminUsersFactory', ['$http', 'productsInfoFactory', '$rootScope',   function($http, productsInfoFactory, $rootScope) {
	'use strict';

	return {
		getUsers: function(page, scope) {
			'use strict';
			if (scope.allUsers[page]) {
				scope.currentGroupUsers = scope.allUsers[page]
			}
			else{
				scope.$emit('startSpinner')
				$http.post(scope.url.getGroupUsers, {'page' : page, "viewNum": scope.usersInViewNumber})
					.success(function(result) {
						scope.summAllUsers = result.usersSumm;
						scope.allUsers[page] = result.usersView;
						scope.currentGroupUsers = result.usersView;
						scope.amountPages = Math.ceil(result.numberAllUsers / scope.usersInViewNumber);
						scope.$emit('stopSpinner')
						$rootScope.$emit('setCtrlDescr', 'admin-users') 
					})
					.error(function(err) {
						scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
					})
	
			}
		},
		findUserLogin : function(scope) {
			var arrComments;
			var i;
			$http.post(scope.url.getUserByLogin, {'login': scope.userLogin})
				.success(function(result) {
					if (result.success) {
						scope.currentUser = result.user;
						arrComments = JSON.parse(result.comments);
						for (i = 0; i < arrComments.length; i++) {
							arrComments[i].prettyDate = productsInfoFactory.prettyDatePublic(arrComments[i].dateMilisec)
						}
						scope.currentUserComments = arrComments;
					}
					else {
						if (result.commentsError) {
							scope.$emit('showWebAssistant', "ошибка в бд с комментариями");
						}
						else {
							scope.$emit('showWebAssistant', "такого пользователя нет в бд");	
						}
					}
				})
				.error(function(err) {
					scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
				})
		},
		getCurrentUserDetails : function(idUser, idComments, scope) {
			$http.post(scope.url.getCurrentUserComments, {'idCommentsDb' : idComments})
				.success(function(result) {
					'use strict';
					var i;
					var arrComments;
					arrComments = result;
					for (i = 0; i < arrComments.length; i++) {
						arrComments[i].prettyDate = productsInfoFactory.prettyDatePublic(arrComments[i].dateMilisec)
					}
					scope.currentUserComments = arrComments;
				})
				.error(function(err) {
					scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
				})
			for (var i = 0; i < scope.currentGroupUsers.length; i++) {
				if (scope.currentGroupUsers[i]._id === idUser) {
					scope.currentUser = scope.currentGroupUsers[i];
					break;
				}
			}	
		},
		deleteComment : function(idDeletedComment, idCommentsDb, scope) {
			scope.$emit('startSpinner')
			$http.post(scope.url.deleteComment, {
				'idDeletedComment' : idDeletedComment,
				'idCommentsDb' : idCommentsDb})
				.success(function(result) {
					for (var i = 0; i < scope.currentUserComments.length; i++) {
						if (scope.currentUserComments[i]._id === idDeletedComment) {
							scope.currentUserComments.splice(i, 1)
							break;
						}
					}
					scope.$emit('stopSpinner')
					scope.$emit('showWebAssistant', "комментарий удален из базы данных");
				})
				.error(function(err) {
					scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
				})
		},
		deleteAvatar : function(idUser, scope) {
			if (scope.currentUser.avatarId) {
				$http.post(scope.url.deleteAvatar, {'idUser' : idUser})
					.success(function(result) {
						if (result.success) {
							scope.$emit('showWebAssistant', "фотография удалена с сервера");
							scope.currentUser.avatarId = undefined;
							scope.currentUserAvatar = scope.currentUser.avatarId || 'avatar.jpg'
						}
						else {
							scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
						}
					})
					.error(function(err) {
						scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
					})
			}
			else {
				scope.$emit('showWebAssistant', "у данного пользователя нет фотографии");
			}
		},
		deleteUser : function(idUser, scope) {
			scope.$emit('startSpinner')
			$http.post(scope.url.deleteUser, {'idUser' : idUser})
				.success(function(result) {
					if (result.success) {
						for (var i = 0; i < scope.currentGroupUsers.length; i++) {
							if (scope.currentGroupUsers[i]._id === idUser) {
								scope.currentGroupUsers.splice(i, 1);
								scope.currentUser = undefined;
								scope.$emit('stopSpinner')
								if (result.avatar) {
									scope.$emit('showWebAssistant', "пользователь удален из всех баз. аватар удален");
								}
								else {
									scope.$emit('showWebAssistant', "пользователь удален из всех баз");
								}
								break;
							}
						}
					}
					else {
						scope.$emit('stopSpinner')
						scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
					}

				})
				.error(function(err) {
					scope.$emit('stopSpinner')
					scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
				})
		}	
	}
}]);
