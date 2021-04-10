const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fake database to avoid the work of conguring one
var db = {
  movies: [
    {
      id: 1,
      title: 'Joker',
    },
    {
      id: 2,
      title: 'Batman: The Dark Knight',
    },
    {
      id: 3,
      title: 'Limitless',
    },
  ],
};

app.get('/movies', (req, res) => {
  // Sempre retornar o status code da requisição
  res.json(db.movies);
  res.sendStatus(200);
});

app.get('/movies/:id', (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var id = parseInt(req.params.id);
    // Percorre o array e encontra o filme que possui esse id
    var movie = db.movies.find((movie) => movie.id == id);
    if (movie != undefined) {
      res.json(movie);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.post('/movie', (req, res) => {
  var { id, title } = req.body;
  if (isNaN(id)) {
    res.sendStatus(400);
  } else {
    db.movies.push({
      id,
      title,
    });
    res.json(db);
  }
});

app.listen(5500, () => {
  console.log('Api rodando');
});
