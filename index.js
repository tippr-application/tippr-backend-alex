const express = require('express');
const requireAll = require('require-all');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const middlewareConfig = require("./middleware/index");

let _ = require('lodash'); // eslint-disable-line
const server = express();

middlewareConfig(server);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log('eztips user server running...'));

process.setMaxListeners(0);

function protected(req, res, next) {
  const { JSW_SECRET: secret } = process.env;
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if(err) {
        res.status(401).json({ message: 'Invalid token.' });
      } else {
        req.decodedToken = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'Not token provided.' });
  }
}

// loop through endpoints; eg server.get ...
const controllers = requireAll(__dirname + '/endpoints');
_.each(controllers, (endpoints, controller) => {
  _.each(endpoints, (definition, endpoint) => {
    
    const args = [definition.handler];
    if (definition.protected) {
      args.unshift(protected);
      console.log(`${endpoint}: ${definition.url} | requiresAuth`);
    }else{
      console.log(`${endpoint}: ${definition.url}`);
    }
    args.unshift(`${definition.url}`);

    //for chatter, later on, need to add a role check (eg admin) as another arg here
    server[definition.type.toLowerCase()].call(server, ...args);
  });
});

/*
const controllers = requireAll(__dirname + '/endpoints');
_.each(controllers, (endpoints, controller) => {
  _.each(endpoints, (definition, endpoint) => {
    
    const args = [definition.handler];
    if (definition.protected) {
      args.unshift(protected);
      console.log(`${endpoint}: /api/${controller}${definition.url} | requiresAuth`);
    }else{
      console.log(`${endpoint}: /api/${controller}${definition.url}`);
    }
    args.unshift(`/api/${controller}${definition.url}`);

    //for chatter, later on, need to add a role check (eg admin) as another arg here
    server[definition.type.toLowerCase()].call(server, ...args);
  });
});
 */
