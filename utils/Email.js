const nodemailer = require ("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.userName = user.userName;
    this.from = `Zero Hunger Initiative <${process.env.EMAIL_FROM2}> `;
  }
  
  async newTransport() {
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :( " + err);
        }
        resolve(token);
      });
    });
      
    const transporter =  nodemailer.createTransport({
      service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.SENDER_EMAIL,
          accessToken,
          clientId: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        }
    });
    return transporter;
        //if(process.env === "production") {}
    /*return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });*/
  }
  
  async send(subject) {
    // 1) Creating email body
    const text = `
    Use this link to reset your password ${this.url}
    `;
    
    const html = `
      <div>
        <p>Your password reset link</p>
        <a href="${this.url}">Reset Password</a>
      </div>
      <div>
        <p>if the button above is not clickable, Copy the below link</p>
        <p>${this.url}</p>
      </div>
    `;
    
    // 2) Define the mail options
    const mailOption = {
      from: this.from,
      to: this.to,
      subject: subject,
      text,
      html
    };
    
    // 3) Send the mail
    const createTransort =  await this.newTransport();
    await createTransort.sendMail(mailOption);

  };
  
  async sendResetPasswordLink() {
    await this.send('Your password reset link, valid for (20 minutes');
  }
};