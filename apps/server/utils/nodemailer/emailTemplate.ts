export const WELCOME_EMAIL = `
<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 0; margin: 0;">
  <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="20" style="background: #ffffff; border-radius: 8px;">
            <tr>
              <td style="text-align: center;">
                <h2 style="color: #333; margin-bottom: 10px;">Welcome to Our Platform!</h2>
                <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                  We're excited to have you on board. To get started, your login password is below.
                </p>

                <p 
                  style="display: inline-block; background-color: #4CAF50; color: #fff; padding: 12px 20px; 
                  text-decoration: none; font-size: 16px; border-radius: 5px;">
                  {PASSWORD}
                </p>

                <p style="color: #777; font-size: 14px; margin-top: 25px;">
                  Welcome Onboard!
                </p>
              

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  If you did not create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
export const VERIFY_OTP = `
<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 0; margin: 0;">
  <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 0; background-color: #f5f5f5;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="20" style="background: #ffffff; border-radius: 8px;">
            <tr>
              <td style="text-align: center;">
                <h2 style="color: #333; margin-bottom: 10px;">Your Verification Code</h2>
                <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                  Use the OTP below to verify your email address:
                </p>

                <div style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; 
                  color: #fff; font-size: 20px; border-radius: 5px; font-weight: bold; letter-spacing: 3px;">
                  {OTP}
                </div>

                <p style="color: #777; font-size: 14px; margin-top: 25px;">
                  This code will expire soon. If you did not request this, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
export const PASSWORD_RESET_OTP = `
<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 0; margin: 0;">
  <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 0; background-color: #f5f5f5;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="20" style="background: #ffffff; border-radius: 8px;">
            <tr>
              <td style="text-align: center;">
                <h2 style="color: #333; margin-bottom: 10px;">Password Reset Request</h2>
                <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                  Use the OTP below to reset your password:
                </p>

                <div style="display: inline-block; padding: 12px 20px; background-color: #FF9800; 
                  color: #fff; font-size: 20px; border-radius: 5px; font-weight: bold; letter-spacing: 3px;">
                  {OTP}
                </div>

                <p style="color: #777; font-size: 14px; margin-top: 25px;">
                  This code will expire shortly. If you did not request a password reset, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const TEMPLATE_MAP = {
  "welcome": WELCOME_EMAIL,
  "email-otp-verification": VERIFY_OTP,
  "reset-password": PASSWORD_RESET_OTP
}

export default TEMPLATE_MAP;