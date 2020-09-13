const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  let cookie = req.cookie;
  if ( cookie.sessionId === undefined ) {

    models.Sessions.create()
      .then( newHash => models.Sessions.get({ id: newHash.insertId }))
      .then( hashData => res.cookie( 'sessionId', hashData.hash ) )
      .then( test => console.log( test, cookie ) );

  } else {
    console.log('inside else block of CreateSession');
    let curSeshId = req.cookie.sessionId;


    models.Sessions.get({ hash: curSeshId })
      .then( sesh => {
        if ( curSeshId !== sesh.hash ) {
          // send /signUp
        } else {
          // send /create
        }
      } );
  }
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
  next();

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

