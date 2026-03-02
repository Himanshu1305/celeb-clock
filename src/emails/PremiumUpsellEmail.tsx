interface PremiumUpsellEmailProps {
  firstName: string;
  appUrl?: string;
}

export function renderPremiumUpsellEmail({ firstName, appUrl = 'https://cosmicage.app' }: PremiumUpsellEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unlock Your Full Cosmic Profile</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f8fa;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f4c91,#44b0a1);padding:40px 40px 30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">You're Only Seeing Half the Picture 🔮</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Unlock premium features and discover your full cosmic story</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="margin:0 0 20px;color:#282d33;font-size:16px;line-height:1.6;">
                Hey ${firstName},
              </p>
              <p style="margin:0 0 24px;color:#646b78;font-size:15px;line-height:1.6;">
                You've been exploring your age stats and zodiac profile — but there's so much more waiting for you behind the curtain. Premium members get access to features that go way deeper.
              </p>

              <!-- What you're missing -->
              <h3 style="margin:0 0 16px;color:#282d33;font-size:17px;font-weight:600;">Here's what you're missing:</h3>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:10px;border:1px solid #bae6fd;">
                    <strong style="color:#0f4c91;font-size:15px;">🧬 Life Expectancy Calculator</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">Get a personalized longevity estimate based on your health, lifestyle, and habits — with actionable tips to live longer.</p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:10px;border:1px solid #bae6fd;">
                    <strong style="color:#0f4c91;font-size:15px;">🌟 10,000+ Celebrity Matches</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">Our premium database includes actors, scientists, historical figures, and athletes — with full bios and trivia.</p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:10px;border:1px solid #bae6fd;">
                    <strong style="color:#0f4c91;font-size:15px;">📊 Downloadable PDF Reports</strong>
                    <p style="margin:6px 0 0;color:#646b78;font-size:13px;line-height:1.5;">Beautiful, shareable reports with your full cosmic profile — age stats, zodiac, birthstone, and more.</p>
                  </td>
                </tr>
              </table>

              <!-- Social proof -->
              <div style="padding:16px 20px;background-color:#f7f8fa;border-radius:10px;text-align:center;margin-bottom:28px;">
                <p style="margin:0;color:#282d33;font-size:14px;font-weight:600;">
                  ⭐ Join thousands of premium members exploring their full cosmic story
                </p>
              </div>

              <!-- Pricing + CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 4px;color:#282d33;font-size:28px;font-weight:700;">$29.99</p>
                    <p style="margin:0 0 20px;color:#646b78;font-size:13px;">One-time payment · Lifetime access · No subscriptions</p>
                    <a href="${appUrl}/upgrade" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#f59e0b);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(212,160,23,0.3);">
                      Unlock Premium for $29.99 →
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
