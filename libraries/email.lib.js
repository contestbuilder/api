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

module.exports = {
	sendMail: sendMail
};
