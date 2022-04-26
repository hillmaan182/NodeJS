const express = require('express');
const bodyParser = require('body-parser');
const conn = require('./config/database');
const res = require('express/lib/response');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// insert user
app.post('/api/user', (req, res) => {
    const data = { ...req.body };
    const querySql = 'INSERT INTO master_user SET ?';
	const queryUsrBirthday = 'INSERT INTO message_user (username, message, send_date, send_flag) VALUES ?'
    const queryMsg = 'SELECT * FROM master_message';
    // jalankan query
    conn.query(querySql, data, (err, rows, field) => {
		if (err) {
			return res.status(500).json({ message: 'Failed Save User!', error: err });
		}
		conn.query(queryMsg, (err, rows2, field2) => {
			if (err) {
				return res.status(500).json({ message: 'There is No Master MEssage', error: err });
			}
			if (rows2 && rows2.length ) {
				Object.keys(rows2).forEach(function(key) {
					var row = rows2[key];
						//set message for birthday
						var newMessage = row.message_content1;
						newMessage += ' ';
						newMessage += req.body.firstname;
						newMessage += ' ';
						newMessage += req.body.lastname;
						newMessage += ' ';
						newMessage += row.message_content2;
		
						//set send_date birthday
						let date_ob = new Date(req.body.birthdate);
						let year = new Date().getFullYear();
						let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
						let date = ("0" + date_ob.getDate()).slice(-2);
						const newBirthDate = year + "-" + month + "-" + date;
			
						//Values to insert message_user
						var values = [[req.body.username , newMessage , newBirthDate, 0]];

						conn.query(queryUsrBirthday, [values] , (err, rows3, field3) => {
							// error handling
							if (err) {
								return res.status(500).json({ message: 'Failed Save MEssage User!', error: err });
							}
							// success - 200
							
						});
				});
			}
		});
		res.status(200).json({ success: true, message: 'Success Save User!' });
    });
});

// delete user
app.delete('/api/user/:id', (req, res) => {
    // query search and delete
    const querySearch = 'SELECT * FROM master_user WHERE id = ?';
    const queryDelete = 'DELETE FROM master_user WHERE id = ?';

    conn.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Error on Delete User', error: err });
        }

        // if id found
        if (rows.length) {
            // query delete
            conn.query(queryDelete, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error on Delete User', error: err });
                }

                //success - 200
                res.status(200).json({ success: true, message: 'Success Delete User!' });
            });
        } else {
            return res.status(404).json({ message: 'User not found!', success: false });
        }
    });
});

// update user
app.put('/api/user/:id', (req, res) => {
    //query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM master_user WHERE id = ?';
    const queryUpdate = 'UPDATE master_user SET ? WHERE id = ?';

    conn.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Error on Update User', error: err });
        }

        // if query rows > 0
        if (rows.length) {
            // run query update
            conn.query(queryUpdate, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Error on Update User', error: err });
                }

                //success - 200
                res.status(200).json({ success: true, message: 'Success Update Data User!' });
            });
        } else {
            return res.status(404).json({ message: 'User not found!', success: false });
        }
    });
});

// get all user
app.get('/api/user', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM master_user WHERE id = 2';
    const queryMsg = 'SELECT * FROM master_message';


    // jalankan query
    conn.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Error on Get User', error: err });
        }

        conn.query(queryMsg, (err, rows2, field2) => {
        	if (err) {
            	return res.status(500).json({ message: 'Error on Get Message', error: err });
        	}
        
        	// success - 200
        	var newMessage = rows2[0]['message_content1'];
        	newMessage += ' ';
        	newMessage += rows[0]['firstname'];
        	newMessage += ' ';
        	newMessage += rows[0]['lastname'];
        	newMessage += ' ';
        	newMessage += rows2[0]['message_content2'];

        	res.status(200).json({ success: true, message: newMessage});
        });
        
    });
});

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

function hello(name) {
     console.log("hello " + name);
     var myInt = setInterval(function (){
     	sendMessage();
     }, 5000);
}

function sendMessage(){
	 const queryMsg = 'SELECT * FROM message_user WHERE send_flag = 0';
	 const queryUsr = 'SELECT * FROM master_user WHERE username = ?';
	 const queryUpdateFlag = 'UPDATE message_user SET send_flag = ? WHERE id = ?';
	 const querySearchMsg = 'SELECT * FROM message_user WHERE id = ?';
	  conn.query(queryMsg, (err, rows, field) => {
		  	if (err) {
	            console.log(err);
	        } else {
	        	if (rows && rows.length ) {
				  Object.keys(rows).forEach(function(key) {
					var row = rows[key];

					var userBirthDate = row.send_date;
					var checkDate = new Date(userBirthDate);
					var username = row.username;
					var msg = row.message;
					var idMsg = row.id;
					
					conn.query(queryUsr, username, (err, rows2, field2) => {
						if(err){
							console.log(err);
						} else {
							if (rows2 && rows2.length){
								var location = rows2[0]['location'];
								let userTz = new Date().toLocaleString("en-US", { timeZone: location });
								let userDate = new Date(userTz);
								let year = userDate.getFullYear();
								let month = ("0" + (userDate.getMonth() + 1)).slice(-2);
								let date = ("0" + userDate.getDate()).slice(-2);
								let checkUserDate = year + "-" + month + "-" + date;
								let userHours = ("0" + userDate.getHours()).slice(-2);

								let birthdayYear = checkDate.getFullYear();
								let birthdayMonth = ("0" + (checkDate.getMonth() + 1)).slice(-2);
								let birthdayDay = ("0" + checkDate.getDate()).slice(-2);
								let birthdaySendDate = birthdayYear + "-" + birthdayMonth + "-" + birthdayDay;

								if (birthdaySendDate == checkUserDate)
								{
									if (userHours == '09') {
										//console.log("sent to hook.bin");
										
										const https = require("https");
									
										const datap = JSON.stringify(msg);

										const options = {
											hostname: "hookb.in",
											port: 443,
											path: "/jePxD8rozMH9dlMMmOx2",
											method: "POST",
											headers: {
											"Content-Type": "application/json",
											"Content-Length": datap.length
											}
										}
										
										const req = https.request(options, (res) => {
											console.log(`status: ${res.statusCode}`);
										});

										 req.write(datap);
										 req.end();
										 conn.query(querySearchMsg, idMsg , (err, rows3, field3) => {
												// error handling
											if (err) {
												return res.status(500).json({ message: 'Error on Get User', error: err });
											} else {
												if (rows3 && rows3.length){
													conn.query(queryUpdateFlag, [1, idMsg], (err, rows4, field4) => {
													// error handling
														if (err) {
															console.log(err);
														} 
													});
												}
											}
										});
									}
								}
							}
						}
					});
				  });

	        	} 
	        }

	  });
}
hello();

