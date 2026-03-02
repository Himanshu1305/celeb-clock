interface WelcomeEmailProps {
  firstName: string;
  appUrl?: string;
}

export function renderWelcomeEmail({ firstName, appUrl = 'https://cosmicage.app' }: WelcomeEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Cosmic Age!</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f4c91,#1a6bc4);padding:40px 40px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🌌 Cosmic Age</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your journey through time starts here</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 16px;color:#282d33;font-size:22px;font-weight:600;">Welcome aboard, ${firstName}! 🎉</h2>
              <p style="margin:0 0 24px;color:#646b78;font-size:15px;line-height:1.6;">
                We're thrilled to have you! Cosmic Age is your personal time explorer — discover fascinating insights about your age, find your celebrity birthday twin, and uncover your cosmic profile.
              </p>

              <!-- Features -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:16px;background-color:#f7f8fa;border-radius:10px;border-left:4px solid #0f4c91;margin-bottom:12px;">
                    <strong style="color:#0f4c91;font-size:15px;">🎂 Age Calculator</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">See your exact age down to the second — in years, months, days, hours, and even heartbeats.</p>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
                <tr>
                  <td style="padding:16px;background-color:#f7f8fa;border-radius:10px;border-left:4px solid #44b0a1;">
                    <strong style="color:#44b0a1;font-size:15px;">⭐ Celebrity Match</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">Discover which famous people share your birthday — actors, athletes, scientists, and more.</p>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
                <tr>
                  <td style="padding:16px;background-color:#f7f8fa;border-radius:10px;border-left:4px solid #8b5cf6;">
                    <strong style="color:#8b5cf6;font-size:15px;">♈ Zodiac & Birthstone</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">Explore your zodiac sign traits, lucky numbers, and your unique birthstone's meaning.</p>
                  </td>
                </tr>
              </table>

              <!-- Blog mention -->
              <p style="margin:0 0 28px;color:#646b78;font-size:14px;line-height:1.6;">
                📚 Don't miss our <a href="${appUrl}/blog" style="color:#0f4c91;text-decoration:underline;font-weight:600;">latest blog articles</a> — from birthday fun facts to zodiac deep-dives and age milestones.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f4c91,#1a6bc4);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Start Exploring →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Premium teaser -->
              <div style="margin-top:28px;padding:20px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:10px;border:1px solid #fde68a;text-align:center;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                  ✨ <strong>Want to go deeper?</strong> Our Premium Life Expectancy Calculator reveals personalized health insights based on your lifestyle.
                  <a href="${appUrl}/upgrade" style="color:#d4a017;font-weight:700;text-decoration:underline;">Learn more</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Cosmic Age. All rights reserved.</p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                You received this email because you signed up for Cosmic Age.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
