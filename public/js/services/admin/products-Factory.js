
angular.module('AdminProductsCtrl')

.factory('adminProductsFactory', ['$http', '$timeout', '$rootScope', 'productsInfoFactory', '$interval', function($http, $timeout, $rootScope, productsInfoFactory, $interval) {
   'use strict';
   function NewProduct() {
      this.kind = undefined,
      this.brand = undefined,
      this.model = undefined,
      this.guarantee = undefined,
      this.price = undefined,
      this.operSystem = undefined,
      this.cpu = undefined,
      this.numCores = undefined,
      this.memory = undefined,
      this.ramMemory = undefined,
      this.screenDiagonal = undefined,
      this.screenResolution = undefined,
      this.frontCamera = undefined,
      this.mainCamera = undefined,
      this.battery = undefined,
      this.colours = [],
      this.sale = {},
      this.sale.bool = undefined;
      this.sale.discount = undefined;
      this.sale.descript = undefined; 
   }
   function clearImg(scope) {
       var product_img = scope.product_img;
       var prop;
      for(prop in product_img) {
         scope.product_img[prop].file = undefined;
         scope.product_img[prop].load_img_begin = false;
         scope.product_img[prop].loaded = false;
      }
   }
   function validation(scope) {
      var objValid = scope.valid;
      var regExp;
      var allValuesValid = true;
      var prop;
      var resultRe;
      for (prop in objValid) {
         if (scope.product_val[prop]) {
            regExp = new RegExp(objValid[prop].pattern);
            resultRe = regExp.test(scope.product_val[prop]) 
            objValid[prop].value = resultRe && scope.product_val[prop];
            if (!objValid[prop].value) {
               allValuesValid = false;
            }
         }
         else {
            objValid[prop].value = false;
            allValuesValid = false;
         }  
      }
      if (scope.product_val.sale.bool) {
         for (prop in scope.saleValid) {
            regExp = new RegExp(scope.saleValid[prop].pattern);
            resultRe = regExp.test(scope.product_val.sale[prop]) 
            scope.saleValid[prop].value = resultRe && scope.product_val.sale[prop];
            if (!scope.saleValid[prop].value) {
               allValuesValid = false;
            }        
         }
      }
      scope.valid_btn.btn_setProductDb = !allValuesValid;
   };
   function clearAllValues(scope) {
      'use strict';
      var product_val = scope.product_val;
      var valid = scope.valid;
      var prop;
      for(prop in product_val) {
         if (prop !== 'sale' && prop !== 'colours') {
            scope.product_val[prop] = undefined;
         }
      }
      product_val.colours = [];
      // product_val.colours = [0];
      clearImg(scope)
      for(prop in valid) {
         scope.valid[prop].value = false;
      }
      scope.saleValid.discount.value = false;
      scope.saleValid.descript.value = false;
      scope.product_id = undefined;
      scope.valid_btn.btn_setProductDb =  true
      scope.valid_btn.btn_setImgDb =  false
      scope.product_val.sale.bool = false;
      scope.product_val.sale.discount = undefined;
      scope.product_val.sale.descript = undefined;
      scope.togglePreparedProduct = true;
      scope.product_newColour = undefined;
   };
   return {
      addNewColor : function(scope) {
         var index;
         index = scope.product_val.colours.indexOf(scope.product_newColour);
         if (index < 0) {scope.product_val.colours.push(scope.product_newColour)}
      },
      removeColor : function(color, scope) {
         var index;
         index = scope.product_val.colours.indexOf(color);
         scope.product_val.colours.splice(index, 1)
      },
      createNewObjectProduct : function(scope) {
         scope.product_val = new NewProduct()
      },
      toggleView : function(nameView, scope) {
         switch (nameView) {
            case "search":
               scope.productAction.search = true;
               scope.productAction.add = false;
               scope.productAction.edit = false;
               // clearAllValues(scope)
               break;
            case "add":
               scope.productAction.search = false;
               scope.productAction.add = true;
               scope.productAction.edit = false;
               scope.product_id = undefined;
               scope.product_val = new NewProduct();
               // clearAllValues(scope)
               break;
            case "edit":
               scope.productAction.search = false;
               scope.productAction.add = false;
               scope.productAction.edit = true;

               break;
         }
      },
      findValues : function(scope) {
         scope.typeSearch.values = true;
         scope.typeSearch.pages = false;
         scope.search = scope.searchInputValues;
         scope.search = scope.searchInputValues;
         scope.search = scope.searchInputValues;
         scope.mainView = scope.view 
      },
      findPages : function(scope) {
         var lastPagePagination;
         scope.typeSearch.values = false;
         scope.typeSearch.pages = true;
         scope.search = undefined;
         scope.search = undefined;
         scope.search = undefined;
         lastPagePagination = Math.ceil(scope.view.length/scope.numProductsInView);
         scope.$broadcast('changePagination', lastPagePagination)
         scope.mainView = scope.view.slice(0, scope.numProductsInView)
      },
      getDb : function(nameDb, scope) {
         scope.product_val.kind = nameDb;
         scope.currentDb.name = nameDb;
         scope.typeSearch.pages = true;
         scope.typeSearch.values = false;
         scope.$emit('startSpinner')
         $http.post(scope.url + "/getDbAdmin", {'nameDb' : nameDb})
            .success(function(data) {
               scope.DB[nameDb].value = data;
               scope.numProducts[nameDb] = data.length;
               scope.view = data;
               scope.$emit('stopSpinner')
            })
            .error(function(err) {
               scope.$emit('stopSpinner')
               $rootScope.$emit('showWebAssistant', "сбой на сервере. обратитесь к сис. админу");
            })
      },
      deleteProduct : function(id, scope) {
         scope.$emit('startSpinner')
         $http.post(scope.url + "/deleteProduct", {"id" : id, "productType" : scope.currentDb.name})
         .success(function(doc) {
            if (doc.success) {
               var i;
               //delete product from view;
               for (i = 0; i < scope.DB[scope.currentDb.name].value.length; i++) {
                  if (scope.DB[scope.currentDb.name].value[i]._id === id) {
                     scope.DB[scope.currentDb.name].value.splice(i,1);
                     break;
                  }
               }
               for (i = 0; i < scope.mainView.length; i++) {
                  if (scope.mainView[i]._id === id) {
                     scope.mainView.splice(i,1);
                     break;
                  }
               }
               scope.numProducts[scope.currentDb.name]--
               scope.balansInDb++
               scope.$emit('stopSpinner')
               $rootScope.$emit('showWebAssistant', "продукт удален из БД");
            }
            else {
               scope.$emit('stopSpinner')
               $rootScope.$emit('showWebAssistant', "сбой на сервере. обратитесь к сис. админу");
            }
         })
         .error(function(err) {
            $rootScope.$emit('showWebAssistant', "сбой на сервере. обратитесь к сис. админу");
         })
      },
      getCurrentProductComments : function(scope) { 
         var arrComments;
         var idComments = scope.product_val.comments.idComments;
         if (!scope.editCurrProductComments) {
             $rootScope.$emit('startSpinner')
             $http.post(scope.url + '/getCurrentProductComments', {
               'idCommentsDb' : idComments,
               'kindProduct' : scope.product_kind})
               .success(function(result) {
                  console.log(result)
                  if (result.commentsEmpty) {
                     $rootScope.$emit('stopSpinner')
                     scope.$emit('showWebAssistant', "у данного товара нет комментариев");
                  }
                  else {
                     arrComments = result.comments;
                     for (var i = 0; i < arrComments.length; i++) {
                        arrComments[i].prettyDate = productsInfoFactory.prettyDatePublic(arrComments[i].dateMilisec)
                     }
                     scope.editCurrProductComments = arrComments;
                     scope.toggleComments = true;
                     scope.btnCommentsName = 'Скрыть комментарии';
                     $rootScope.$emit('stopSpinner')
                  }                  
               })
               .error(function(err) {
                  $rootScope.$emit('stopSpinner')
                  scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
               }) 
         }
         else {
            if (scope.toggleComments) {
               scope.toggleComments = false;
               scope.btnCommentsName = 'Показать комментарии';
            }
            else {
               scope.toggleComments = true;
               scope.btnCommentsName = 'Скрыть комментарии';
            }
         } 
      },
      editCurrProductDeleteComment : function(idComment, scope) { 
         var idProduct = scope.product_val._id
         var idCommentsDb = scope.product_val.comments.idComments;
             $rootScope.$emit('startSpinner')
             $http.post(scope.url + '/deleteProductComment', {
               'idProduct' : scope.product_val._id,
               'idCommentsDb' : scope.product_val.comments.idComments,
               'kindProduct' : scope.product_kind,
               'idThisComment' : idComment})
               .success(function(result) {
                  'use strict';
                  var arrComments;
                  var i;
                  var userName;
                  var date;
                  if (result.success) {
                     arrComments = scope.editCurrProductComments;
                     for (i = 0; i < arrComments.length; i++) {
                        if (arrComments[i]._id === idComment) {
                           userName = arrComments[i].user;
                           date = arrComments[i].prettyDate;
                           arrComments.splice(i, 1);
                           break;
                        }   
                     }
                     $rootScope.$emit('stopSpinner')
                     scope.$emit('showWebAssistant', "Комментарий пользователя - " + userName + ", от " + date + " удален");
                  }
                  else {
                     $rootScope.$emit('stopSpinner')
                     scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
                  }
               })
               .error(function(err) {
                  $rootScope.$emit('stopSpinner')
                  scope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
               }) 
      },
      validationAddColor : function(scope) {
         'use strict'
         var 	regExp,
               validColor;
         regExp = new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$');
         validColor = regExp.test(scope.product_newColour);	
         if (validColor) {
            scope.valid.btn_addColor = true;
         }
         else {
            scope.valid.btn_addColor = false;
         }
      },
      setProductDb : function(scope) {
         'use strict';
         var prop;
         var valid = true;
         var i;
         $rootScope.$emit('startSpinner')
         $http.post(scope.url + "/setProductDb", scope.product_val)
            .success(function(doc) {
               if (doc.id) {  
                  scope.product_id = doc.id
                  scope.product_kind = scope.product_val.kind;
                  $rootScope.$emit('stopSpinner')
                  $rootScope.$emit('showWebAssistant', "продукт добавлен в базу, добавьте фотографии");  
                  //scroll to image
                  var scrollBottom = $(window).scrollTop() + $(window).height();
                  $('body').animate({ 'scrollTop': scrollBottom}, 4000)
                  scope.numProducts[scope.product_kind]++;
                  scope.balansInDb--;
               }
               else {
                  $rootScope.$emit('stopSpinner')
                  $rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже"); 
               }
            })
            .error(function(err) {
               $rootScope.$emit('stopSpinner')
               $rootScope.$emit('showWebAssistant', "сбой на сервере, повторите позже");
            })
      },
      setImgDb : function(scope, Upload, typeAction) {
         //two action - "add" and "edit" + upload images
         'use strict';
         var 	prop;
         var   allImg;
         var   id;
         var   valid;
         var   interval_ ;
         var   counterAddImg;
         var   kindProduct;
         var   idImg;
         allImg = scope.product_img;
         if (typeAction === 'add') {
             for (prop in allImg) {
               if(allImg[prop].file) {
                  valid = true
               } 
               else { 
                  valid = false; 
                  break;
               }
            }
         }
         else {
            for (prop in allImg) {
               if(allImg[prop].file) {
                  valid = true
                  break;
               } 
               else { 
                  valid = false; 
               }
            }
         }
         if (valid) {
            counterAddImg = 0;
            interval_ = $interval(function() {
               if (counterAddImg == 0) {
                  $interval.cancel(interval_)
                  if (typeAction === 'add') { 
                     $rootScope.$emit('showWebAssistant', "фото добавлены в БД, обновите бд");
                     setTimeout(function() {
                        $('body').animate({ 'scrollTop': 0}, 2000)
                        clearAllValues(scope)
                     },2000)
                     
                  }
                  else { 
                     $rootScope.$emit('showWebAssistant', "фотографии заменены, ПЕРЕЗАГРУЗИТЕ САЙТ");
                  }
               }
            }, 500)
            id = scope.product_id;
            kindProduct = scope.product_kind
            for(prop in allImg) {
               if (typeAction === 'edit') {
                  idImg = scope.product_val.img[prop]
               }
               else {
                  idImg = undefined;
               }
               if (allImg[prop].file) {
                  allImg[prop].load_img_begin = true;
                  counterAddImg += 1;
                  Upload.upload({'url': scope.url + "/setImgAdmin_" + prop + "_" + kindProduct, 'data': { 
                     'idImg' : idImg,
                     'id': id,
                     'typeAction' : typeAction,
                     'kindProduct' : kindProduct,
                     'kindImg': prop, 
                     'file': allImg[prop].file, 
                     'typeDb': scope.product_val.kind}})
                     .then(function(res) {
                        allImg[res.data.kindImg].load_img_begin = false;
                        allImg[res.data.kindImg].loaded = true;
                        counterAddImg -= 1;
                     })
               }
            }
         }	
         else {
            if (typeAction === 'add') { 
               $rootScope.$emit('showWebAssistant', "Вы добавили не все фотографии");
            }
            else {  
               $rootScope.$emit('showWebAssistant', "Вы не добавили ни одного изображения для замены"); 
            }
         }
      },
      getNumberDbProducts : function(scope) {
          $rootScope.$emit('startSpinner')
          $http.get(scope.url + '/getNumberDbProducts')
            .success(function(result) {
               var key;
               var prop;
               var pathForWatch;
               if (result.laptop == 0 && result.tablet == 0) {
                  $rootScope.$emit('showWebAssistant', 'в базе данных нет записей, добавьте бд')
                  $rootScope.$emit('stopSpinner')
                  $rootScope.$emit('setCtrlDescr', 'admin-products')
                   scope.summProducts()
               }
               else {
                  scope.numProducts.laptop = result.laptop;
                  scope.numProducts.tablet = result.tablet;
                  scope.summProducts()
                  $rootScope.$emit('stopSpinner')    
                  $rootScope.$emit('setCtrlDescr', 'admin-products')
               }
               // main values
               for(prop in scope.valid) {
                  pathForWatch = 'product_val.' + prop;
                  scope.$watch(pathForWatch, function(newVal, oldVal) {
                     if (newVal !== oldVal) {
                        validation(scope)
                     }
                  })
               }
               // sale values
               for(prop in scope.product_val.sale) {
                  pathForWatch = 'product_val.sale.' + prop;
                  scope.$watch(pathForWatch, function(newVal, oldVal) {
                     if (newVal !== oldVal) {
                        validation(scope)
                     }
                  })
               }
            })
            .error(function(err) {
               $rootScope.$emit('showWebAssistant', 'сбой на сервере, повторите позже')
               $rootScope.$emit('stopSpinner')
            })
      },
      clearDb : function(scope) {
          $rootScope.$emit('startSpinner')
          $http.post(scope.url + "/clearProductCommentsImageDb", {})
            .success(function(doc) {
               if (doc.success) {
                  $rootScope.$emit('stopSpinner')
                  $rootScope.$emit('showWebAssistant', "Все БД с товарами, комментариями, изображениями очищены");
                  scope.numProducts.laptop = 0;
                  scope.numProducts.tablet = 0;
                  scope.summProducts()
               } 
               else {
                  console.log('da')
                  $rootScope.$emit('stopSpinner')
                  $rootScope.$emit('showWebAssistant', "сбой на сервере, обратитесь к сис. админу");
               }           
            })
            .error(function(err) {$rootScope.$emit('showWebAssistant', "возможен сбой на сервере, обратитесь к сис. админу");})
      },
      setRandomProductDb : function(numberRandom, scope) {
         if (numberRandom) {
            if (numberRandom<=0 || (numberRandom % 1 != 0 || numberRandom>50)) {
               $rootScope.$emit('showWebAssistant', "число должно быть меньше 50, положительное, не равное 0, целое");
            }
            else {
               if (numberRandom>scope.balansInDb) {
                   $rootScope.$emit('showWebAssistant', "Вы можете добавить еще - " + scope.balansInDb + ", но не более");
               }
               else {
                  //create animate counter
                  var elem = document.createElement('span');
                  $(elem).css({
                     'position': 'absolute',
                     'top': '20%',
                     'left': '50%',
                     'font-size' : '3em',
                     '-webkit-transform':'translate(-50%,-50%)',
                     'transform':'translate(-50%,-50%)'
                  })
                  $('#bg_spinner').append(elem)
                  $rootScope.$emit('startSpinner')
                  $http({
                     'url': scope.url + "/setRandomsProductDb",
                     'method': 'POST',
                     'data' : {number : numberRandom},
                     'timeout' : 900000 })
                     .success(function(doc) {
                        if (doc.success) {
                           scope.numRandomProducts = undefined;
                           $('#bg_spinner').find('span').remove()
                           $rootScope.$emit('stopSpinner')
                           $rootScope.$emit('showWebAssistant', 'все ' + numberRandom + ' продуктов добавлены');
                        }
                     })
                     .error(function(err) {
                        $('#bg_spinner').find('span').remove()
                     $rootScope.$emit('stopSpinner')
                     $rootScope.$emit('showWebAssistant', "возможен сбой на сервере, обратитесь к сис. админу");
                     })  
               }
            }
         }
         else {
             $rootScope.$emit('showWebAssistant', "введите колличество продуктов");  
         } 
      },
      sokcetMessage : function(data, scope) {
         if (!scope.numProducts[data.kind]) {
            scope.numProducts[data.kind] = 0;
            scope.numProducts[data.kind]++ 
         }
         else {
            scope.numProducts[data.kind]++ 
         }
         if ( data.counter % 25 == 0    &&   data.counter != data.delta ) {
            $rootScope.$emit('showWebAssistant', 'осталось - ' + data.counter + ' продуктов из ' + data.delta)
         }
          $('#bg_spinner').find('span').text(data.counter)
         scope.summProducts()
      },
      editProduct : function(id, scope) {
         var i;
         var prop;
         var arr = scope.DB[scope.currentDb.name].value;
         var arrLength = arr.length;
         scope.productAction.search = false;
         scope.productAction.add = false;
         scope.productAction.edit = true;
         clearImg(scope)
         for (i = 0; i < arrLength; i++) {
            if (arr[i]._id === id) {
               scope.product_val = arr[i];
               scope.product_id = arr[i]._id;
               scope.product_kind = arr[i].kind;
               break;
            } 
         }
         validation(scope)         
      },
      updateProductDb : function(scope) {
         $rootScope.$emit('startSpinner')
         $http.post(scope.url + "/updateProduct", scope.product_val)
            .success(function(result) {
               if (result.success) {
                  $rootScope.$emit('stopSpinner') 
                  $rootScope.$emit('showWebAssistant', 'Информация обновлена') 
               }
               else {
                  $rootScope.$emit('stopSpinner') 
                  $rootScope.$emit('showWebAssistant', "возможен сбой на сервере, обратитесь к сис. админу")
               }
            })
            .error(function(err) {
               $rootScope.$emit('stopSpinner')
               $rootScope.$emit('showWebAssistant', "возможен сбой на сервере, обратитесь к сис. админу")
            })
      },
      addPreparedProduct : function(scope) {
         if (scope.togglePreparedProduct) {
            scope.product_val.brand = 'testBrand',
            scope.product_val.model = 'testModel',
            scope.product_val.guarantee = 12,
            scope.product_val.price = 1111,
            scope.product_val.operSystem = 'tesOperSystem',
            scope.product_val.cpu = 'testCpu',
            scope.product_val.numCores = 1,
            scope.product_val.memory = 11,
            scope.product_val.ramMemory = 512,
            scope.product_val.screenDiagonal = 1.1,
            scope.product_val.screenResolution = '1024*768',
            scope.product_val.frontCamera = 0.1,
            scope.product_val.mainCamera = 1.1,
            scope.product_val.battery = 1111,
            scope.product_val.colours = ['#111', '#555', '#999'],
            scope.product_val.sale.bool = true;
            scope.product_val.sale.discount = 1,
            scope.product_val.sale.descript = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse labore animi blanditiis enim. Odit, recusandae!'
            scope.product_val.raiting = {   val : 1, num : 1, sum : 1  }
            scope.togglePreparedProduct = false;
            validation(scope)
         }
         else {
            scope.product_val.brand = undefined,
            scope.product_val.model = undefined,
            scope.product_val.guarantee = undefined,
            scope.product_val.price = undefined,
            scope.product_val.operSystem = undefined,
            scope.product_val.cpu = undefined,
            scope.product_val.numCores = undefined,
            scope.product_val.memory = undefined,
            scope.product_val.ramMemory = undefined,
            scope.product_val.screenDiagonal = undefined,
            scope.product_val.screenResolution = undefined,
            scope.product_val.frontCamera = undefined,
            scope.product_val.mainCamera = undefined,
            scope.product_val.battery= undefined
            scope.product_val.colours = undefined,
            scope.product_val.sale.bool = undefined;
            scope.product_val.sale.discount = undefined,
            scope.product_val.sale.descript = undefined
            delete scope.product_val.raiting;
            scope.togglePreparedProduct = true;
            for (var prop in scope.product_img) {
               scope.product_img[prop].file = undefined;
               scope.product_img[prop].load_img_begin = false;
               scope.product_img[prop].loaded  = false;
            }
            scope.product_id = undefined;
            validation(scope)
         }  
      }
   }
}]);



