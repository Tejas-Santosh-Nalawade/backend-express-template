// mail utility using Mailgen and Nodemailer for sending templated emails

import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager App",
            link: "https://taskmanagerapp.com",
        },
    })
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST || "sandbox.smtp.mailtrap.io",
        port: parseInt(process.env.MAILTRAP_SMTP_PORT) || 2525,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    })

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    }
    try{
        await transporter.sendMail(mail);
        console.log("Email sent successfully to ", options.email);
    }
    catch(err){
        console.error("Error sending email:", err);
    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to our application! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email address please click on the button below:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help you.",
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset your password.",
      action: {
        instructions:
          "To reset your password, please click on the button below:",
        button: {
          color: "#22BC66",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help you.",
    },
  };
};



export { emailVerificationMailgenContent, forgotPasswordMailgenContent , sendEmail };
