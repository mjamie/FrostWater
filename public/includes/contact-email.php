<?php
declare(strict_types=1);

/** Build both readable HTML and a plain-text alternative without sending mail. */
function formatContactEmail(array $fields): array {
    $escape = fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $details = [
        'Full name' => $fields['name'],
        'Email' => $fields['email'],
        'Organization' => $fields['organization'] ?: 'Not provided',
        'Project type' => $fields['project-type'] ?: 'Not provided',
        'Heard about us' => $fields['referral'] ?: 'Not provided'
    ];
    $rows = '';
    $plain = "FROSTWATER STUDIOS\nNew website enquiry\n\nCONTACT & PROJECT DETAILS\n";
    foreach ($details as $label => $value) {
        $rows .= '<tr><th scope="row" style="padding:12px 14px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top;width:34%;font-size:14px;color:#475569;">' . $escape($label) . '</th><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:15px;color:#0f172a;overflow-wrap:anywhere;word-break:break-word;">' . $escape($value) . '</td></tr>';
        $plain .= $label . ': ' . $value . "\n";
    }
    $plain .= "\nMESSAGE\n" . $fields['message'] . "\n\nReply to this email to respond directly to the sender.\n";
    $message = nl2br($escape($fields['message']));
    $html = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New website enquiry</title></head><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a;">'
        . '<table role="presentation" style="width:100%;max-width:640px;margin:0 auto;border-collapse:collapse;background:#ffffff;"><tr><td style="padding:28px 24px;background:#0b1420;border-top:4px solid #38bdf8;"><p style="margin:0 0 8px;color:#7dd3fc;font-size:13px;font-weight:bold;">FROSTWATER STUDIOS</p><h1 style="margin:0;font-size:26px;line-height:1.3;color:#ffffff;">New website enquiry</h1></td></tr>'
        . '<tr><td style="padding:24px;"><h2 style="font-size:18px;margin:0 0 12px;">Contact &amp; project details</h2><table style="width:100%;border-collapse:collapse;background:#f8fafc;table-layout:fixed;">' . $rows . '</table>'
        . '<h2 style="font-size:18px;margin:28px 0 12px;">Message</h2><div style="font-size:16px;line-height:1.75;overflow-wrap:anywhere;word-break:break-word;">' . $message . '</div>'
        . '<p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">Reply to this email to respond directly to the sender.</p></td></tr></table></body></html>';
    $boundary = 'frostwater_' . bin2hex(random_bytes(16));
    $body = '';
    foreach (['text/plain' => $plain, 'text/html' => $html] as $type => $content) {
        $normalized = preg_replace('/\r\n|\r|\n/', "\r\n", $content);
        $body .= '--' . $boundary . "\r\nContent-Type: " . $type . "; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n" . quoted_printable_encode($normalized) . "\r\n";
    }
    $body .= '--' . $boundary . "--\r\n";
    return ['body' => $body, 'contentType' => 'multipart/alternative; boundary="' . $boundary . '"'];
}
