const Email = require('email-templates'),
    dotenv = require('dotenv');
dotenv.config();
// If you are getting authentication problems while using gmail as the mail
// transport host, go to your Gmail account, click 'Manage your Google Account',
// click the 'Security' tab, then scroll down to the bottom and switch
// 'Less secure app access' to on
function sendTokenEmail(templateName, userEmail, token) {
    const email = new Email({
        message: {
            from: 'jonathan.perry1994@gmail.com'
        },
        // uncomment below to send emails in development/test env:
        send: true,
        // preview: true,
        transport: {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        },
        views: {
            options: {
                extension: 'ejs' // <---- HERE
            }
        }
    })

    return email
        .send({
            template: templateName,
                message: {
                    to: userEmail,
                },
                locals: token,
                
            })
        .then((res) => {
            console.log('res.originalMessage', res.originalMessage)
        })
}
  module.exports = sendTokenEmail;