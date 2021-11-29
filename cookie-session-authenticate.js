function auth(req, res, next) {
    if (!req.session.user) {
      var authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).send({ auth: false, message: 'No authentication header' });
      }

      console.log(new Buffer.from(authHeader.split(" ")[1], "base64").toString());
  
      var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
        .toString()
        .split(":");
      var username = auth[0];
      var password = auth[1];
  
      console.log(`Username is ${username}`);
      console.log(`Password is ${password}`);

      if (username == "admin" && password == "p@ssword") {
        req.session.user = 'admin';
        next();
      } else {
        res.status(401).send({ auth: false, message: `Failed to authenticate ${username}.` });
      }
    }else{
        console.log(`User is ${req.session.user}`);
        if(req.session.user == 'admin'){
            next();
        }else{
          res.status(401).send({ auth: false, message: `Failed to authenticate ${req.session.user}.` });
        }
    }
  }

  function loggedIn(req, res, next) {
    var error = {};

    if(req.session.user) {
      error = {
        "msg":"User already logged in"
      }
    };
    return error;
  }
  
  module.exports = auth;