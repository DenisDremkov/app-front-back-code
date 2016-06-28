
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://nodejsdremkov%40gmail.com:angular2016@smtp.gmail.com');
var mailOptions = {
	from: '"nodejsdremkov" <nodejsdremkov@gmail.com>',
	to: 'denisdremkovweb@gmail.com',
	subject: 'server error!',
	text: '',
	html: ''
};

module.exports = function(err) {
	mailOptions.html = "<p>" + JSON.stringify(err) + "</p>"
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	})
};