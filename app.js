

var express = require('express'),
  bluemix = require('./config/bluemix'),
  watson = require('watson-developer-cloud-alpha'),
  extend = require('util')._extend,
  fs = require('fs'),
  dummy_text = fs.readFileSync('mobydick.txt');
 
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
var router = require('router');
var https = require('https');
var url = require('url');
  //summaryFile = require('./public/js/textSummary.js');
var demo = require('./public/js/demo');

var app = express();
app.use(errorHandler());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));
 // to support URL-encoded bodies
app.use(router());

app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); 
// Bootstrap application settings
require('./config/express')(app);
// var passport = require('passport');
// var ImfBackendStrategy = require('passport-imf-token-validation').ImfBackendStrategy;
// var imf = require('imf-oauth-user-sdk');

//passport.use(new ImfBackendStrategy());


//app.use(passport.initialize());

//redirect to mobile backend application doc page when accessing the root context
// app.get('/', function(req, res){
// 	res.sendfile('public/index.html');
// });

// create a public static content service
// app.use("/public", express.static(__dirname + '/public'));

// // create another static content service, and protect it with imf-backend-strategy
// app.use("/protected", passport.authenticate('imf-backend-strategy', {session: false }));
// app.use("/protected", express.static(__dirname + '/protected'));

// create a backend service endpoint
// app.get('/publicServices/generateToken', function(req, res){
// 		// use imf-oauth-user-sdk to get the authorization header, which can be used to access the protected resource/endpoint by imf-backend-strategy
// 		imf.getAuthorizationHeader().then(function(token) {
// 			res.send(200, token);
// 		}, function(err) {
// 			console.log(err);
// 		});
// 	}
// );

// //create another backend service endpoint, and protect it with imf-backend-strategy
// app.get('/protectedServices/test', passport.authenticate('imf-backend-strategy', {session: false }),
// 		function(req, res){
// 			res.send(200, "Successfully access to protected backend endpoint.");
// 		}
// );

//Personality insights service
var pi_credentials = extend({
    version: 'v2',
    url: 'https://gateway.watsonplatform.net/personality-insights/api',
    username: '2dd1c243-5b01-42e8-9e03-adb9c5e186cf',
    password: 'UWSvOnPgJv6I'
}, bluemix.getServiceCreds('Personality Insights-e4')); // VCAP_SERVICES


var personalityInsights = new watson.personality_insights(pi_credentials);

// render index page
app.get('/', function(req, res) {
  res.render('index', { content: dummy_text });
});

app.post('/', function(req, res) {
  personalityInsights.profile(req.body, function(err, profile) {
    if (err) {
      if (err.message){
        err = { error: err.message };
      }
      return res.status(err.code || 500).json(err || 'Error processing the request');
    }
    else
      return res.json(profile);
  });
});

app.post('/summary', function(req, res) {
  
  personalityInsights.profile(req.body, function(err, profile){
    if (err) 
    {
      if (err.message){
        err = { error: err.message };
      }
    
        return res.status(err.code || 500).json(err || 'Error processing the request');
    }
    else{
      // alert("In else part");
        var summary = demo.showTextSummary(profile);
  // function(err, summary) {
  //   if (err) {
  //     if (err.message){
  //       err = { error: err.message };
  //     }
  //     return res.status(err.code || 500).json(err || 'Error processing the request');
  //   }
  //   else
       return res.send(summary);
    }
   });
});

/*
app.post('/visualization', function(req, res) {
  
  personalityInsights.profile(req.body, function(err, profile){
    if (err) 
    {
      if (err.message){
        err = { error: err.message };
      }
    
        return res.status(err.code || 500).json(err || 'Error processing the request');
    }
    else{
      
        var visual = demo.showVizualization(profile);
  // function(err, summary) {
  //   if (err) {
  //     if (err.message){
  //       err = { error: err.message };
  //     }
  //     return res.status(err.code || 500).json(err || 'Error processing the request');
  //   }
  //   else
        res.render('index', { content: profile });
       //return res.send(summary);
    }
   });
});
*/

// var service_url = 'https://gateway.watsonplatform.net/question-and-answer-beta/api';
//   // var service_username = '46d0583a-4318-43b4-85d1-81e9bf3e02ba';;
// var service_username = '<service_username>';
// var service_password = '<service_password>';
 // if (process.env.VCAP_SERVICES) {
 //    console.log('Parsing VCAP_SERVICES');
 //    var services = JSON.parse(process.env.VCAP_SERVICES);
 //    //service name, check the VCAP_SERVICES in bluemix to get the name of the services you have
 //    var service_name = 'Question and Answer-na';
 //    //var service_name = 'Personality Insights-e4';
 //      if (services[service_name]) {
 //        var svc = services[service_name][0].credentials;
 //       service_url = svc.url;
 //        service_username = svc.username;
 //        service_password = svc.password;
 //      } 
 //      else {
 //      console.log('The service '+service_name+' is not in the VCAP_SERVICES, did you forget to bind it?');
 //      }
 //  } else {
 //  console.log('No VCAP_SERVICES found in ENV, using defaults for local development');
 //  }

var service_url = 'https://gateway.watsonplatform.net/question-and-answer-beta/api';
var service_username = '46d0583a-4318-43b4-85d1-81e9bf3e02ba';
var service_password = 'gw29u01SyW0k';


app.post('/question-answer', function(req, res){
  

  

  var auth = "Basic " + new Buffer(service_username + ":" + service_password).toString("base64");
 

  var parts = url.parse(service_url +'/v1/question/healthcare');
  var options = {
    host: parts.hostname,
    port: parts.port,
    path: parts.pathname,
    method: 'POST',
    headers: {
      'Content-Type'  :'application/json',
      'Accept':'application/json',
      'X-synctimeout' : '30',
      'Authorization' :  auth
    }
  };

  // Create a request to POST to Watson
  var watson_req = https.request(options, function(result) {
    result.setEncoding('utf-8');
    var response_string = '';

    result.on('data', function(chunk) {
      response_string += chunk;
    });
    //return res.send(response_string);
    result.on('end', function() {
      var answers_pipeline = JSON.parse(response_string),
          answers = answers_pipeline[0];
          res.json(answers);
         // return res.send('Hello');
          //return res.json(answers);
      // var answers = JSON.parse(response_string)[0];
      // var response = extend({ 'answers': answers },req.body);
      // return res.send(response);
    });
  });

  watson_req.on('error', function(e) {
    //return res.render('index', {'error': e.message});
  return res.send(e.message);
  });

  // create the question to Watson
  var questionData = {
    'question': {
      'evidenceRequest': {
        'items': 5 // the number of anwers
      },
      'questionText': req.body.questionText // the question
    }
  };

  // Set the POST body and send to Watson
  watson_req.write(JSON.stringify(questionData));
  watson_req.end();

});
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port, host);
console.log('listening at:', port);
// var port = (process.env.VCAP_APP_PORT || 3000);
// app.listen(port);
// console.log("mobile backend app is listening at " + port);