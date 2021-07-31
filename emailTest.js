const Email = require('email-templates');

const email = new Email({
    message: {
        from: 'jonathan.perry1994@gmail.com'
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    },
});

email
  .send({
    template: 'mars',
    message: {
      to: 'jonathan.perry1994@gmail.com'
    },
    locals: {
      name: 'Elon'
    }
  })
  .then(console.log)
  .catch(console.error);