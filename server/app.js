const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieParser = require('./middleware/cookieParser');

console.log('cookieParser: ', cookieParser);

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(cookieParser);
app.use(Auth.createSession);
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
(req, res) => {

  /**
 * get req.cookie
 * check for session id !== undefined
 * if ( undefined ) {
 *    generate a session with a unique hash
 *    store hash in database
 *    set session id prop on clients computer // look this up in express <-----
 *      // probably create headder === set cookie then set this new session hash to cookie header
 * } else {
 *    extract session id from req.cookie
 *    check against sessions table in database
 *    if ( !valid ) {
 *      redirect to '/signup'
 *    } else {
 *      // TO_DO;
 *    }
 * }
 */



  // console.log(req.cookie);
  // console.log(utils.createRandom32String());

  res.render('index');
});

app.get('/login',
(req, res) => {
  res.render('login');
});

app.get('/signup',
(req, res) => {
  res.render('signup');
});

app.get('/create',
(req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/login',
  (req, res, next) => {
    let info = req.body;
    const {username, password} = info;
    models.Users.get( username )
      .then( results => models.Users.compare( password, results.password, results.salt ) )
      .then( bool => {
        if ( bool ) {
          res.redirect('/create');
        } else {
          res.send('NOOOOOO');
        }
      });
  });


app.post('/signup',
  (req, res, next) => {
    let info = req.body;
    models.Users.create(info);
    res.send('OK');
  // var url = req.body.url;
  // if (!models.Links.isValidUrl(url)) {
  //   // send back a 404 if link is not valid
  //   return res.sendStatus(404);
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
