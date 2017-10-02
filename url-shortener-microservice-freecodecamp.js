const MongoClient = require('mongodb').MongoClient
const express = require('express');

const app = express()

const uri = process.env.URI

const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

app.get('/', function(req, res) {
    if (req.query.urlShortener) {
        let urlShortener = req.query.urlShortener;
        if (urlShortener.match(regexURL)) {
            MongoClient.connect(uri, function(err, db) {
                db.collection('Urls').insertOne({
                    original_url:urlShortener,
                    short_url:makeid()
                }, function(err, url) {
                    db.close();
                });
                db.collection('Urls').findOne({original_url:urlShortener}).then(function(item) {
                    db.close();
                    res.json({original_url: item.original_url, short_url: req.hostname + '/' + item.short_url}) 
                  });
              }); 
        } else {
           res.json({error: 'invalid URL'})
        }
    } else {
        res.set('Content-Type', 'text/plain');
        res.send('usage:\n\tnew url:\n\t\thttp://<hostname>/?urlShortener=http://expressjs.com\n\tshortened:\n\t\thttp://<hostname>/6KE74')
    }
})

app.get('/:url', function (req, res) {
    MongoClient.connect(uri, function(err, db) {
        db.collection('Urls').findOne({short_url:req.params.url}).then(function(item) {
            if (item != null){
                res.redirect(item.original_url)
            }
            db.close();
        });
    }); 
});

app.listen(process.env.PORT || 3000);
