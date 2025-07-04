import nodemailer from "nodemailer";
import handlebars from "handlebars";
import { emailHost, emailPort, emailService } from "../../config/emailConfig";

export const emailingService = async (params: {
  email_id: string;
  data: any;
  template: string;
  subject: string;
  choice: string;
}): Promise<boolean> => {
  const { email_id, data, template, subject, choice } = params;
  return new Promise((resolve, reject) => {
    const email_transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      service: emailService,
      secure: false,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const compileTemplate = (template: string) => handlebars.compile(template);
    const email_template = compileTemplate(template);
    let email_details;

    switch (choice) {
      case `reset_password`: {
        email_details = {
          from: process.env.EMAIL_ID,
          to: [email_id],
          subject: subject,
          context: {
            fullName: `${data.fullName}`,
            resetLink: `${data.resetLink}`,
          },
        };
        break;
      }
    }
    if (email_details === undefined) {
      reject("Template not found");
    }
    email_details &&
      email_transporter.sendMail(
        {
          ...email_details,
          html: email_template(email_details.context),
        },
        async (err) => {
          if (err) {
            console.log("Error Occurs", err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
  });
};
