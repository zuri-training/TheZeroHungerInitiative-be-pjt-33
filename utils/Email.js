const nodemailer = require ("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.userName = user.userName;
    this.from = `Zero Hunger Initiative <${process.env.EMAIL_FROM}> `;
  }
  
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  }
  
  async send(subject) {
    // 1) Creating email body
    const text = `
    Use this link to reset your password ${this.url}
    `;
    
    // 2) Define the mail options
    const mailOption = {
      from: this.from,
      to: this.to,
      subject: subject,
      text
    };
    
    // 3) Send the mail
    await this.newTransport().sendMail(mailOption);

  };
  
  async sendResetPasswordLink() {
    await this.send('Your password reset link, valid for (10 minutes');
  }
};