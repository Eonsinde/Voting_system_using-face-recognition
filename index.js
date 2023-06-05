const functions = require('firebase-functions');
const express = require('express'); 

const app = express();

app.use(express.static(__dirname + '/models'));

app.get('/home', (req, res) => { 
	res.sendFile( __dirname + '/index.html'); 
});

app.get('/enroll', (req, res) => {
	res.sendFile( __dirname + '/enroll.html');
});

// app.listen(5000, () => {
// 	console.log("server ruu")
// })

exports.app = functions.https.onRequest(app);
