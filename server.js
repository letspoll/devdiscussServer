var express = require('express');
var mongoose = require('mongoose');
var app = express();
var mongodbUri = 'mongodb://localhost/polldb';
//var mongodbUri = 'mongodb://letspoll:letspoll00@ds053158.mongolab.com:53158/polldb';


var pollSchema= mongoose.Schema(
  {id:String
  ,pollChar:String}
);

var Poll = mongoose.model('Poll',pollSchema);

var questionSchema= mongoose.Schema(
  {id:String
  ,question:String}
);

var Question = mongoose.model('Question',questionSchema);

app.get('/', function (req, res) {
  console.log('connected');
  res.send('Welcome!');
});

//var testIdNo = 0;

app.get('/poll/:pollChar', function (req, res) {
  console.log('poll' + req.params.pollChar);
  
  var ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;                 
  var query = {id:ipAddr};
  //var query = {id:testIdNo++};
  var options = {upsert:true};
  Poll.findOneAndUpdate(query, { pollChar: req.params.pollChar }, options, function(err,silence){
    if(err){
      console.err(err);
      res.send('fail');
      throw err;
    }
    
    res.send('success');
  });
  
});


app.get('/view/:pollChar', function (req, res) {
  console.log('view' + req.params.pollChar);
  
  Poll.count({pollChar: req.params.pollChar}, function(err,cnt){
    if(err){
      console.err(err);
      res.send('fail');
      throw err;
    }
    
    console.log('result:' + cnt);
    
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With'
    });
    
    res.send(cnt + "");
  });
});

app.post('/getPollReport', function (req, res) {
  console.log('getPollReport');
  
  Poll.aggregate([
        {
            $group: {
                _id: '$pollChar',  //$region is the column name in collection
                count: {$sum: 1}
            }
        }
    ], function (err, result) {
        if (err) {
            console.err(err);
            res.send('fail');
            throw err;
        } else {
            res.set({
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'X-Requested-With'
            });
            
            res.send(result);            
        }
    });
});

app.get('/clearAll', function (req, res) {
  console.log('clearAll');
  
  Poll.remove({}, function(err){
    if(err){
      console.err(err);
      res.send('fail');
      throw err;
    }
    
    res.send('success');
  });
});


var questionId = 1;

app.get('/question/:question', function (req, res) {
  console.log('question' + req.params.question);
  
  var q = new Question({
    id : questionId++, 
    question : req.params.question});

  res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'
      });      

  q.save(function (err, data) {
    if (err) {
      console.err(err);
      res.send('fail');
      throw err;
    } else {
      res.send("success");
    }
  });  
});

app.get('/getQuestionAll/:id', function (req, res) {
  console.log('getQuestionAll' + req.params.id);
  
  Question.find({ 'id': { $gt: req.params.id} }, function (err, result) {
    if (err) {
      console.err(err);
      res.send('fail');
      throw err;
    } else {      
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'
      });      
      res.send(result);
    }
  });

});

mongoose.connect(mongodbUri,function(err){
    if(err){
        console.log('mongoose connection error :'+err);
        throw err;
    }
    
    var server = app.listen(80, function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log('listening at http://%s:%s', host, port);
  });
});
