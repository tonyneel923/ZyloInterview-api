var express = require('express');
var axios = require('axios');
var app = express();

var config = require('./config');
var utils = require('./utils');

// needed to handle json body in request
app.use(express.json());
// needed for cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// caught /stocks/ because it felt more elegant than just return html get Error
// which is default for express when request is not handled by any endpoint
app.get(['/stocks/:stockSymbol', '/stocks/'],  async(req, res) => {
  const stockSymbol = req.params && req.params.stockSymbol;
  if (!stockSymbol) return res.status(400).send({ error: 'Please Enter a Stock Symbol' });
  try {
    // get daily stock data for stockSymbol user entered
    const response = await axios.get(
      `${config.rootApi}function=${config.apiMethod('daily')}&symbol=${stockSymbol}&apikey=${config.apiKey}`
    );
    const data = response && response.data;

    // handle error
    const error = data["Error Message"];
    if (error) return res.status(400).send({ error: 'Please Enter Correct Stock Symbol' });

    return res.send(data["Time Series (Daily)"]);
  } catch (error) {
    // api service always responds with 200
    // even when unsuccesful
    // handle error inside of try
    console.log(error);
    return res.status(500).send({ error: 'Oops! Something went wrong. Please try again.' });
  }
});

app.get('/favorites', async(req, res) => {
  try {
    const favorites = await utils.readFile('./favorites.csv');

    // get todays stock info for favorites
    const response = await axios.get(
      `${config.rootApi}function=${config.apiMethod('batch')}&symbols=${favorites}&apikey=${config.apiKey}`
    );
    const data = response && response.data;

    // only error that should happen with api is an empty quotes array
    // which would happen if there are no favorites
    const error = data["Error Message"];
    if (error) return res.status(404).send({ error: 'You have no favorites saved' });

    return res.send(data["Stock Quotes"]);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Oops! Something went wrong. Please try again.' });
  }
});

// limit user to 5 saved favorites
app.post('/favorites', async(req, res) => {
  const favoriteToAdd = req.body && req.body.favorite;
  // should never happen
  if (!favoriteToAdd) return res.status(400).send({ error: 'Please Enter a Favorite' });
  try {
    const favorites = await utils.readFile('./favorites.csv');
    const newFavorites = favorites ? `${favorites},${favoriteToAdd}` : favoriteToAdd;
    const newFavoritesLength = newFavorites.split(',').length;
    if (newFavoritesLength > 5) return res.status(400).send({ error: 'Maximum of 5 favorites' });

    const response = await utils.writeFile('./favorites.csv', newFavorites);

    return res.send({
      favorites: newFavorites
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Oops! Something went wrong. Please try again.' });
  }
});

app.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});
