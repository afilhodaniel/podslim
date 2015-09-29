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
          status: 200,
          total: 0,
          episodes: []
        };

        json.total = result.rss.channel[0].item.length; 
        
        for(var i = 0; i < json.total; i++) {
          episode = {
            title: '',
            description: '',
            date: '',
            duration: '',
            mp3: '',
            size: ''
          }

          if(result.rss.channel[0].item[i].title) {
            episode.title = result.rss.channel[0].item[i].title[0];
          } else {
            episode.title = null;
          }

          if(result.rss.channel[0].item[i].description) {
            episode.description = result.rss.channel[0].item[i].description[0];
          } else {
            episode.description = null;
          }

          if(result.rss.channel[0].item[i].pubDate) {
            episode.date = result.rss.channel[0].item[i].pubDate[0];
          } else {
            episode.date = null;
          }

          if(result.rss.channel[0].item[i]['itunes:duration']) {
            episode.duration = result.rss.channel[0].item[i]['itunes:duration'][0];
          } else {
            episode.duration = null;
          }

          if(result.rss.channel[0].item[i]['enclosure']) {
            if(result.rss.channel[0].item[i]['enclosure'][0].$.url) {
              episode.mp3 = result.rss.channel[0].item[i]['enclosure'][0].$.url;
            } else {
              episode.mp3 = null;
            }

            if(result.rss.channel[0].item[i]['enclosure'][0].$.length) {
              episode.size = result.rss.channel[0].item[i]['enclosure'][0].$.length;
            } else {
              episode.size = '0';
            }
          }

          json.episodes[i] = episode;
        }

        res.setHeader('Content-Type', 'application/json');

        res.send(json);
      });
    });
  });
});

module.exports = router;
