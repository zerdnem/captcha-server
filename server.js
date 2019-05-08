const crypto = require('crypto');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const NodeCache = require('node-cache');

const cache = new NodeCache();

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json())

const genCaptcha = (req, res, next) => {
  const charsArray =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*';

  const captcha = new Array();
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * charsArray.length + 1);
    if (captcha.indexOf(charsArray[index]) == -1)
      captcha.push(charsArray[index]);
    else i--;
  }
  const id = Date.now().toString();
  cache.set(id, {captcha: captcha.join('')});
  res.json({id, captcha: captcha.join('')});
};

const validateCaptcha = (req, res, next) => {
  const key = req.params.id;
  const solution = req.body.solution;
  cache.get(key, (err, data) => {
      console.log(JSON.stringify(solution))
      console.log(JSON.stringify(data))
    if (!err) {
      if (data == undefined) {
        res.json({success: !!data});
      } else {
        if (solution === data.captcha.toLowerCase()) {
          data.token = crypto.randomBytes(16).toString('hex');
          cache.del(key);
          res.json({success: !!data, token: data.token});
        } else {
          res.json({error: 'Wrong captcha'});
        }
      }
    }
  });
};

app.use('/enter/:id', validateCaptcha);
app.use('/create', genCaptcha);
app.get('/', (req, res) => res.send('<pre>Nothing to see here</pre>'));


module.exports = app;
