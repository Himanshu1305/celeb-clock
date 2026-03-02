interface ReEngagementEmailProps {
  firstName: string;
  appUrl?: string;
}

export function renderReEngagementEmail({ firstName, appUrl = 'https://cosmicage.app' }: ReEngagementEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We Miss You!</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f4c91,#44b0a1);padding:40px 40px 30px;text-align:center;">
              <p style="margin:0 0 8px;font-size:36px;">👋</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">We Miss You, ${firstName}!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">A lot has happened since you last visited</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="margin:0 0 24px;color:#646b78;font-size:15px;line-height:1.6;">
                It's been a while! We've been busy adding new content and features. Here's what you might have missed:
              </p>

              <!-- Birthday hook -->
              <div style="padding:20px;background:linear-gradient(135deg,#fdf4ff,#fae8ff);border-radius:10px;border:1px solid #e9d5ff;text-align:center;margin-bottom:24px;">
                <p style="margin:0;color:#7c3aed;font-size:16px;font-weight:600;">
                  🎂 Your next birthday is coming up!
                </p>
                <p style="margin:8px 0 0;color:#646b78;font-size:13px;">
                  Come see your live countdown, exact age milestones, and which celebrities share your special day.
                </p>
              </div>

              <!-- Features to explore -->
              <h3 style="margin:0 0 16px;color:#282d33;font-size:17px;font-weight:600;">Explore what's waiting for you:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;background-color:#f7f8fa;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="font-size:20px;">📝</td>
                        <td style="padding-left:10px;">
                          <strong style="color:#282d33;font-size:14px;">New Blog Articles</strong>
                          <p style="margin:4px 0 0;color:#646b78;font-size:13px;">Fun facts about birthdays, zodiac deep-dives, and age milestone celebrations.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#f7f8fa;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="font-size:20px;">⭐</td>
                        <td style="padding-left:10px;">
                          <strong style="color:#282d33;font-size:14px;">Celebrity Birthday Matches</strong>
                          <p style="margin:4px 0 0;color:#646b78;font-size:13px;">Discover famous people born on the same day as you — from actors to scientists.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#f7f8fa;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="font-size:20px;">♈</td>
                        <td style="padding-left:10px;">
                          <strong style="color:#282d33;font-size:14px;">Zodiac & Birthstone Profiles</strong>
                          <p style="margin:4px 0 0;color:#646b78;font-size:13px;">Your complete cosmic profile — traits, compatibility, lucky numbers, and gemstone meaning.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#f7f8fa;border-radius:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="font-size:20px;">💎</td>
                        <td style="padding-left:10px;">
                          <strong style="color:#282d33;font-size:14px;">Birthstone Guide</strong>
                          <p style="margin:4px 0 0;color:#646b78;font-size:13px;">Learn the history and healing properties of your birth month's gemstone.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f4c91,#44b0a1);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                      Come Back and Explore →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Cosmic Age. All rights reserved.</p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                You received this email because you have a Cosmic Age account. <a href="${appUrl}/profile" style="color:#9ca3af;">Manage preferences</a>
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
