module.exports = {
	// secret used to encrypt the user password.
    secret: 'abc_whatever',

    // port the api will listen to.
    port: 3010,

    // url to the database.
    databasePath: 'mongodb://localhost:27017/contest_builder',

    // if not in production, these are the addresses that will receive the e-mails.
    testEmails: [],

    // aws configuration.
    AWS: {
    	accessKeyId:     'a',
    	secretAccessKey: 'b',
    	region:          'c',

    	SES: {
    		// sender of e-mails.
    		from: 'someone@somewhere.com'
    	}
    }
};
