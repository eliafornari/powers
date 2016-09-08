exports.index = function(req, res){
  res.render('index');
  console.log('returned index');
};


exports.partials = function (req, res) {
  // var name = req.params.name;
  res.render('index');
  // res.render('partials/' + name);

};


exports.robots = function (req, res) {
  // var name = req.params.name;
  res.render('robots');
  // res.render('partials/' + name);

};
