export const resetPassword = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>EduLearn : Password Reset</title>
  </head>  
  <body>
    <p>Dear {{fullName}},</p>
    <p>Please find below your link for resetting the password to your account. This link is valid for the next 60 minutes </p>
    <p>OTP: {{resetLink}}</p><br/><br/>
    
    <p>Regards,<br/>
      EduLearn Team <br/>
      This is system generated email. Do not reply to this mail.</p>
    </body>
  </body>
</html>`;
