const express = require('express');
var morgan = require('morgan');
var morganBody = require('morgan-body');
const bodyParser = require('body-parser');
var rp = require('request-promise');

const app = express();
const port = 3000;

app.use(morgan('combined'));
morganBody(app);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function getToken() {
  var options = {
    method: 'POST',
    url: 'https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/token/grant',
    headers: {
      password: 'sandboxTestPassword',
      username: 'sandboxTestUser'
    },
    json: { app_key: 'sandboxAppKay', app_secret: 'sandboxAppSecret' }
  };

  const tokenObj = await rp(options);
  return tokenObj.id_token;
}

app.post('/createRequest', async (req, res) => {
  const reqBody = req.body;
  const token = await getToken();

  var options = {
    method: 'POST',
    url: 'https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/payment/create',
    headers: {
      'x-app-key': 'sandboxAppKay',
      authorization: token
    },
    json: reqBody
  };

  const body = await rp(options);
  res.json(body);
});

app.post('/executeRequest', async (req, res) => {
  const paymentID = req.body.paymentID;
  const token = await getToken();

  var options = {
    method: 'POST',
    url: `https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/payment/execute/${paymentID}`,
    headers: {
      'x-app-key': 'sandboxAppKay',
      authorization: token
    }
  };

  const body = await rp(options);
  res.json(body);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));