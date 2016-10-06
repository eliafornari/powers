
angular.module('myApp')


.controller('navCtrl', function($scope, $location, $rootScope, $routeParams, $timeout,	$http){

  $rootScope.isNavOpen = false;

  $scope.openNav = function(){
    $rootScope.isNavOpen = !$rootScope.isNavOpen;
  }

  $scope.closeNav = function(){
    $rootScope.isNavOpen = false;
  }


  $rootScope.isLocation= (location)=>{
    if ($location.path()==location){
      return true;
    }else{return false;}
  }

  $rootScope.isShopDetail = ()=>{
    if($location.path()=='/shop/'+$routeParams.detail){
      return true;
    }else{return false;}

  }

})


.directive('logoDirective', function($rootScope, $location, $window, $routeParams, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/icon/logo.html',
    replace: true,
    link: function(scope, elem, attrs) {

    }
  };
})

.directive('carticonDirective', function($rootScope, $location, $window, $routeParams, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/icon/cart-icon.html',
    replace: true,
    link: function(scope, elem, attrs) {

    }
  };
})

.directive('exDirective', function($rootScope, $location, $window, $routeParams, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/icon/ex.html',
    replace: true,
    link: function(scope, elem, attrs) {

    }
  };
})



.directive('navDirective', function($rootScope, $location, $window, $routeParams, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'views/nav.html',
    replace: true,
    link: function(scope, elem, attrs) {

    }
  };
});
