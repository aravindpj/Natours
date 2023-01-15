const nodemailer = require('nodemailer');
const pug = require('pug');
const Totext=require('html-to-text')
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Aravind <${process.env.SENDGRID_EMAIL_FROM}>`;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service:'SendGrid',
        auth:{
          user:process.env.SENDGRID_USER,
          pass:process.env.SENDGRID_USERPASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //send the acti=ual email
  async send(template, subject) {
    //1) render html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2) Define email option
    const mailOptions = {
      from: process.env.SENDGRID_EMAIL_FROM,
      to: this.to,
      subject,
      html,
      text:Totext.convert(html)
    };
    //3) create transport and send email
    await this.newTransporter().sendMail(mailOptions)
  }

  async sendWelcome(){
    await this.send('welcome','Welcome to the Natours Family')
  }
  async sendResetPassword(){
    await this.send('passwordReset','This Token will be expired at 10 min!')
  }
};

// const sendEmail = async function (options) {
//   // 1) create Transport
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // 2) Define email options
//   const mailOptions = {
//     from: 'Aravind <hello@aravind.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   // 3) Actually Send email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
