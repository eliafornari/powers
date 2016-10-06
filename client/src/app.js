'use strict'

import 'angular'
import 'angular-route'
import 'angular-animate'
import 'angular-resource'
// import Prismic from 'prismic.io'
import jQuery from "jquery"

angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'infinite-scroll'
])


.run(['$anchorScroll', '$route', '$rootScope', '$location', '$routeParams','$templateCache', function($anchorScroll, $route, $rootScope, $location, $routeParams, $templateCache) {

$rootScope.pageLoading = true;

//a change of path should not reload the page


    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        else if (reload === true){
            var currentPageTemplate = $route.current.templateUrl;
            $templateCache.remove(currentPageTemplate);
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = '/';
                  un();
                  $route.reload();
              });
        }
        return original.apply($location, [path]);
    };

  }])

  .filter('trustUrl', function ($sce) {
      return function(url) {

        newurl = url+"?rel=0&amp;controls=0&amp;showinfo=0"
        // if (url){
          var trusted = $sce.trustAsResourceUrl(newurl);
          return trusted;
        // }
      };
    })




.config(['$routeProvider', '$locationProvider' ,'$sceProvider', function($routeProvider, $locationProvider, $sceProvider) {

$sceProvider.enabled(false);

  // use the HTML5 History API
  $locationProvider.html5Mode(true);

  $routeProvider


  // $locationChangeStart

    .when('/shop/:detail', {
      templateUrl: 'views/detail.html',
      controller: 'detailCtrl'
    })


    .when('/about', {
      templateUrl: 'views/contact.html'
    })
    .when('/contact', {
      templateUrl: 'views/contact.html'
    })

    .when('/privacy', {
      templateUrl: 'privacy/privacy.html',
      controller: 'privacyCtrl'
    })


    .when('/client/assets/images/profile.jpg', {

    }

)

    /*............................. Take-all routing ........................*/


    .when('/', {
      templateUrl: 'views/shop.html',
      controller: 'appCtrl',
      resolve: {

        }

    })


    // put your least specific route at the bottom
    .otherwise({redirectTo: '/'})






}])

.controller('appCtrl', function($scope, $location, $rootScope, $routeParams, $timeout, $interval, $window, $http, transformRequestAsFormPost){

$rootScope.location = $location.path();
$rootScope.firstLoading = true;
$rootScope.Story, $rootScope.totalPages;
$rootScope.pageClass = "page-home";











  $rootScope.Auth;
    $rootScope.authentication = function(){

          // Simple GET request example:
          $http({
            method: 'GET',
            url: '/authenticate'
          }).then(function successCallback(response) {

            if(response.data.access_token){
                console.log("auth");
                console.log(response);
                // this callback will be called asynchronously
                // when the response is available
                $rootScope.Auth = response.data;
                var expires = response.data.expires;
                var identifier = response.data.identifier;
                var expires_in = response.data.expires_in;
                var access_token = response.data.access_token;
                var type = response.data.token_type;




            }
            $rootScope.getProductsFN();

            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });

    }//addToCart

    $rootScope.getProductsFN=function(){
      $http({method: 'GET', url: '/getProducts'}).then(function(response){
        console.log("product: ");
        console.log(response);
        $rootScope.Product = response.data;
        console.log(response.data);
        $rootScope.pageLoading = false;
        $rootScope.getGif();
      }).then(function(){
        console.log("an error occurred");
      })
    }

    $rootScope.getGif=function(){
      $http({method: 'GET', url: '/data/gif.json'}).then(function(response){
        console.log(response);
        $rootScope.Gif = response.data;
        console.log(response.data);
        $scope.associateGif();

      });
    }


    $scope.associateGif = ()=>{
      for (var i in $rootScope.Product){
        for (var g in $rootScope.Gif){
          if($rootScope.Product[i].slug==$rootScope.Gif[g].slug){
            $rootScope.Product[i].gif = $rootScope.Gif[g];
            console.log($rootScope.Product);
          }
        }
      }
    }





  setTimeout(function(){
    $rootScope.authentication();
  }, 600);





    $rootScope.windowHeight = $window.innerHeight;

    jQuery($window).resize(function(){
        $rootScope.windowHeight = $window.innerHeight;
        $rootScope.checkSize();
        $scope.landscapeFunction();
        $scope.$apply();
    });



    //..............................................................................mobile
    //....this is the function that checks the header of the browser and sees what device it is
    $rootScope.isMobile, $rootScope.isDevice, $rootScope.isMobileDevice;
    $rootScope.checkSize = function(){
        $rootScope.checkDevice = {
              Android: function() {
                  return navigator.userAgent.match(/Android/i);
              },
              BlackBerry: function() {
                  return navigator.userAgent.match(/BlackBerry/i);
              },
              iOS: function() {
                  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
              },
              Opera: function() {
                  return navigator.userAgent.match(/Opera Mini/i);
              },
              Windows: function() {
                  return navigator.userAgent.match(/IEMobile/i);
              },
              any: function() {
                  return ($rootScope.checkDevice.Android() || $rootScope.checkDevice.BlackBerry() || $rootScope.checkDevice.iOS() || $rootScope.checkDevice.Opera() || $rootScope.checkDevice.Windows());
              }
          };

        //........checks the width
          $scope.mobileQuery=window.matchMedia( "(max-width: 767px)" );
          $rootScope.isMobile=$scope.mobileQuery.matches;

        //.........returning true if device
          if ($scope.checkDevice.any()){
            $rootScope.isDevice= true;
          }else{
              $rootScope.isDevice=false;
          }

          if (($rootScope.isDevice==true)&&($scope.isMobile==true)){
            $rootScope.isMobileDevice= true;
          }else{
              $rootScope.isMobileDevice=false;
          }




            if ($rootScope.isDevice){
                $rootScope.mobileLocation = function(url){
                  $location.path(url).search();
                }
                $rootScope.mobileExternalLocation = function(url){
                  $window.open(url, '_blank');
                }
            } else if (!$rootScope.isDevice){
                $rootScope.mobileLocation = function(url){
                  return false;
                }
                $rootScope.mobileExternalLocation = function(url){
                  return false;
                }
            }

      }//checkSize
      $rootScope.checkSize();
      $rootScope.landscapeView = false;

     //function removing website if landscape

      $scope.landscapeFunction = function(){

        if ($rootScope.isMobile==true){
            if(window.innerHeight < window.innerWidth){
              $rootScope.landscapeView = true;
              $rootScope.pageLoading = true;
              $(".landscape-view-wrapper").css({
                "width":"100vw",
                "height": "100vh",
                "display": "block"
            });
            }else{
              $rootScope.landscapeView = false;
              $rootScope.pageLoading = false;
            }
        }
      }

    $scope.landscapeFunction();





});//......end of the route controller




var jquerymousewheel = require('./vendor/jquery.mousewheel.js')($);
var infiniteScroll = require("./vendor/infiniteScroll.js");
var jqueryUI = require('./vendor/jquery-ui.min.js');
var home = require("./home.js");
var nav = require("./nav.js");
var service = require("./services.js");
var cart = require("./shop/cart.js");
var shop = require("./shop/shop.js");
var shop = require("./shop/checkout.js");
