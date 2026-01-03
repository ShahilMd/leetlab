import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';
import { Resend } from 'resend';


const emailHtml = fs.readFileSync('src/services/verifyEmail.html', 'utf-8');
// const emailText = fs.readFileSync('src/services/verifyEmail.txt', 'utf-8');
//compile template using handlebars
const compileHtmlTemplate = handlebars.compile(emailHtml);


// const transport = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

async function  sendVerificationemail(name,email,token,verificationTokenExpiry){

  const verificationLink = `http://localhost:3000/api/v1/auth/verify-email/${email}/${encodeURIComponent(token)}`;

  const mailOption={
    user:name,
    email,
    verificationToken:token,
    validity:verificationTokenExpiry,
    verificationLink,
    year:new Date().getFullYear(),

  }

const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'LeetLab <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Account',
      html: compileHtmlTemplate(mailOption),
    });

    if (error) {
      return console.error({ error });
    }
    console.log({ data });

  // const info = await transport.sendMail({
  //   from: `LeetLab<mdshahilfb786@gmail.com>`,
  //   to: email,
  //   subject: `Verify Your Account`,
  //   text: compileTextTemplate(mailOption),
  //   html: compileHtmlTemplate(mailOption),
  //   headers: {
  //       'X-Priority': '1', // High priority
  //       'X-Mailer': 'YourCompanyMailer'
  //   }
  // });
  
}

export default sendVerificationemail;