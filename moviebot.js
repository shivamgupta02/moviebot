var Botkit = require('Botkit');
var os = require('os');
var request = require('request');
var scrapper = require('./scrapper.js');

var controller = Botkit.slackbot({
  debug: false
});

var pageCounter = 1;
var askWatch, askMovie;
var bot = controller.spawn({
  token: 'xoxb-54233352291-wHiSR58UsAVzpKeL8g9uT0d5'
}).startRTM();

controller.hears(['hello', 'hi', 'hey', 'hola'], 'direct_message,direct_mention,mention', function(bot, message) {
  request({
    url : 'https://slack.com/api/users.info',
    method: 'POST',
    json: true,
    form:
    {"token": "xoxb-54233352291-wHiSR58UsAVzpKeL8g9uT0d5","user": message.user}
  }, function(er, response, body){

    if(!er && response.statusCode === 200){
      // bot.reply(message, 'Hello ' + response.body.user.name + '!!');

      bot.reply(message, 'Hey ' + response.body.user.name + ' I\'m moviebot! I\'ll help you to find a movie to watch.');
      bot.reply(message, 'So, What would you like to do first?');
      // bot.reply(message, '`Demo` to see how will I help you.');
      // bot.reply(message, '`Help` to see what commands you can give me & I work without \'Sudo\'');
      bot.reply(message, ' Get a `random` suggestion ? Go according to your `mood` ? Or any preferable `genre`?')
      // bot.reply(message, ' Or just say `random` and i\'ll find a good movie for you.')

    }
    else{
      console.log(response);
      bot.reply(message, "hi");
    }
  });
});

controller.hears(['random', '^.*random.*$'], 'direct_message,direct_mention,mention', function(bot, message) {


  askWatch = function(response, convo){
    convo.ask('So you gonna watch this movie ?', [
      {
        pattern: 'yes',
        callback: function(response, convo) {
          convo.next();
        }
      },
      {
        pattern: 'no',
        callback: function(response, convo) {
          convo.stop();
        }
      },
      {
        default: true,
        callback: function(response, convo) {
          convo.stop();
        }
      }
    ]);
  };
  askMovie = function(response, convo){
    scrapper.getRandom(null, function(err, moviedata){
      convo.say('Here\'s a movie.');
      convo.say(moviedata.Title + '(' + moviedata.Year + ')');
      convo.say('Imdb:' + moviedata.imdbRating);
      user = {
        id: message.user,
      };
      user.info = moviedata;
      controller.storage.users.save(user, function(err, id) {});
      convo.ask('Do you want more `info` on this movie or see the `next` suggestion.', [
        {
          pattern: 'info',
          callback: function(response, convo) {
            controller.storage.users.get(message.user, function(err, user) {
              console.log('hell')
              console.log(user.info);
              Object.keys(user.info).forEach(function(key){
                convo.say('*' + key + '*' + '\t' + user.info[key]);
                if(key === Object.keys(user.info)[Object.keys(user.info).length - 1]){
                  askWatch(response, convo);
                }
              })
            })
            convo.next();
          }
        },
        {
          pattern: 'next',
          callback: function(response, convo) {
            scrapper.getRandom(null, function(er,mvdata){
              convo.say('OK, one more.');
              convo.say(mvdata.Title + '(' + mvdata.Year + ')');
              convo.say('Imdb:' + mvdata.imdbRating);
              user.info = mvdata;
              convo.repeat();
              convo.next();
            })
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.stop();
          }
        }
      ]);
      convo.on('end', function(convo) {
        if (convo.status == 'completed') {
          bot.reply(message, 'OK! Enjoy your movieiiii.');
        } else {
          // this happens if the conversation ended prematurely for some reason
          bot.reply(message, 'Didn\'t like the random suggestions? You can also try `mood` or `genre` command.');
        }
      });
    });
  };

  bot.startConversation(message, askMovie);
});

