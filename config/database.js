const mysql = require('mysql');
// buat konfigurasi koneksi
const koneksi = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'birthday'
});
// koneksi database
koneksi.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});
module.exports = koneksi;