"use strict"


let https = require("https");
let http = require("http");
let fs = require('fs');
let express = require("express");
let bodyParser = require('body-parser');
let routes  = require('./routes');
let path = require('path');
var util = require('util');
let ejs = require('ejs');
let sessions = require('client-sessions');
let request = require('request');
let crypto = require('crypto');
let app = express();


let moltin = require('moltin')({
  publicId: '8en2oIJBCaYGRotcURMN9BAepq8FCNM0cMqqSM9NdH',
  secretKey: 'xbrVSjyT5WFy863O61dCEglvxxFm3hH1Vw6f3fri5p'
});


app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
// app.use(function(req, res, next) {
//     if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
//         res.redirect('https://' + req.get('Host') + req.url);
//     }
//     else
//         next();
// });
app.use( express.static(__dirname + "/../client/assets/images") );
app.use(express.static('/../node_modules/jquery/dist/jquery.min.js'));
app.set('views', __dirname + '/../client');
app.use( express.static(__dirname + "/../client") );
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies




app.get('/profile', function(req, res){
   var img = fs.readFileSync('./client/assets/images/profile.jpg');
   res.writeHead(200, {'Content-Type': 'image/jpeg' });
   res.end(img, 'binary');
});




// AUTH

app.use(sessions({
  cookieName: 'mySession', // cookie name dictates the key name added to the request object
  secret:'8en2oIJBCaYGRotcURMN9BAepq8FCNM0cMqqSM9NdH', // should be a large unguessable string
  duration: 3600 * 1000, // how long the session will stay valid in ms
  activeDuration: 3600 * 1000 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

app.use(function(req, res, next) {

    if(!req.mySession.cartID){

      crypto.randomBytes(18, function(err, buffer) {
        req.mySession.cartID = buffer.toString('hex');
      });
      moltin.Cart.Identifier(true, req.mySession.cartID);

    }else{
      // console.log("req.mySession.cartID"+req.mySession.cartID);
      moltin.Cart.Identifier(true, req.mySession.cartID);
    }



    if (!req.mySession.access_token || !req.mySession.expires) {
      res.setHeader('X-Seen-You', 'false');
      authMoltin(req, res, next);
    }else{
      var timeLeft = setToHappen(req.mySession.expires);

      if(timeLeft<1000){
        authMoltin(req, res, next);
      }else{
        moltin.Authenticate(function(data) {
        });
        next();
      }
    }

});





function authMoltin(req, res, next){
  moltin.Authenticate(function(data) {

    if(data){

      if(req.mySession.access_token && (req.mySession.access_token==data.access_token)){
        console.log("1 runs");
        data.cart=req.mySession.cartID;
      }else if(data.token){
        console.log("2 runs");
        req.mySession.access_token = data.token;
        data.cart=req.mySession.cartID;
      }else{
        console.log("3 runs");
        req.mySession.access_token = data.access_token;
        data.cart=req.mySession.cartID;
      }

      req.mySession.expires = data.expires;
      next();

    }else{
      res.status(500);
    }

  });
}




function setToHappen(d){
    var t = d - (new Date()).getTime();
    return t;
}









//SHOP ENDPOINTS


    app.post('/addProduct', function(req, res){

      var id = req.body.id;
      var token = req.body.access_token;
      res.setHeader("Authorization", "Bearer "+token);

      moltin.Cart.Insert(id, 1, null, function(items){
        res.json(items);
      });

    });


    app.post('/addVariation', function(req, res){
      // console.log('request =' + JSON.stringify(req.body))
      var variationArray = req.body;
      for (var i in variationArray){
        var id = variationArray[i].id;
        var modifier = variationArray[i].modifier_id
        var variation = variationArray[i].variation_id
        var obj={};
        var objArray = [];
        obj[modifier] = variation
        objArray.push(obj);
      }

      moltin.Cart.Insert(id, 1, obj, function(cart) {
        // console.log(cart);
        res.json(cart);
      }, function(error, response, c) {
        console.log(error);
        console.log(c);
        res.json(error);
          // Something went wrong...
      });

    });



    app.post('/removeProduct', function(req, res){

      var id = req.body.id;
      moltin.Cart.Remove(id, function(items) {
          // Everything is awesome...
          res.status(200);
          res.json(items);
      }, function(error, response, c) {
          // Something went wrong...
          console.log(response);
      });
    })

    app.get('/getProducts', function(req, res){
      getProduct(req, res);
    });

    app.get('/getCart', function(req, res){
      getCart(req, res);
    });

    app.post('/cartToOrder', function(req, res){
      var data = req.body;
      cartToOrder(req, res, data);
    });


    app.post('/orderToPayment', function(req, res){
      var order = req.body;
      orderToPayment(req, res, order);
    });








//functions


    function emptyCart(req, res){

      moltin.Cart.Delete(function(data) {
        // Everything is awesome...
        res.status(200).json(data);
        console.log();
      }, function(error, response, c) {
        console.log("payment failed!");
        console.log("response: "+response);
        console.log("c: "+c);
        console.log("error: "+error);

        res.status(c).json(response);
        // Something went wrong...
      });

    }



    function getCart(req, res){

        moltin.Cart.Contents(function(items) {
          // res.writeHead(200, {'Content-Type': 'application/json'});
          res.json(items);
          // res.end(items);
            // Update the cart display
        }, function(error){
              console.log(error);
        });

    }



    function getProduct(req, res){
        moltin.Product.List(null, function(product) {
          console.log(product);
            res.json(product);

        }, function(error) {
            // Something went wrong...
            console.log("Something went wrong in getting the products..");
        });
    }




    function cartToOrder(req, res, data){
      console.log("wait for the order");
      console.log(data);

      var customer = data.customer;
      console.log('customer:',customer);
      var ship_to = data.shipment;
      var bill_to = data.billing;
      var shipment_method = data.shipment_method;

        moltin.Cart.Complete({
          gateway: 'stripe',
          customer: {
            first_name: customer.first_name,
            last_name:  customer.last_name,
            email: customer.email
          },
          shipping: shipment_method,
          bill_to: {
            first_name: bill_to.first_name,
            last_name:  bill_to.last_name,
            address_1:  bill_to.address_1,
            address_2:  bill_to.address_2,
            city:       bill_to.city,
            county:     bill_to.county,
            country:    bill_to.country,
            postcode:   bill_to.postcode,
            phone:      bill_to.phone,
          },
          ship_to: {
            first_name: ship_to.first_name,
            last_name:  ship_to.last_name,
            address_1:  ship_to.address_1,
            address_2:  ship_to.address_2,
            city:       ship_to.city,
            county:     ship_to.county,
            country:    ship_to.country,
            postcode:   ship_to.postcode,
            phone:      ship_to.phone,
          }
        }, function(order) {

          console.log("wait for the order");
          console.log(order);

          res.json(order);
            // Handle the order

        }, function(error, response, c) {
          console.log(response);
          res.json(error);
          // Something went wrong...
        });


    }




    function orderToPayment(req, res, order){
      console.log(order);
      var card_number = order.number.toString();
      console.log(card_number);
      var expiry_month = order.expiry_month;
      var expiry_year = order.expiry_year;
      var cvv = order.cvv;
      var obj={};
      obj = {
                data: {
                number: card_number,
                expiry_month: expiry_month,
                expiry_year: expiry_year,
                cvv: cvv
              }
            }
      moltin.Checkout.Payment('purchase', order.id, obj, function(payment, error, status) {

          console.log("payment successful");
          console.log(payment);
          res.status(200).json(payment);

      }, function(error, response, c) {
        console.log("payment failed!");
        console.log("response: "+response);
        console.log("c: "+c);
        console.log("error: "+error);

        res.status(c).json(response);
        // Something went wrong...
      })
    }









    app.get('/order/:order/get', function(req, res){
      getOrderByID(req, res);
    });

    function getOrderByID(req, res){
      var orderID = req.params.order;
      moltin.Order.Get(orderID, function(order) {
          res.status(200).json(order);
      }, function(error) {
        res.status(400).json(error);
          // Something went wrong...
      });
    };






    app.get('/order/:order/items', function(req, res){
      getOrderItems(req, res);
    });

    function getOrderItems(req, res){
      var id = req.params.order;
      var url = 'https://api.molt.in/v1/orders/'+id+'/items';
      var access_token = req.mySession.access_token;
      var options = {
        url: url,
        headers: {
          'Authorization': 'Bearer '+access_token
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body);
          res.status(response.statusCode).json(info);
        }else{
          var info = JSON.parse(body);
          res.status(response.statusCode).json(info);
        }
      }
      request(options, callback);
    }




    function updateProductStock(req, res){

      var id = req.params.id;
      var quantity = req.params.quantity;

        moltin.Product.Update(id, {
            stock_level:  quantity
        }, function(product) {
            req.mySession.updated_stock = true;
            res.status(200).json(product);

        }, function(error, response, c) {
          console.log("stock level update failed!");
          console.log("c: "+c);
          console.log("error: "+error);
          res.status(c).json(response);
            // Something went wrong...
        });
    }





    app.post('/order/:order/put', function(req, res){
      putOrder(req, res);
    });

    function putOrder (req, res){
      var orderID = req.params.order;
      var obj = req.body;
      moltin.Order.Update(orderID, obj, function(order) {
        res.status(200).json(order);
      }, function(error, response, c) {
          res.status(400).json(error);
          console.log(error);
          // Something went wrong...
      });
    }







// GET VARIATIONS LEVEL

    app.get('/product/:id/variations/get', function(req, res){
      getVariationsLevel(req, res);
    });

    function getVariationsLevel(req, res){
      var id = req.params.id.toString();
      var url = 'https://api.molt.in/v1/products/'+id+'/variations';
      var access_token = req.mySession.access_token;
      var options = {
        url: url,
        headers: {
          'Authorization': 'Bearer '+access_token
        }
      };

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body);
          res.status(response.statusCode).json(info);
        }else{
          var info = JSON.parse(body);
          res.status(response.statusCode).json(info);
        }
      }
      request(options, callback);

    }








