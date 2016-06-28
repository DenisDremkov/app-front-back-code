
angular.module('AutentificCtrl')

.factory('autentificFactory',  ['$http', '$rootScope', '$timeout', '$cookies', '$interval', 'socket', function($http, $rootScope, $timeout, $cookies, $interval, socket) {
	'use strict';
		function typeAvatar(scope) {
			if (scope.rootUser.rights && scope.rootUser.rights==='admin') {
				scope.pathAvatar = './../img/admin/avatar.jpg'
			}
			if (scope.rootUser.rights && scope.rootUser.rights==='user') {
				if (scope.rootUser.avatarId) {
					scope.pathAvatar = './../img/users/avatars/' + scope.rootUser.avatarId;
				}
				else {
					scope.pathAvatar = './../img/users/avatars/avatar.jpg';
				}
			}
		};
		function successLogin(username, scope) {
			'use strict';
			var arrRaiting;
			var i;
			$rootScope.$emit('showWebAssistant', "Здравствуйте, " + username + ". Я Ваш помощник.");
			scope.activItems.loginMain = false;
			scope.activItems.log_out = true;
			scope.activItems.private_account = false;
			scope.user.username = undefined;
			scope.user.password = undefined;
			scope.user.password = undefined;
			scope.user.email = undefined;
			if (username !== "admin") {
				scope.activItems.avatarImg = true;
				scope.activItems.basket = true;
				arrRaiting = scope.rootUser.raitings;
				$rootScope.rootUser.objRaiting = {};
				for (i = 0; i < arrRaiting.length; i++) {
					$rootScope.rootUser.objRaiting[arrRaiting[i]] = true
				}
				typeAvatar(scope)
			}
			if (username === "admin") {
				$interval(function() {
					socket.emit('adminInSession', {})
				},5000)
				typeAvatar(scope)
			}
			$rootScope.$emit('stopSpinner');
		};
		function messageAdminIsLogin(message) {
			var element;			
			element = angular.element('<div>');
			element.addClass('pop_up_text');
			$(element).html(message);
			$('body').append(element);
			$(element).delay(3000).animate({
				'opacity': 1,
				'top' : '50%'
			},1000)
			$timeout(function() {
				$(element).delay(3000).animate({
					'opacity': 1,
					'top' : '-250%'
				},1000)
			},19000)	
		}

	return {
		messageAdminLogin : function(scope, msg) {
			if (scope.rootUser.rights!=='admin') {
				messageAdminIsLogin(msg)
			}
		},
		// +
		inspectSession : function(scope) {
			$http.post(scope.url.session)
				.success(function(res) {
					var element;
					if (res.adminSession) {
						messageAdminIsLogin('на данный момент в сети находится администратор сайта, </br> администратор может удалять товары, пользователей, </br> поэтому, во избежание некорректного отображения информации у вас на странице, </br>  рекомендуем Вам зайти позже')						
					}
					if (res.user) {
						$rootScope.rootUser = res.user;
						successLogin(res.user.username, scope)
						typeAvatar(scope)
					}
				})
				.error(function(err) {})					
		},
		// +
		login : function(scope) {
			'use strict';
			if (scope.user.username && scope.user.password) {
				$rootScope.$emit('startSpinner')
				$http.post(scope.url.login, scope.user)
					.success(function(res) {
						if (res.admin && res.admin === 'inSession') {
							$rootScope.$emit('showWebAssistant', "На данный момент под админом уже работают, попробуйте позже");
							$rootScope.$emit('stopSpinner')
						}
						else {
							if (res.username) {
								if (res.rights === 'admin') {
									// $rootScope.adminKeyAccess = res.keyAccess;
									$rootScope.rootUser = res;
									successLogin(res.username, scope)
								};
								if (res.rights === 'user') {
									$rootScope.rootUser = res;									
									successLogin(res.username, scope)							
								};							
							}
							else {
								$rootScope.$emit('showWebAssistant', res);
								$rootScope.$emit('stopSpinner')
							}	
						}	
					})
					.error(function(err) {
						if (err) throw (err);
						$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
						$rootScope.$emit('stopSpinner')
					})		
				}
			else { $rootScope.$emit('showWebAssistant', "заполните поля 'логин' и 'пароль'");}
		},
		// +
		logOut : function(scope) {
			var userRights;
			userRights = $rootScope.rootUser.rights;
			delete $rootScope.rootUser;
			scope.activItems.private_account = true;
			$http.post(scope.url.logOut, {'userRights' : userRights})
				.success(function(res) {
					if (res.deleteCookie) {
						$cookies.remove('user.session')
						location.reload()

					}
				})
				.error(function(err) {})
		},	
		// +
		registr : function(scope, Upload) {
			'use strict';
			var user = scope.user;
			function successRegistr() {
				$rootScope.$emit('showWebAssistant', "Вы зарегестрированы! Зайдите в систему.");
				scope.activItems.tab_login = true;
				scope.activItems.tab_registr = false;
				scope.activItems.loginForm = true;
				scope.activItems.registrForm = false;
				scope.user.username = undefined;
				scope.user.password = undefined;
				scope.user.password = undefined;
				scope.user.email = undefined;
				$rootScope.$emit('stopSpinner');
			}
			if (user.password === user.passwordRep) {
				$rootScope.$emit('startSpinner')
				$http.post(scope.url.registr, user)
					.success(function(newUser) {
						if (newUser._id)  {
							if (scope.avatarImg) {
								Upload.upload({'url': scope.url.postAvatar, 'data': {'id': newUser._id, 'file': scope.avatarImg}})
								.then(function(avatarId) {
									if (avatarId.data) {
										$rootScope.rootUser.avatarId = avatarId.data.id;
										successRegistr()
									}
									else { $rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже")}
								})
							}
							else { successRegistr()	}	
						}
						else {
							$rootScope.$emit('showWebAssistant', newUser);
							$rootScope.$emit('stopSpinner');
						}	
					})
					.error(function(err) {
						if (err) throw (err);
						$rootScope.$emit('showWebAssistant', "сбой на сервере, повторите");
						$rootScope.$emit('stopSpinner');
					})
			}
			else { $rootScope.$emit('showWebAssistant', "Ваши пароли не совпадают")	}
		},
		// +
		toggleTabs : function(name, data) {	
			'use strict';
			if (name === 'loginForm') {
				data.activItems.loginForm = true;
				data.activItems.registrForm = false;
				data.activItems.tab_login = true;
				data.activItems.tab_registr = false;
			} else {
				data.activItems.loginForm = false;
				data.activItems.registrForm = true;
				data.activItems.tab_registr = true;
				data.activItems.tab_login = false;
			}
		}
	}
}]);

