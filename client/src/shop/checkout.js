var Checkout = angular.module('myApp');

Checkout.controller('checkoutCtrl', function($scope, $location, $rootScope, $timeout,	$http, transformRequestAsFormPost){
  $rootScope.thankYou, $rootScope.payment;
  $rootScope.isGradient = true;

  $rootScope.customer, $rootScope.shipment, $rootScope.billing, $rootScope.Totals;

  $rootScope.payment = {
                          id: '',
                          number: '5555555555554444',
                          expiry_month: '02',
                          expiry_year:  '2018',
                          cvv:  '756'
                        };

$rootScope.checkout={
  customer:
           { first_name: '',
             last_name: '',
              email:''
           },
          shipment_method: '1301792307242074821',
          shipment:
                   { first_name: '',
                     last_name: '',
                     address_1: '',
                     city: '',
                     county: '',
                     country: '',
                     postcode: '',
                     phone: ''
                   },
          billing:
                  {
                     first_name: '',
                     last_name: '',
                     address_1: '',
                     city: '',
                     county: '',
                     country: '',
                     postcode: '',
                     phone: ''
                   }
   };


  $rootScope.shipmentToPayment = function(){
    console.log($rootScope.checkout);
    $rootScope.template = $rootScope.templates[2];

    $http.post('/cartToOrder', $rootScope.checkout)
    .then(function(data) {

      $rootScope.Totals=data.data;
      $rootScope.payment.id = $rootScope.Totals.id;
      console.log('id: '+$rootScope.payment.id);
      console.log($rootScope.Totals);
          console.log("posted successfully");
      }, function(data) {
          console.error("error in posting");
      })

  }//cartToOrder





  $rootScope.paymentToProcess = function(){
    $rootScope.cartLoading = true;
    $rootScope.Processed = false;
    $rootScope.template = $rootScope.templates[3];
    console.log("payment started");

        $http({
          url: '/orderToPayment',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: transformRequestAsFormPost,
          data: $rootScope.payment
        }).then( function(response){

            console.log("payment succeeded");
            console.log(response.data);

            if(response.data.data.paid){
              $rootScope.cartLoading = false;
              $rootScope.Processed = response;
              console.log(response.data);
              $scope.emptyCart();
            }else{
              console.log('paid false');
              $rootScope.Processed = response;
            }

          // $scope.findOrder($rootScope.Processed);


        }, function(response){
          console.log("payment failed!");
          console.log(response);
          $rootScope.Processed = response;
          $rootScope.cartLoading = false;
        })
  }//cartToOrder



//tentative function to update teh overall stock
  $scope.findOrder = function(contents){
    console.log("angular http");
    var data = contents.data;
    data['auth'] = $rootScope.Auth;
    console.log(data);

  }


$scope.emptyCart = ()=>{
  var req = {
   method: 'GET',
   url: 'https://api.molt.in/'+'v1/orders/'+data.order.id+'/items',
   headers: {
     'Authorization': "Bearer "+data.auth.access_token
   }
  }
  $http(req).then(function(response){
    console.log(response);
    $scope.updatestock(response);
    $scope.emptyCart();
  }, function(response){
    console.log(response);
  });
}

$scope.updatestock = function(data){
  $http.post('/updatestock', data)
   .success(function (data, status, headers, config) {
     console.log("updatestock");
     console.log(data);
   })
   .error(function (data, status, header, config) {
     console.log(data);
   });
}


  $scope.$watch('isBillingDifferent', function(value){
    console.log($scope.isBillingDifferent);
    if(!$scope.isBillingDifferent){
      console.log($rootScope.checkout);
        $rootScope.checkout.billing.first_name = $rootScope.checkout.shipment.first_name;
        $rootScope.checkout.billing.last_name = $rootScope.checkout.shipment.last_name;
        $rootScope.checkout.billing.address_1 = $rootScope.checkout.shipment.address_1;
        $rootScope.checkout.billing.city = $rootScope.checkout.shipment.city;
        $rootScope.checkout.billing.county = $rootScope.checkout.shipment.county;
        $rootScope.checkout.billing.country = $rootScope.checkout.shipment.country;
        $rootScope.checkout.billing.postcode = $rootScope.checkout.shipment.postcode;
        $rootScope.checkout.billing.phone = $rootScope.checkout.shipment.phone;
    }

  });





$scope.$watch('checkout', function(value){
  console.log(value);
  // $rootScope.checkout.customer.first_name = $rootScope.checkout.shipment.first_name;
  // $rootScope.checkout.customer.last_name = $rootScope.checkout.shipment.last_name;
  if(!$scope.isBillingDifferent){
    console.log($rootScope.checkout);
      $rootScope.checkout.billing.first_name = $rootScope.checkout.shipment.first_name;
      $rootScope.checkout.billing.last_name = $rootScope.checkout.shipment.last_name;
      $rootScope.checkout.billing.address_1 = $rootScope.checkout.shipment.address_1;
      $rootScope.checkout.billing.city = $rootScope.checkout.shipment.city;
      $rootScope.checkout.billing.county = $rootScope.checkout.shipment.county;
      $rootScope.checkout.billing.country = $rootScope.checkout.shipment.country;
      $rootScope.checkout.billing.postcode = $rootScope.checkout.shipment.postcode;
      $rootScope.checkout.billing.phone = $rootScope.checkout.shipment.phone;
  }

  console.log('country: '+$rootScope.checkout.shipment.country);
  if($rootScope.checkout.shipment.country=='US'){
    $rootScope.checkout.shipment_method='1301792307242074821'
    console.log('US');
  }else{
    $rootScope.checkout.shipment_method='1314165476770709929'
    console.log('INT');
  }
}, true)




$scope.emptyCart = ()=>{
  $http.post('/emptyCart')
   .success(function (data, status, headers, config) {
     console.log("updatestock");
     console.log(data);
     $rootScope.Cart ={};
   })
   .error(function (data, status, header, config) {
     console.log(data);
     $rootScope.Cart ={};
   });
}



});
