'use strict';

var nodemailer = require('nodemailer'),
	aws        = require('./aws.lib'),
	config     = require('../config');

var transporter = nodemailer.createTransport({
	SES: aws.ses
});

function sendMail(to, subject, html, cb) {
	if(Array.isArray(config.testEmails) && config.testEmails.length) {
		to = config.testEmails.join(', ');
	}

	transporter.sendMail({
		from:    config.AWS.SES.from,
		to:      to,
		subject: subject,
		html:    html
	}, function(err, info) {
		if(err) {
			// temporarily checks if the error message is caused by the 'sandbox' mode
			// in which the aws ses currently is. If so, send the e-mail do the
			// default configured e-mail.
			if(err.message && err.message.indexOf('Email address is not verified.') === 0) {
				return transporter.sendMail({
					from:    config.AWS.SES.from,
					to:      config.AWS.SES.from,
					subject: '(Sandbox) ' + subject,
					html:    html
				}, cb);
			}

			return cb(err);
		} else {
			return cb(null, info);
		}
	});
}


function regularInvitation(userEmail, userId, userName) {
	return new Promise(function(resolve, reject) {
		var url = 'http://18.231.43.57/invitation/' + userId;

		var html = '';
		html += '<p>Olá, ' + (userName || '') + '</p>';
		html += '<p>Você recebeu um convite para se cadastrar no site Contest Builder.</p>';
		html += '<p>Clique no link abaixo para definir sua senha:</p>';
		html += '<p><a href="' + url + '">' + url + '</a></p>';
		html += '<p></p>';
		html += '<p>Att,</p><p>Cristhian.</p>';

		sendMail(
			userEmail,
			'Contest Builder - Convite',
			html,
			function(err, info) {
				if(err) {
					return reject(err);
				}

				return resolve(info);
			}
		);
	});
}


module.exports = {
	sendMail:          sendMail,
	regularInvitation: regularInvitation
};
