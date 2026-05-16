const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const redisOptions = {
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
};

if (keys.redisTls) {
  redisOptions.tls = {};
}

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false },
});

pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient(redisOptions);
const redisPublisher = redisClient.duplicate();

redisClient.on('error', (err) => console.error('Redis client error', err));
redisPublisher.on('error', (err) => console.error('Redis publisher error', err));

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  try {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to fetch saved indexes' });
  }
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: 'Failed to fetch calculated values' });
    }

    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = parseInt(req.body.index, 10);

  if (Number.isNaN(index)) {
    return res.status(400).send('Index must be a number');
  }

  if (index > 40) {
    return res.status(422).send('Index too high');
  }

  try {
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to save index' });
  }
});

app.listen(5000, (err) => {
  console.log('Listening');
});