controller.hears(['mood.*','mood', '^.*happy.*$', '^.*funny.*$', '^.*romantic.*$', '^.*smart.*$', '^.*goofy.*$'], 'direct_message,direct_mention,mention', function(bot, message) {

  var msg = message.text;
  if(msg.indexOf('happy') > -1){
    var moodName = 'happy'
  }
  else if(msg.indexOf('funny') > -1){
    var moodName = 'funny'
  }
  else if(msg.indexOf('romantic') > -1){
    var moodName = 'romantic'
  }
  else if(msg.indexOf('smart') > -1){
    var moodName = 'smart'
  }
  else if(msg.indexOf('goofy') > -1){
    var moodName = 'goofy'
  }
  else{
    var moodName = 'original'
  }
  if(msg.indexOf('happy') < 0 && msg.indexOf('romantic') < 0 && msg.indexOf('funny') < 0 && msg.indexOf('smart') < 0 && msg.indexOf('goofy') < 0){
    bot.reply(message, 'No, that\'s not a mood. Here are some moods which you can try:');
    bot.reply(message, '`happy` \t `funny` \t `romantic` \t `smart` \t `goofy`');
  }
  else{
    askWatch = function(response, convo){
      convo.ask('So you gonna watch this movie ?', [
        {
          pattern: 'yes',
          callback: function(response, convo) {
            convo.next();
          }
        },
        {
          pattern: 'no',
          callback: function(response, convo) {
            convo.stop();
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.stop();
          }
        }
      ]);
    };
    askByMood = function(response, convo){
      console.log(moodName);

      scrapper.getMovieByMood(moodName, function(err, moviedata){
        console.log(moviedata);
        convo.say('Here\'s a movie.');
        convo.say(moviedata.Title + '(' + moviedata.Year + ')');
        convo.say('Imdb:' + moviedata.imdbRating);
        user = {
          id: message.user,
        };
        user.info = moviedata;
        controller.storage.users.save(user, function(err, id) {});
        convo.ask('Do you want more `info` on this movie or see the `next` suggestion.', [
          {
            pattern: 'info',
            callback: function(response, convo) {
              controller.storage.users.get(message.user, function(err, user) {
                console.log('hell')
                console.log(user.info);
                Object.keys(user.info).forEach(function(key){
                  convo.say('*' + key + '*' + '\t' + user.info[key]);
                  if(key === Object.keys(user.info)[Object.keys(user.info).length - 1]){
                    askWatch(response, convo);
                  }
                })
              })
              convo.next();
            }
          },
          {
            pattern: 'next',
            callback: function(response, convo) {
              scrapper.getRandom(null, function(er,mvdata){
                convo.say('OK, one more.');
                convo.say(mvdata.Title + '(' + mvdata.Year + ')');
                convo.say('Imdb:' + mvdata.imdbRating);
                user.info = mvdata;
                convo.repeat();
                convo.next();
              })
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              convo.stop();
            }
          }
        ]);
        convo.on('end', function(convo) {
          if (convo.status == 'completed') {
            bot.reply(message, 'OK! Enjoy your movieiiii.');
          } else {
            // this happens if the conversation ended prematurely for some reason
            bot.reply(message, 'So Sorry. What would make you happy now');
            bot.reply(message, '`happy` \t `funny` \t `romantic` \t `smart` \t `goofy`');
          }
        });
      });
    };

    bot.startConversation(message, askByMood);
  }
});

