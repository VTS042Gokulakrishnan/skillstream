const usermodel = require("../models/candidateModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployerModel = require("../models/employerModel");
const VendorModel = require("../models/vendorModel");
const nodemailer = require("nodemailer");

async function sendEmail(to, region) {
  try {
    const transporter =
      region === "United States"
        ? nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
              user: "info@skillstreamjobs.us",
              pass: "rsgdtwzstknlblcn",
            },
          })
        : nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "support@skillstreamjobs.ca",
              pass: "yzsz ockc eiql oyqj",
            },
          });
    const url =
      region === "Canada"
        ? "https://skillstreamjobs.ca"
        : region === "United States"
        ? process.env.USWEBSITE
        : region === "India"
        ? "https://www.skillstreamlabs.com"
        : null;
    const mailOptions = {
      from: `SKILLSTREAM  ${
        region === "United States"
          ? "info@skillstreamjobs.us"
          : "support@skillstreamjobs.ca"
      }`,
      to,
      subject: "Password Reset Successful",
      html: ` 
    <!DOCTYPE html>
    <html>
    <head>
        <title>Password Reset Successful</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center; }
            .container { background-color: #ffffff; padding: 20px; max-width: 600px; margin: 20px auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
            .logo { width: 150px; margin-bottom: 15px; }
            .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
         .button-container {
    text-align: center;
    margin-top: 20px;
}
            .header { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 15px;text-align: center; }
            .content { font-size: 16px; color: #333; text-align: center; padding: 10px 20px; }
            .button { display: inline-block; background-color: #1e90ff; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 15px; }
            .footer { font-size: 14px; color: #666; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
           <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
            <h2 class="header">Your Password Has Been Reset</h2>
            <p class="content">
                Hello,  
                Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <div class="button-container">
            <a href=${url} class="button">Log In Now</a>
            </div>
            <p class="content">
                If you didn’t reset your password, please contact our support team immediately.
            </p>
            <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
        </div>
    </body>
    </html>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
}
const controller = {
  userId: "",
  async forgotPasssowrd(req, res) {
    try {
      const { email, role, region } = req.body;
      // console.log(email);
      if (email && role) {
        // const findUser = await usermodel.findOne({ email: email });
        // const findEmployer = await EmployerModel.findOne({ email: email });
        if (role === "Candidate") {
          const findUser = await usermodel.findOne({ email: email });
          if (findUser) {
            jwt.sign(
              { userId: findUser.userId },
              process.env.SECRET_KEY,
              {
                expiresIn: "30m",
              },
              (err, emailToken) => {
                const url = `${process.env.SERVER}/api/v1/password/forgotPassword/reset/${emailToken}`;
                let mailTransporter =
                  region === "United States"
                    ? nodemailer.createTransport({
                        host: "smtp.office365.com",
                        port: 587,
                        secure: false,
                        auth: {
                          user: "info@skillstreamjobs.us",
                          pass: "rsgdtwzstknlblcn",
                        },
                      })
                    : nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: "support@skillstreamjobs.ca",
                          pass: "yzsz ockc eiql oyqj",
                        },
                      });
                let code = Math.floor(100000 + Math.random() * 900000);
                const html = `
                <!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            width: 150px;
            margin-bottom: 15px;
        }
            .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #333;
            text-align: center;
            padding: 10px 20px;
        }
        .code-container {
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #1e90ff;
            background-color: #f0f8ff;
            padding: 10px 20px;
            display: inline-block;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
        <h2 class="header">Reset Your Password</h2>
        <p class="content">
            We received a request to reset your password. Use the security code below to proceed with changing your password.
        </p>
        <div class="code-container">
            <div class="code">${code}</div>
        </div>
        <p class="content">
            If you didn’t request this, please ignore this email. Your account is safe.
        </p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
                `;

                let details = {
                  from: `SKILLSTREAM  ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: findUser.email,
                  subject: "Password Reset",
                  text: "Password Reset",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    // console.log(`Email Sent:${info.response}`);
                    const storingCode = await usermodel.updateOne(
                      { email: findUser.email },
                      { $set: { securityCode: code } }
                    );
                    res.status(200).json({
                      message: "Password Reset LinK Sent to your Mail",
                      userId: findUser.userId,
                      role: findUser.role,
                      status: true,
                    });
                    this.user_id = findUser.userId;
                  })
                  .catch((err) =>
                    console.log(
                      "Error in sending the mail for Password Reset Link::",
                      err
                    )
                  );
              }
            );
          } else {
            return res
              .status(403)
              .json({ message: "User does not Exists", status: false });
          }
          // console.log(Math.floor(100000 + Math.random() * 900000));
        } else if (role === "Employer") {
          const findEmployer = await EmployerModel.findOne({ email: email });
          if (findEmployer) {
            jwt.sign(
              { userId: findEmployer.userId },
              process.env.SECRET_KEY,
              {
                expiresIn: "30m",
              },
              (err, emailToken) => {
                const url = `${process.env.SERVER}/api/v1/password/forgotPassword/reset/${emailToken}`;
                let mailTransporter =
                  region === "United States"
                    ? nodemailer.createTransport({
                        host: "smtp.office365.com",
                        port: 587,
                        secure: false,
                        auth: {
                          user: "info@skillstreamjobs.us",
                          pass: "rsgdtwzstknlblcn",
                        },
                      })
                    : nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: "support@skillstreamjobs.ca",
                          pass: "yzsz ockc eiql oyqj",
                        },
                      });
                let code = Math.floor(100000 + Math.random() * 900000);
                const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            width: 150px;
            margin-bottom: 15px;
        }
            .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #333;
            text-align: center;
            padding: 10px 20px;
        }
        .code-container {
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #1e90ff;
            background-color: #f0f8ff;
            padding: 10px 20px;
            display: inline-block;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
        <h2 class="header">Reset Your Password</h2>
        <p class="content">
            We received a request to reset your password. Use the security code below to proceed with changing your password.
        </p>
        <div class="code-container">
            <div class="code">${code}</div>
        </div>
        <p class="content">
            If you didn’t request this, please ignore this email. Your account is safe.
        </p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
`;

                let details = {
                  from: `SKILLSTREAM  ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: findEmployer.email,
                  subject: "Password Reset",
                  text: "Password Reset",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    //   console.log(`Email Sent:${info.response}`);
                    const storingCode = await EmployerModel.updateOne(
                      { email: findEmployer.email },
                      { $set: { securityCode: code } }
                    );
                    res.status(200).json({
                      message: "Password Reset LinK Sent to your Mail",
                      userId: findEmployer.userId,
                      role: findEmployer.role,
                      status: true,
                    });
                    this.user_id = findEmployer.userId;
                  })
                  .catch((err) =>
                    console.log(
                      "Error in sending the mail for Password Reset Link::",
                      err
                    )
                  );
              }
            );
          } else {
            return res
              .status(403)
              .json({ message: "User does not Exists", status: false });
          }
        } else if (role === "Vendor") {
          const findEmployer = await VendorModel.findOne({ email: email });
          if (findEmployer) {
            jwt.sign(
              { userId: findEmployer.userId },
              process.env.SECRET_KEY,
              {
                expiresIn: "30m",
              },
              (err, emailToken) => {
                const url = `${process.env.SERVER}/api/v1/password/forgotPassword/reset/${emailToken}`;
                let mailTransporter =
                  region === "United States"
                    ? nodemailer.createTransport({
                        host: "smtp.office365.com",
                        port: 587,
                        secure: false,
                        auth: {
                          user: "info@skillstreamjobs.us",
                          pass: "rsgdtwzstknlblcn",
                        },
                      })
                    : nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: "support@skillstreamjobs.ca",
                          pass: "yzsz ockc eiql oyqj",
                        },
                      });
                let code = Math.floor(100000 + Math.random() * 900000);
                const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            width: 150px;
            margin-bottom: 15px;
        }
            .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
        }
        .content {
            font-size: 16px;
            color: #333;
            text-align: center;
            padding: 10px 20px;
        }
        .code-container {
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #1e90ff;
            background-color: #f0f8ff;
            padding: 10px 20px;
            display: inline-block;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
        <h2 class="header">Reset Your Password</h2>
        <p class="content">
            We received a request to reset your password. Use the security code below to proceed with changing your password.
        </p>
        <div class="code-container">
            <div class="code">${code}</div>
        </div>
        <p class="content">
            If you didn’t request this, please ignore this email. Your account is safe.
        </p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
`;

                let details = {
                  from: `SKILLSTREAM  ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: findEmployer.email,
                  subject: "Password Reset",
                  text: "Password Reset",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    //   console.log(`Email Sent:${info.response}`);
                    const storingCode = await VendorModel.updateOne(
                      { email: findEmployer.email },
                      { $set: { securityCode: code } }
                    );
                    res.status(200).json({
                      message: "Password Reset LinK Sent to your Mail",
                      userId: findEmployer.userId,
                      role: findEmployer.role,
                      status: true,
                    });
                    this.user_id = findEmployer.userId;
                  })
                  .catch((err) =>
                    console.log(
                      "Error in sending the mail for Password Reset Link::",
                      err
                    )
                  );
              }
            );
          } else {
            return res
              .status(403)
              .json({ message: "User does not Exists", status: false });
          }
        } else {
          res
            .status(400)
            .json({ message: "Please Select Role", status: false });
        }
      } else {
        return res
          .status(400)
          .json({ error: "Email is required", status: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },
  async resetPasswordPage(req, res) {
    try {
      //verify the token
      jwt.verify(req.params.id, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          console.log(err);
          this.user_id = "";
        } else {
          // console.log(decoded);
          res.redirect(`${process.env.client}`);
          // res.status(200).json({ status: true, user_id: decoded.user_id });
        }
      });
    } catch (error) {
      console.log("Error in verifing the link::", error);
      res.status(500).json({ message: error.message, status: false });
    }
  },
  async updateNewPassword(req, res) {
    try {
      const { password, securityCode, region } = req.body;
      const { userId } = req.params;
      const userData = await usermodel.findOne({ userId });
      const EmployerData = await EmployerModel.findOne({ userId });
      const VendorData = await VendorModel.findOne({ userId });
      //   console.log(userData);
      //   console.log(EmployerData);
      if (userData) {
        if (securityCode === userData.securityCode) {
          const salt = await bcrypt.genSaltSync(10);
          const hashedpassword = await bcrypt.hashSync(password, salt);
          const updatePassword = await usermodel.updateOne(
            { userId: userId },
            { $set: { password: hashedpassword, securityCode: "" } }
          );
          sendEmail(userData.email, region); // Send email asynchronously, don't wait for it
          res
            .status(200)
            .json({ message: "Password Changed Successfully", status: true });
        } else {
          res.status(400).json({ message: "Invalid Code", status: false });
        }
      } else if (EmployerData) {
        if (securityCode === EmployerData.securityCode) {
          const salt = await bcrypt.genSaltSync(10);
          const hashedpassword = await bcrypt.hashSync(password, salt);
          const updatePassword = await EmployerModel.updateOne(
            { userId: userId },
            { $set: { password: hashedpassword, securityCode: "" } }
          );
          sendEmail(EmployerData.email, region); // Send email asynchronously, don't wait for it
          res
            .status(200)
            .json({ message: "Password Changed Successfully", status: true });
        } else {
          res.status(400).json({ message: "Invalid Code", status: false });
        }
      } else if (VendorData) {
        {
          if (securityCode === VendorData.securityCode) {
            const salt = await bcrypt.genSaltSync(10);
            const hashedpassword = await bcrypt.hashSync(password, salt);
            const updatePassword = await VendorModel.updateOne(
              { userId: userId },
              { $set: { password: hashedpassword, securityCode: "" } }
            );
            sendEmail(VendorData.email, region); // Send email asynchronously, don't wait for it
            res
              .status(200)
              .json({ message: "Password Changed Successfully", status: true });
          } else {
            res.status(400).json({ message: "Invalid Code", status: false });
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message, status: false });
    }
  },
};
module.exports = controller;

// else {
//   res
//     .status(404)
//     .json({ message: "User does not Exists", status: false });
// }
