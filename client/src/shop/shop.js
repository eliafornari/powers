var Shop = angular.module('myApp');

Shop.controller('shopCtrl', function($scope, $location, $rootScope, $routeParams, $timeout,	$http, $sce, $document, anchorSmoothScroll, $window, transformRequestAsFormPost){

$rootScope.pageClass = "page-shop";
$scope.blink = false;
$rootScope.windowHeight = $window.innerHeight;
$rootScope.Detail = {};



$rootScope.showCart = false;
$rootScope.template={};
$rootScope.templates = [
                          { name: 'cart', url: 'views/cart.html'},
                          { name: 'shipment', url: 'views/shipment.html'},
                          { name: 'payment', url: 'views/payment.html'},
                          { name: 'processed', url: 'views/processed.html'}
                        ];
$rootScope.template = $rootScope.templates[0];



$scope.wheel;

$scope.startWheel_shop = ()=>{
  $(".shop-content").bind('mousewheel', function(event, delta) {
     // console.log(event.deltaX, event.deltaY, event.deltaFactor);
     this.scrollLeft -= (delta * 0.4);
     event.preventDefault();
     $scope.wheel=true;
  });
}

$scope.startWheel_shop();


$scope.stopWheel_shop = ()=>{
  $(".shop-content").unbind('mousewheel');
  $scope.wheel=false;
}






$scope.$on('$routeChangeSuccess', function(){
  // $routeParams.product
  console.log($routeParams.product);

  $rootScope.detailUpdate($routeParams.product);

  setTimeout(function(){
    if(!$rootScope.Detail.id){
      $rootScope.detailUpdate($routeParams.product);
      $scope.$apply();
      console.log("I loaded it again");
      console.log($rootScope.Detail);
    }else{
      console.log("Product loaded correctly");
      console.log($rootScope.Detail);
      return false
    }
  },3000);


});






    $rootScope.addToCart = function(id){
      // var token = document.cookie;
      var token = $rootScope.readCookie("access_token");
      console.log(token);
        $http({
          url: '/addProduct',
          method: 'POST',
          headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: transformRequestAsFormPost,
          data: {
                  id: id,
                  access_token:"helloooo"
                }
        }).then(function(response){
          $rootScope.Cart = response;
          $rootScope.updateCart();
          $rootScope.pageLoading = false;
          console.log(response);
        });
  }//addToCart




  //......VARIATIONS

    $rootScope.addVariation = function(){

      if($rootScope.selectedVariation){
        $http({
          url: '/addVariation',
          method: 'POST',
          headers: {
            // 'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            // 'Content-Type': 'application/x-www-form-urlencoded'
          },
          // transformRequest: transformRequestAsFormPost,
          data: $rootScope.selectedVariation
        }).then(function(response){
          // $rootScope.Cart = response;
          $rootScope.updateCart();
          console.log(response);
        });
      }else{
        $scope.variationErrorMessage = "select a size first"
        setTimeout(function(){
          $scope.variationErrorMessage = false;
          $rootScope.$apply();
        });
      }


    }//addToCart














//variations

$rootScope.selectedVariation = {};
$rootScope.howManyVAriationsSelected = 0;
$rootScope.detailUpdate = (slug) => {

  $rootScope.selectedVariation={};
  $rootScope.howManyVAriationsSelected = 0;
  $rootScope.Detail.total_variations=0;

  for (var i in $rootScope.Product){
    console.log($rootScope.Product[i].slug);
    if ($rootScope.Product[i].slug == slug){
      console.log('slug: '+slug);
      $rootScope.Detail=$rootScope.Product[i];
      $rootScope.Detail.total_variations=0;
      console.log("detail:", $rootScope.Detail);
      $rootScope.Detail.has_variation = $rootScope.has_variation;

      var go = true;
      //has variation
      for (i in $rootScope.Detail.modifiers){
        $rootScope.Detail.total_variations =$rootScope.Detail.total_variations+1;
        console.log($rootScope.Detail.total_variations);
        // if($rootScope.Detail.modifiers[i].id){$rootScope.has_variation=true;}else{$rootScope.has_variation=false;}
        $rootScope.Detail.has_variation = true;
          go = false;
      }

      if(go==true){
        //does not have variation
        $rootScope.Detail.has_variation = false;
      }

    }
  }
}







$rootScope.showSelection = function(modifier_id){
  for (var m in $rootScope.Detail.modifiers){
    if($rootScope.Detail.modifiers[m].id == modifier_id){
      $rootScope.Detail.modifiers[m].open= !$rootScope.Detail.modifiers[m].open
    }
  }
}



$rootScope.thisVariation = function(id, modifier_id, modifier_title, variation_id, variation_title){
  var i=0;
  for ( i in $rootScope.Detail.modifiers){
    $rootScope.Detail.modifiers.open =false;
    if($rootScope.Detail.modifiers[i].id==modifier_id){
      $rootScope.selectedVariation[i] =
        {
          id: id,
          modifier_id: modifier_id,
          modifier_title: modifier_title,
          variation_id: variation_id,
          variation_title: variation_title
        }
        if($rootScope.howManyVAriationsSelected<$rootScope.Detail.total_variations){
          $rootScope.howManyVAriationsSelected = $rootScope.howManyVAriationsSelected+1;
        }
    }

  }
}



$rootScope.countries = [];

$rootScope.getCountries = function(){
  $http({
    method: 'GET',
    url: 'assets/countries.json'
  }).then(function successCallback(response) {

    $rootScope.countries = response.data;
    console.log(response.data);


  }, function errorCallback(response) {

    $scope.error = {value: true, text:'countries not available, this page will be reloaded'};
    setTimeout({
      // $route.reload();
    }, 2000);
  });
};
$rootScope.getCountries();


$scope.phoneRegex = '^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$';
$scope.postcodeRegex = '^\\d{5}-\\d{4}|\\d{5}|[A-Z]\\d[A-Z] \\d[A-Z]\\d$'

// '/^[a-z]{1,2}[0-9][a-z0-9]?\s?[0-9][a-z]{2}$/i'



setTimeout(function(){
  $( ".shop-li" ).draggable({
    axis: "x"
  });
}, 400);




});//controller
