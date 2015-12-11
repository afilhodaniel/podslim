var request = require('sync-request');
var xml2js = require('xml2js');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send(':)');
});

router.get('/search/:query', function(req, res, next) {
  var url = "https://itunes.apple.com/search?media=podcast&term=" + req.params.query;

  var json = {
    status: 200,
    total: 0,
    podcasts: []
  };

  var result = request('GET', url);

  if(result.statusCode == 200) {
    var body = JSON.parse(result.getBody());

    if(body && body.resultCount && body.resultCount > 0) {
        body.results.forEach(function(elem, ind) {
          var podcast = {
            id: elem.collectionId,
            thumb: elem.artworkUrl100,
            name: elem.collectionName,
            author: elem.artistName
          };

          json.podcasts[ind] = podcast;
        });

        json.total = body.resultCount;
    } else {
      json = {
        status: 400
      };
    }
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.get('/highlights/:country/:limit', function(req, res, next) {
  var url = 'https://itunes.apple.com/' + req.params.country + '/rss/toppodcasts/limit=' + req.params.limit + '/json';

  var json = {
    status: 200,
    total: 0,
    podcasts: []
  }

  var result = request('GET', url);

  if(result.statusCode == 200) {
    var body = JSON.parse(result.getBody());

    if(body.feed && body.feed.entry && body.feed.entry.length > 0) {
      json.total = body.feed.entry.length;

      body.feed.entry.forEach(function(elem, ind) {
        var podcast = {
          id: elem.id.attributes['im:id'],
          thumb: elem['im:image'][2].label,
          name: elem['im:name'].label,
          author: elem['im:artist'].label
        };

        json.podcasts[ind] = podcast;
      });
    }
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.get('/podcast/:country/:id', function(req, res, next) {
  var url = 'https://itunes.apple.com/lookup?country=' + req.params.country + '&id=' + req.params.id;

  var json = {
    status: 200,
    id: null,
    thumb: null,
    name: null,
    site: null,
    description: null,
    author: null,
    category: null,
    feed: null,
    total: 0,
    release: null,
    episodes: []
  };

  var result = request('GET', url);

  if(result.statusCode == 200) {
    var body = JSON.parse(result.getBody());

    if(body.resultCount && body.resultCount > 0) {
      json.id = body.results[0].collectionId;
      json.thumb = body.results[0].artworkUrl100;
      json.name = body.results[0].collectionName;
      json.author = body.results[0].artistName;
      json.category = body.results[0].primaryGenreName;
      json.feed = body.results[0].feedUrl;

      var result = request('GET', json.feed);

      if(result.statusCode == 200) {
        new xml2js.Parser().parseString(result.getBody(), function(err, xml) {
          if(xml && xml.rss && xml.rss.channel && xml.rss.channel.length > 0) {
            if(xml.rss.channel[0].link && xml.rss.channel[0].link.length > 0) {
              json.site = xml.rss.channel[0].link[0];
            }

            if(xml.rss.channel[0].description && xml.rss.channel[0].description.length > 0) {
              json.description = xml.rss.channel[0].description[0];
            }

            if(xml.rss.channel[0].item && xml.rss.channel[0].item.length > 0) {
              xml.rss.channel[0].item.forEach(function(elem, ind) {
                if(elem.enclosure && elem.enclosure.length > 0) {
                  if(elem.enclosure[0].$ && elem.enclosure[0].$.url) {
                    var episode = {
                      thumb: json.thumb,
                      author: json.author,
                      title: null,
                      link: null,
                      date: null,
                      description: null,
                      duration: 0,
                      size: 0,
                      mp3: elem.enclosure[0].$.url
                    };

                    if(elem.title && elem.title.length > 0) {
                      episode.title = elem.title[0];
                    }

                    if(elem.link && elem.link.length > 0) {
                      episode.link = elem.link[0];
                    }

                    if(elem.pubDate && elem.pubDate.length > 0) {
                      episode.date = new Date(elem.pubDate[0]).getTime();
                    }

                    if(elem.description && elem.description.length > 0) {
                      episode.description = elem.description[0];
                    } else if(elem['content:encoded'] && elem['content:encoded'].length > 0) {
                      episode.description = elem['content:encoded'][0];
                    }

                    if(elem['itunes:duration'] && elem['itunes:duration'].length > 0) {
                      episode.duration = elem['itunes:duration'][0];
                    }

                    if(elem.enclosure[0].$.length) {
                      episode.size = elem.enclosure[0].$.length;
                    }

                    json.episodes[ind] = episode;
                  }
                }
              });
            }

            if(json.episodes.length > 0) {
              json.episodes = json.episodes.filter(function(episode) {
                return episode != null;
              });

              json.total = json.episodes.length;
              json.release = json.episodes[0].date;
            }
          }
        });
      } else {
        json = {
          status: 400
        };
      }
    } else {
      json = {
        status: 400
      };  
    }
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.get('/podcast_feed/:id', function(req, res, next) {
  var url = 'https://itunes.apple.com/lookup?id=' + req.params.id;

  var json = {
    status: 200,
    feed: null
  };

  var result = request('GET', url);

  if(result.statusCode == 200) {
    var body = JSON.parse(result.getBody());

    if(body.resultCount && body.resultCount > 0) {
      json.feed = body.results[0].feedUrl;
    } else {
      json = {
        status: 400
      };
    }
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.post('/podcast_release', function(req, res, next) {
  var json = {
    status: 200,
    release: null
  };

  var result = request('GET', req.body.url);

  if(result.statusCode == 200) {
    new xml2js.Parser().parseString(result.getBody(), function(err, xml) {
      if(xml && xml.rss && xml.rss.channel && xml.rss.channel.length > 0) {
        if(xml.rss.channel[0].item && xml.rss.channel[0].item.length > 0) {
          if(xml.rss.channel[0].item[0].pubDate) {
            json.release = new Date(xml.rss.channel[0].item[0].pubDate[0]).getTime();
          }
        }
      }
    });
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.post('/check_feed', function(req, res, next) {
  var json = {
    status: 200,
    check: false
  };

  var result = request('GET', req.body.url);

  if(result.statusCode == 200) {
    new xml2js.Parser().parseString(result.getBody(), function(err, xml) {
      if(xml && xml.rss && xml.rss.channel && xml.rss.channel.length > 0) {
        json.check = true;
      }
    });
  } else {
    json = {
      status: 400
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

router.get('/episode', function(req, res, next) {
  res.render('episode');
});

module.exports = router;
