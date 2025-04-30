import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';


const emailHtml = fs.readFileSync('src/services/verifyEmail.html', 'utf-8');
const emailText = fs.readFileSync('src/services/verifyEmail.txt', 'utf-8');
//compile template using handlebars
const compileHtmlTemplate = handlebars.compile(emailHtml);
const compileTextTemplate = handlebars.compile(emailText);


const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function  sendVerificationemail(name,email,token,verificationTokenExpiry){

  const verificationLink = `http://yourdomain.com/api/v1/auth/verify-email/${encodeURIComponent(token)}`;

  const mailOption={
    user:name,
    email,
    verificationToken:token,
    validity:verificationTokenExpiry,
    verificationLink,
    year:new Date().getFullYear(),

  }

  const info = await transport.sendMail({
    from: `LeetLab<mdshahilfb786@gmail.com>`,
    to: email,
    subject: `Verify Your Account`,
    text: compileTextTemplate(mailOption),
    html: compileHtmlTemplate(mailOption),
    headers: {
        'X-Priority': '1', // High priority
        'X-Mailer': 'YourCompanyMailer'
    }
  });
  console.log(`Mail Send to successfully to ${email} Id is ${info.messageId}`);
}

export default sendVerificationemail;