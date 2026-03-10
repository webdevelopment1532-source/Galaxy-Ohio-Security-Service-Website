const mariadb = require('mariadb');

mariadb.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'galaxyapp',
  password: 'change-me',
  database: 'galaxysecuritydb'
}).then(conn => {
  console.log('Connected!');
  conn.end();
}).catch(err => {
  console.error('Connection failed:', err);
});
