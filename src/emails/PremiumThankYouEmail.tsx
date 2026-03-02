interface PremiumThankYouEmailProps {
  firstName: string;
  appUrl?: string;
}

export function renderPremiumThankYouEmail({ firstName, appUrl = 'https://cosmicage.app' }: PremiumThankYouEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Premium!</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header - Premium Gold -->
          <tr>
            <td style="background:linear-gradient(135deg,#92400e,#d4a017,#f59e0b);padding:40px 40px 30px;text-align:center;">
              <p style="margin:0 0 8px;font-size:36px;">👑</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Welcome to Premium!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">You've unlocked the full Cosmic Age experience</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <h2 style="margin:0 0 16px;color:#282d33;font-size:20px;font-weight:600;">Thank you, ${firstName}! 🎉</h2>
              <p style="margin:0 0 28px;color:#646b78;font-size:15px;line-height:1.6;">
                Your premium upgrade is confirmed. You now have lifetime access to everything Cosmic Age has to offer. Here's what's unlocked for you:
              </p>

              <!-- Premium Features -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${[
                  { icon: '🧬', title: 'Life Expectancy Calculator', desc: 'Personalized longevity insights based on your lifestyle, health, and habits.' },
                  { icon: '🌟', title: 'Premium Celebrity Database', desc: 'Access our full database of 10,000+ celebrity birthday matches with detailed bios.' },
                  { icon: '📊', title: 'Export Reports', desc: 'Download beautiful PDF reports of your age stats, zodiac profile, and life expectancy.' },
                  { icon: '🔔', title: 'Birthday Twin Notifications', desc: 'Get notified when a celebrity who shares your birthday is in the news.' },
                  { icon: '💬', title: 'Priority Support', desc: 'Jump to the front of the line with dedicated premium support.' },
                ].map(f => `
                  <tr>
                    <td style="padding:14px 16px;background-color:#fffbeb;border-radius:10px;border-left:4px solid #d4a017;">
                      <strong style="color:#92400e;font-size:15px;">${f.icon} ${f.title}</strong>
                      <p style="margin:5px 0 0;color:#646b78;font-size:13px;line-height:1.5;">${f.desc}</p>
                    </td>
                  </tr>
                  <tr><td style="height:10px;"></td></tr>
                `).join('')}
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${appUrl}/life-expectancy" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#f59e0b);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(212,160,23,0.3);">
                      Explore Your Life Report →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#646b78;font-size:13px;line-height:1.6;text-align:center;">
                Questions about your premium account? Simply reply to this email — we're here to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Cosmic Age. All rights reserved.</p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                You received this email because you upgraded to Cosmic Age Premium.
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
