<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Gift voucher order confirmation</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#f9f7f4; color:#333;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4; padding:30px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background:#8B6F47; padding:40px; text-align:center; color:#fff;">
                            <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-weight:400; letter-spacing:2px; font-size:30px;">Headary SPA</h1>
                            <p style="margin:8px 0 0; letter-spacing:4px; font-size:11px; color:#D4AF37; text-transform:uppercase;">Gift Voucher</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#8B6F47; font-family:'Playfair Display', Georgia, serif; font-weight:400; margin:0 0 20px;">Thank you for your gift voucher order! 🎁</h2>

                            <p style="line-height:1.7; margin:0 0 16px;">Hi {{ $data['sender_name'] }},</p>
                            <p style="line-height:1.7; margin:0 0 20px;">
                                We have received your gift voucher order. Below you can find the details:
                            </p>

                            <div style="background:#faf8f5; border-radius:8px; padding:24px; margin:24px 0;">
                                <p style="margin:0 0 10px;"><strong style="color:#8B6F47;">For:</strong> {{ $data['recipient_name'] }}</p>
                                <p style="margin:0 0 10px;"><strong style="color:#8B6F47;">Treatment:</strong> {{ $data['treatment'] }}</p>
                                <p style="margin:0 0 10px;"><strong style="color:#8B6F47;">Contact e-mail:</strong> {{ $data['sender_email'] }}</p>
                                <p style="margin:0 0 10px;"><strong style="color:#8B6F47;">Contact phone:</strong> {{ $data['sender_phone'] }}</p>
                                @if(!empty($data['message']))
                                <p style="margin:10px 0 0; font-style:italic; color:#666;">"{{ $data['message'] }}"</p>
                                @endif
                            </div>

                            <p style="line-height:1.7; margin:0 0 16px;">
                                We will contact you shortly to arrange payment and delivery of the voucher.
                            </p>

                            <p style="line-height:1.7; margin:24px 0 0; color:#8B6F47;">
                                With love,<br>
                                <strong>Eliza from Headary SPA</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#faf8f5; padding:20px 40px; text-align:center; color:#999; font-size:12px; line-height:1.6;">
                            Headary SPA &middot; Nortamonkatu 26, Rauma, Finland<br>
                            <a href="mailto:headaryspa@gmail.com" style="color:#8B6F47;">headaryspa@gmail.com</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