controller.hears(['genre.*','genre', '^.*action.*$', '^.*comedy.*$', '^.*romance.*$', '^.*documentary.*$', '^.*drama.*$'], 'direct_message,direct_mention,mention', function(bot, message) {
  var msg = message.text;
  if(msg.indexOf('action') > -1){
    var genreName = 'action'
  }
  else if(msg.indexOf('comedy') > -1){
    var genreName = 'comedy'
  }
  else if(msg.indexOf('romance') > -1){
    var genreName = 'romance'
  }
  else if(msg.indexOf('documentary') > -1){
    var genreName = 'documentary'
  }
  else if(msg.indexOf('drama') > -1){
    var genreName = 'drama'
  }
  else{
    var genreName = 'mystery'
  }
  if(msg.indexOf('action') < 0 && msg.indexOf('drama') < 0 && msg.indexOf('romance') < 0 && msg.indexOf('documentary') < 0 && msg.indexOf('comedy') < 0 ){
    bot.reply(message, 'No, that\'s not a genre. Here are some moods which you can try:');
    bot.reply(message, '`action` \t `drama` \t `romance` \t `documentary` \t `comedy`');
  }
  else{
console.log(genreName);
    askWatch = function(response, convo){
      convo.ask('So you gonna watch this movie ?', [
        {
          pattern: 'yes',
          callback: function(response, convo) {
            convo.next();
          }
        },
        {
          pattern: 'no',
          callback: function(response, convo) {
            convo.stop();
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.stop();
          }
        }
      ]);
    };
    askByGenre = function(response, convo){
      scrapper.getMovieByGenre(genreName, function(err, moviedata){
        convo.say('Here\'s a movie.');
        convo.say(moviedata.Title + '(' + moviedata.Year + ')');
        convo.say('Imdb:' + moviedata.imdbRating);
        user = {
          id: message.user,
        };
        user.info = moviedata;
        controller.storage.users.save(user, function(err, id) {});
        convo.ask('Do you want more `info` on this movie or see the `next` suggestion.', [
          {
            pattern: 'info',
            callback: function(response, convo) {
              controller.storage.users.get(message.user, function(err, user) {
                console.log('hell')
                console.log(user.info);
                Object.keys(user.info).forEach(function(key){
                  convo.say('*' + key + '*' + '\t' + user.info[key]);
                  if(key === Object.keys(user.info)[Object.keys(user.info).length - 1]){
                    askWatch(response, convo);
                  }
                })
              })
              convo.next();
            }
          },
          {
            pattern: 'next',
            callback: function(response, convo) {
              scrapper.getRandom(null, function(er,mvdata){
                convo.say('OK, one more.');
                convo.say(mvdata.Title + '(' + mvdata.Year + ')');
                convo.say('Imdb:' + mvdata.imdbRating);
                user.info = mvdata;
                convo.repeat();
                convo.next();
              })
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              convo.stop();
            }
          }
        ]);
        convo.on('end', function(convo) {
          if (convo.status == 'completed') {
            bot.reply(message, 'OK! Enjoy your movieiiii.');
          } else {
            // this happens if the conversation ended prematurely for some reason
            bot.reply(message, 'So Sorry. What type of movie would you like ?');
            bot.reply(message, '`action` \t `drama` \t `romance` \t `documentary` \t `comedy`');
          }
        });
      });
    };

    bot.startConversation(message, askByGenre);
  }
});

controller.hears(['^.*now.*$', '^.*playing.*$', '^.*theaters.*$'], 'direct_message,direct_mention,mention', function(bot, message) {
  scrapper.getNewReleases(function(err, data){
    console.log(typeof data);
    console.log(data);
    data.forEach(function(movie){
      bot.reply(message, movie.Title);
    });
  })
});

controller.hears(['^.*upcoming.*$', '^.*movies.*$'], 'direct_message,direct_mention,mention', function(bot, message) {
  scrapper.nextRelease(function(err, data){
    data.forEach(function(movie){
      bot.reply(message, movie.Title);
    });
  })
});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.startConversation(message, function(err, convo) {

    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
          convo.say('Bye!');
          convo.next();
          setTimeout(function() {
            process.exit();
          }, 3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function(response, convo) {
          convo.say('*Phew!*');
          convo.next();
        }
      }
    ]);
  });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
'direct_message,direct_mention,mention', function(bot, message) {

  var hostname = os.hostname();
  var uptime = formatUptime(process.uptime());

  bot.reply(message,
    ':robot_face: I am a bot named <@' + bot.identity.name +
    '>. I have been running for ' + uptime + ' on ' + hostname + '.');

  });

  function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'hour';
    }
    if (uptime != 1) {
      unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
  }
