const path = require('path');
const nodemailer = require("nodemailer");
const handlebars = require('express-handlebars');
const nodemailerExpressHandlebars = require('nodemailer-express-handlebars');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  transporter.use('compile', nodemailerExpressHandlebars({
    viewEngine: handlebars.create({
      partialsDir: 'partials/',
      defaultLayout: false
    }),
    viewPath: path.resolve(__dirname, '../views')
  }))

  const message = {
    from: `${process.env.FROM_NAME} \n <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    template: options.template,
    context: options.context
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail;