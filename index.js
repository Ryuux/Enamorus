const crypto = require('crypto');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();

const generateShortURL = () => {
  const length = 6;
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(length);
  let shortURL = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    shortURL += characters.charAt(randomIndex);
  }
  return shortURL;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new sqlite3.Database('url_shortener.db');

db.run('CREATE TABLE IF NOT EXISTS urls (long_url TEXT UNIQUE, short_url TEXT)');

rl.question('Enter the long URL: ', (longURL) => {
  rl.close();

  let shortURL;
  do {
    shortURL = generateShortURL();
  } while (checkExistingShortURL(shortURL));

  db.run('INSERT INTO urls (long_url, short_url) VALUES (?, ?)', [longURL, shortURL], (error) => {
    if (error) {
      console.error('Error storing the URL in the database:', error.message);
    } else {
      console.log(`Short URL: http://myshortener.com/${shortURL}`);
    }
    db.close();
  });
});

const checkExistingShortURL = (shortURL) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT short_url FROM urls WHERE short_url = ?', [shortURL], (error, row) => {
      if (error) {
        console.error('Error checking the URL in the database:', error.message);
        reject(false);
      } else {
        resolve(row !== undefined);
      }
    });
  });
};
