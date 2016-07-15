var express = require('express');
var app = express();
var googleImages = require('google-images');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
// mongodb://yimin:duyutian520@ds025752.mlab.com:25752/img-search-log
var dburi = process.env.MONGO_URI; 
var port = process.env.PORT || 8080;

var client = googleImages('008450044041122935554:o8llqhemmy8', 'AIzaSyCFN_UI2XLLmezSjnhWlIjDFpyp1vukt5c');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/imagesearch/:search', (req, res) => {
	
	var keywords = req.params.search;
	var offset = req.query.offset;

	client.search(keywords)
	      .then(function(images) {
	      	res.send(images.splice(0, offset));
	      });

	mongoClient.connect(dburi, (err, db) => {
		if(err)
			res.sendStatus(500);
		else {
			db.collection('searchlog').insert({ term: keywords, when: new Date().toTimeString() })
		}
	})
});

app.get('/api/latest/imagesearch/', (req, res) => {
	mongoClient.connect(dburi, (err, db) => {
		if(err)
			res.sendStatus(500);
		else {
			db.collection('searchlog').find({}).toArray((err, docs) => {
				if(err)
					res.sendStatus(500);
				else {
					var n = docs.length > 10 ? 10 : docs.length;
					var resData = docs.splice(0, n).map((elem) => {
						return { term: elem.term, when: elem.when };
					});

					res.send(resData);
				}
			})
		}
	})
});


app.listen(port);
