const keys = require('./keys');
const redis = require('redis');

const redisOptions = {
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
};

if (keys.redisTls) {
  redisOptions.tls = {};
}

const redisClient = redis.createClient(redisOptions);
const sub = redisClient.duplicate();

redisClient.on('error', (err) => console.error('Redis client error', err));
sub.on('error', (err) => console.error('Redis subscriber error', err));

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
