const { sendEmail } = require("./nodemailer.config");
const { passwordResetSuccessTemplate } = require("./templates");

// إضافة دالة جديدة
exports.sendPasswordResetSuccess = async (user) => {
  const html = passwordResetSuccessTemplate(user.firstName || user.userName || "User");
  const data = {
    email: user.email,
    subject: "Password Reset Successful",
    html,
  };
  await sendEmail(data);
};
