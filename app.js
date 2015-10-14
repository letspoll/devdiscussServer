var express = require('express');
var mongoose = require('mongoose');
var app = express();
var mongodbUri = 'mongodb://localhost/polldb';
//var mongodbUri = 'mongodb://letspoll:letspoll00@ds053158.mongolab.com:53158/polldb';


var pollSchema= mongoose.Schema(
  {id:String
  ,pollNo:String}
);

var Poll = mongoose.model('Poll',pollSchema);

app.get('/', function (req, res) {
  console.log('connected');
  res.send('Welcome!');
});

var testIdNo = 0;

app.get('/poll/:pollNo', function (req, res) {
  console.log('poll' + req.params.pollNo);
  
  //var query = {id:req.ip};
  var query = {id:testIdNo++};
  var options = {upsert:true};
  Poll.findOneAndUpdate(query, { pollNo: req.params.pollNo }, options, function(err,silence){
    if(err){
      console.err(err);
      res.send('fail');
      throw err;
    }
    
    res.send('success');
  });
  
});


app.get('/view/:pollNo', function (req, res) {
  console.log('view' + req.params.pollNo);
  
  Poll.count({pollNo: req.params.pollNo}, function(err,cnt){
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

app.get('/getPollReport', function (req, res) {
  console.log('getPollReport');
  
  Poll.aggregate([
        {
            $group: {
                _id: '$pollNo',  //$region is the column name in collection
                count: {$sum: 1}
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json(result);
        }
    });
});

app.get('/clearAll', function (req, res) {
  console.log('clearAll' + req.params.pollNo);
  
  Poll.remove({}, function(err){
    if(err){
      console.err(err);
      res.send('fail');
      throw err;
    }
    
    res.send('success');
  });
});


mongoose.connect(mongodbUri,function(err){
    if(err){
        console.log('mongoose connection error :'+err);
        throw err;
    }
    
    var server = app.listen(3003, function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log('listening at http://%s:%s', host, port);
  });
});
