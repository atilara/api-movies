const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

// Credencial secreta (baú)
const jwtsecret = 'laksjdfhalskdjfhaklsdjhfaklsjdhf';

// Vai permitir acesso de sites externos a essa api
app.use(cors());

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
  users: [
    {
      id: 1,
      name: 'Átila R',
      email: 'atila.testando@gmail.com',
      password: 'tEStAnDo_AuTEnTicaCAo',
    },
    {
      id: 2,
      name: 'Átila R',
      email: 'atila@gmail.com',
      password: 'senhafacil',
    },
  ],
};

// Middleware para realizar a autenticação utilizando o jwt
function authenticate(req, res, next) {
  // Recebe através do auth presente no postman / insomnia, que utiliza o token para autenticar
  const authToken = req.headers['authorization'];
  if (authToken != undefined) {
    // Remove a palavra bearer da string recebida
    const bearer = authToken.split(' ');
    const token = bearer[1];

    // Verifica se o token é válido, recebe o token, segredo utilizado para gerar e o callback que retorna o conteúdo do token
    jwt.verify(token, jwtsecret, (error, data) => {
      if (error) {
        res.status(401);
        res.json({ error: 'Token inválido' });
      } else {
        // Cria variáveis na requisição
        req.token = token;
        req.loggedUser = { id: data.id, email: data.email };
        next();
      }
    });
  } else {
    res.status(401);
    res.json({ error: 'Token inválido' });
  }
}

app.get('/movies', authenticate, (req, res) => {
  // Acessando a variável criada dentro do middleware
  res.json(db.movies);
});

app.get('/movie/:id', authenticate, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var id = parseInt(req.params.id);
    // Percorre o array e encontra o filme que possui esse id
    var movie = db.movies.find((movie) => movie.id == id);
    if (movie != undefined) {
      res.json(movie);
    } else {
      res.sendStatus(404);
    }
  }
});

app.post('/movie', authenticate, (req, res) => {
  var { id, title } = req.body;
  if (isNaN(id)) {
    res.sendStatus(400);
  } else {
    db.movies.push({
      id,
      title,
    });
    res.sendStatus(200);
  }
});

app.delete('/movie/:id', authenticate, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var id = parseInt(req.params.id);
    // Percorre o array e encontra o id do filme que seja igual ao parametro
    var index = db.movies.findIndex((movie) => movie.id == id);
    // Se findIndex retornar -1 quer dizer que não existe um filme correspondente
    if (index == -1) {
      res.sendStatus(404);
    } else {
      // Remove 1 elemento a partir do index encontrado
      db.movies.splice(index, 1);
      res.sendStatus(200);
    }
  }
});

app.put('/movie/:id', authenticate, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var id = parseInt(req.params.id);
    // Percorre o array e encontra o filme que possui esse id
    var movie = db.movies.find((movie) => movie.id == id);
    if (movie != undefined) {
      var { title } = req.body;
      if (title != undefined) {
        movie.title = title;
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.post('/authenticate', (req, res) => {
  var { email, password } = req.body;
  if (email != undefined) {
    var user = db.users.find((user) => user.email == email);
    if (user != undefined) {
      if (user.password == password) {
        // Gera um token (chave)
        // Se passam os dados que serão salvos, a credencial secreta (baú), e o tempo para expirar e seu callback
        jwt.sign(
          { id: user.id, email: user.email },
          jwtsecret,
          {
            expiresIn: '24h',
          },
          (error, token) => {
            if (error) {
              res.status(400);
              res.json({ error: 'Falha' });
            } else {
              res.status(200);
              res.json({ token });
            }
          },
        );
      } else {
        res.status(401);
        res.json({ error: 'Autenticação não realizada' });
      }
    } else {
      res.status(404);
      res.json({ error: 'Usuário não existe na base de dados' });
    }
  } else {
    res.status(400);
    res.json({ error: 'Email inválido' });
  }
});

app.listen(5550, () => {
  console.log('Api rodando');
});
