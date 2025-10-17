import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const sendEmail = async (options)=>{
    const mailGenrator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager App",
            link: "https://taskmanagerapp.com",
        },
    })
    const emailTextual = mailGenrator.generatePlaintext(options.mailgencontent);
    
    const emailHTML = mailGenrator.generateHtml(options.mailgencontent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
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
