<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New gift voucher order</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#f9f7f4; color:#333;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4; padding:30px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background:#8B6F47; padding:30px 40px; text-align:center; color:#fff;">
                            <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-weight:400; letter-spacing:2px; font-size:28px;">Headary SPA</h1>
                            <p style="margin:6px 0 0; letter-spacing:4px; font-size:11px; color:#D4AF37; text-transform:uppercase;">Gift Voucher Order</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 40px;">
                            <h2 style="color:#8B6F47; font-family:'Playfair Display', Georgia, serif; font-weight:400; margin:0 0 20px;">🎁 New gift voucher order</h2>
                            <p style="line-height:1.7; margin:0 0 20px;">You have just received a new gift voucher order. Details below:</p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:20px 0;">
                                <tr>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8; color:#8B6F47; font-weight:bold; width:180px;">From:</td>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8;">
                                        {{ $data['sender_name'] }}<br>
                                        <a href="mailto:{{ $data['sender_email'] }}" style="color:#8B6F47;">{{ $data['sender_email'] }}</a><br>
                                        <a href="tel:{{ $data['sender_phone'] }}" style="color:#8B6F47;">{{ $data['sender_phone'] }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8; color:#8B6F47; font-weight:bold;">For:</td>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8;">{{ $data['recipient_name'] }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8; color:#8B6F47; font-weight:bold;">Treatment:</td>
                                    <td style="padding:12px 0; border-bottom:1px solid #E8DCC8;">{{ $data['treatment'] }}</td>
                                </tr>
                                @if(!empty($data['message']))
                                <tr>
                                    <td style="padding:12px 0; color:#8B6F47; font-weight:bold; vertical-align:top;">Message:</td>
                                    <td style="padding:12px 0; font-style:italic; color:#555;">"{{ $data['message'] }}"</td>
                                </tr>
                                @endif
                            </table>

                            <div style="background:#faf8f5; border-left:4px solid #D4AF37; padding:16px 20px; margin-top:24px; border-radius:4px;">
                                <p style="margin:0; color:#555; font-size:14px; line-height:1.6;">
                                    Please contact the sender to arrange payment and delivery of the voucher.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#faf8f5; padding:20px 40px; text-align:center; color:#999; font-size:12px;">
                            Headary SPA &middot; Nortamonkatu 26, Rauma, Finland
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

