var Xray = require('x-ray');
var r = require('request');
var x = Xray();
var async = require('async');
var deleteKey = require('key-del')
var _ = require('lodash')

exports.getInfo = function(title, cb) {
    r('http://www.omdbapi.com/?t=' + title, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = deleteKey(JSON.parse(body), ['Rated', 'Writer', 'Language', 'Country', 'Awards', 'Poster', 'Metascore', 'imdbVotes', 'imdbID', 'Type', 'Response'])
            cb(null, data);
        } else {
            cb("No movie found, try again");
        }
    })
}

exports.getRandom = function(hindi, cb) {
    if (hindi) {
        x('http://www.imdb.com/list/ls070983731/', {
            moviename: x('div.info b', ['a'])
        })(function(err, obj) {
            cb(null, JSON.parse(obj));
        });
    } else {
        async.waterfall([
                function(callback) {
                    x('http://agoodmovietowatch.com/random/',  {
                        netflix : 'div.playnow a.netflixl@href',
                        amazon : 'div.playnow a.amazonl@href',
                        moviename : '.moviename'
                    })(function(err, obj) {
                        console.log(obj);
                        callback(null, obj);
                    })
                },
                function(arg1, callback) {
                    r('http://www.omdbapi.com/?t=' + arg1.moviename, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                          var finalData = JSON.parse(body);
                          if(arg1.netflix)
                            finalData.netflix = arg1.netflix;
                          if(arg1.amazon)
                            finalData.amazon = arg1.amazon;
                            callback(null, finalData);
                        } else {
                            callback(null, "No movie found, try again");
                        }
                    })
                }
            ],
            function(err, result) {
                if (result) {
                    var data = deleteKey(result, ['Rated', 'Writer', 'Language', 'Country', 'Awards', 'Poster', 'Metascore', 'imdbVotes', 'imdbID', 'Type', 'Response'])
                    cb(null, data);
                } else {
                    cb(null, {});
                }

            });

    }
};

exports.getMovieByGenre = function(genre, callback) {
    var data = _.random(1, 2);
console.log(genre);
    async.waterfall([
            function(callback) {
                x('http://agoodmovietowatch.com/genre/' + genre + '/page/' + data, {
                    moviename: x('h2.entry-title', ['a']),
                    link: x('h2.entry-title', ['a@href'])
                })(function(err, obj) {
                    var data = _.random(1, 5);

                    x(obj.link[data], {
                        netflix: 'div.playnow a.netflixl@href',
                        amazon: 'div.playnow a.amazonl@href',
                        moviename: '.moviename'
                    })(function(err, obj) {
                        callback(null, obj);
                    })
                })
            },
            function(arg1, callback) {
                var val = arg1.moviename.split('(')[0];
                if (val.indexOf('[') > -1) {
                    val = val.moviename.split(']')[1];
                }
                r('http://www.omdbapi.com/?t=' + val, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        body = JSON.parse(body)
                        if (arg1.amazon) {
                            body.amazon = arg1.amazon
                        };
                        if (arg1.netflix) {
                            body.netflix = arg1.netflix
                        };
                        console.log(body)
                        callback(null, body);
                    } else {
                        callback(null, "No movie found, try again");
                    }
                })
            }
        ],
        function(err, result) {
            if (result) {
                var data = deleteKey(result, ['Rated', 'Writer', 'Language', 'Country', 'Awards', 'Poster', 'Metascore', 'imdbVotes', 'imdbID', 'Type', 'Response'])
                console.log(data);
                callback(null, data);
            } else {
                callback(null, {});
            }

        });

};

exports.getMovieByMood = function(mood, callback) {
    var data = _.random(1, 2);

    async.waterfall([
            function(callback) {
                x('http://agoodmovietowatch.com/mood/' + mood + '/page/' + data, {
                    moviename: x('h2.entry-title', ['a']),
                    link: x('h2.entry-title', ['a@href'])
                })(function(err, obj) {
                    var data = _.random(1, 5);

                    x(obj.link[data], {
                        netflix: 'div.playnow a.netflixl@href',
                        amazon: 'div.playnow a.amazonl@href',
                        moviename: '.moviename'
                    })(function(err, obj) {
                        callback(null, obj);
                    })
                })
            },
            function(arg1, callback) {
              console.log(arg1);
                var val = arg1.moviename.split('(')[0];
                if (val.indexOf('[') > -1) {
                    val = val.moviename.split(']')[1];
                }
                r('http://www.omdbapi.com/?t=' + val, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        body = JSON.parse(body)
                        if (arg1.amazon) {
                            body.amazon = arg1.amazon
                        };
                        if (arg1.netflix) {
                            body.netflix = arg1.netflix
                        };
                        console.log(body)
                        callback(null, body);
                    } else {
                        callback(null, "No movie found, try again");
                    }
                })
            }
        ],
        function(err, result) {
            if (result) {
                var data = deleteKey(result, ['Rated', 'Writer', 'Language', 'Country', 'Awards', 'Poster', 'Metascore', 'imdbVotes', 'imdbID', 'Type', 'Response'])
                console.log(data);
                callback(null, data);
            } else {
                callback(null, {});
            }

        });

};

exports.getNewReleases = function(cb) {
    r({url :'https://api.cinemalytics.com/v1/movie/releasedthisweek?auth_token=DE2627F667D29C96E7B83783DADEF311',
json: true},  function(error, response, body) {
        if (!error && response.statusCode == 200) {

            cb(null, body);
        } else {
            cb("No movie found, try again");
        }
    })
}

exports.nextRelease = function(cb) {
    var url = "https://api.cinemalytics.com/v1/movie/nextchange?auth_token=DE2627F667D29C96E7B83783DADEF311";
    r({
        url : url,
        json : true
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(null, body);
        } else {
            cb("No movie found, try again");
        }
    })
}
