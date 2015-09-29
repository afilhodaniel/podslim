var http = require('http');
var xml2js = require('xml2js');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send(':)');
});

router.post('/', function(req, res, next) {
  var url = req.body.url.replace('https', 'http');

  http.get(url, function(response) {
    var xml = '';

    response.on('data', function(data) {
      xml += data;
    });

    response.on('end', function() {
      var parser = new xml2js.Parser();

      parser.parseString(xml, function(err, result) {
        var json = {
          total: 0,
          episodes: []
        };

        json.total = result.rss.channel[0].item.length; 
        
        for(var i = 0; i < json.total; i++) {
          json.episodes[i] = {
            title: result.rss.channel[0].item[i].title[0],
            description: result.rss.channel[0].item[i].description[0],
            date: result.rss.channel[0].item[i].pubDate[0],
            duration: result.rss.channel[0].item[0]['itunes:duration'][0],
            mp3: result.rss.channel[0].item[0]['enclosure'][0].$.url,
            size: result.rss.channel[0].item[0]['enclosure'][0].$.length
          };
        }

        res.setHeader('Content-Type', 'application/json');

        res.send(json);
      });
    });
  });
});

module.exports = router;
