var Cart = angular.module('myApp');

Cart.controller('cartCtrl', function($scope, $location, $rootScope, $timeout,	$http, transformRequestAsFormPost){

  $rootScope.Cart;
  $rootScope.showCart = false;
  console.log("ran again");

  $rootScope.openCart = function(){
    $rootScope.showCart = !$rootScope.showCart;
    $rootScope.updateCart();
    console.log("opencart");
  }

  $rootScope.closeCart = function(){
    $rootScope.showCart = false;
  }


  $rootScope.$watch('Cart', function(newValue) {
      console.log(newValue);
      $rootScope.Cart = newValue;
  });


  $rootScope.updateCart = function(){
        $http({
          url: '/getCart',
          method: 'GET',
          headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: transformRequestAsFormPost,
          // data: {
          //       }
        }).then(function(response){
          $rootScope.Cart = response.data;
          $rootScope.pageLoading = false;
          console.log(response);

          if(!$rootScope.Cart.total_items==0){
            console.log("cart has some stuff");
            $rootScope.attachItemID($rootScope.Cart.contents);
          }
        });
  }//updateCart




  //attaching item function
    $rootScope.attachItemID=function(obj){
        Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
          $rootScope.Cart.contents[val].item=val;
          // console.log(val + ' -> ' + obj[val]);
        });
    }





$rootScope.removeItem = function(id){

      $http({
        url: '/removeProduct',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: transformRequestAsFormPost,
        data: {
                id: id
              }
      }).then(function(response){
        console.log("object removed");
        $rootScope.Cart = response;
        $rootScope.updateCart();
        console.log(response);
      });
}


  $scope.cartToShipment = function(){
    if($rootScope.Cart.total_items>0){
      $rootScope.template = $rootScope.templates[1];
    }else{
      $rootScope.noProductsError=true;
      setTimeout(function(){
        $rootScope.showCart = false;
        $rootScope.noProductsError=false;
        $rootScope.$apply();
      },2000);

    }
  }

  $rootScope.backFromShipment=()=>{
    $rootScope.template = $rootScope.templates[0];
  }


  $rootScope.backFromPayment = ()=>{

    $rootScope.template = $rootScope.templates[1];

    $rootScope.paymentProcessed = false;
    $rootScope.errorMessage = false;
    $rootScope.thankYou = false;
    $rootScope.cartLoading = false;
  }



  $rootScope.backFromProcessed = ()=>{
    $rootScope.template = $rootScope.templates[2];
    $rootScope.paymentProcessed = false;
    $rootScope.errorMessage = false;
    $rootScope.thankYou = false;
    $rootScope.cartLoading = false;
  }









});
