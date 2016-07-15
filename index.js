const express = require('express');
const app = express();
const googleImages = require('google-images');
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
// mongodb://yimin:duyutian520@ds025752.mlab.com:25752/img-search-log
const dburi = process.env.MONGO_URI; 
const port = process.env.PORT || 8080;

let client = googleImages('008450044041122935554:o8llqhemmy8', 'AIzaSyCFN_UI2XLLmezSjnhWlIjDFpyp1vukt5c');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/imagesearch/:search', (req, res) => {
	
	let keywords = req.params.search;
	let offset = req.query.offset;

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
					const n = docs.length > 10 ? 10 : docs.length;
					let resData = docs.splice(0, n).map((elem) => {
						return { term: elem.term, when: elem.when };
					});

					res.send(resData);
				}
			})
		}
	})
});


app.listen(port);