//UPDATE GLOBAL STOCK LEVEL

    app.post('/product/:id/stock_level/:quantity', function(req, res){
      updateProductStock(req, res);
    })

    function updateProductStock(req, res){

      var id = req.params.id;
      var quantity = req.params.quantity;

        moltin.Product.Update(id, {
            stock_level:  quantity
        }, function(product) {
            req.mySession.updated_stock = true;
            res.status(200).json(product);

        }, function(error, response, c) {
          console.log("stock level update failed!");
          console.log("c: "+c);
          console.log("error: "+error);
          res.status(c).json(response);
            // Something went wrong...
        });
    }


    app.post('/cart/erase', function(req, res){
      eraseCart(req, res);
    })

    function eraseCart(req, res){
      moltin.Cart.Delete(function() {
        res.status(c).json(response);
      }, function(error) {
        console.log("stock level update failed!");
        console.log("c: "+c);
        console.log("error: "+error);
        res.status(c).json(response);
      });
    }



    //get support data
    app.get('/data/support', function(req, res){
      // Get content from file
     var support = fs.readFileSync("./server/data/support.json");
     var support = JSON.parse(support);
     res.json(support);

    });







    // function eraseAllOrders(){
    //   moltin.Order.List(null, function(order) {
    //       // console.log(order);
    //       for (var i in order){
    //         var id = order[i].id;
    //         id = id.toString();
    //         console.log(id);
    //         moltin.Order.Delete(id, function(data) {
    //           console.log(data);
    //             // Success
    //         }, function(error) {
    //             // Something went wrong...
    //         });
    //       }
    //   }, function(error) {
    //       // Something went wrong...
    //   });
    // }





    app.get('/robots.txt', routes.robots);

    app.get('*', routes.index);

    app.listen(8081, () => console.log("listening on 8081"));

    // https.createServer(options, app).listen(80);
    // http.createServer(app).listen(9000);







    // // set up plain http server
    // var http = express.createServer();
    //
    // // set up a route to redirect http to https
    // http.get('*',function(req,res){
    //     res.redirect('https://mydomain.com'+req.url)
    // })
    //
    // // have it listen on 8080
    // http.listen(8080);
