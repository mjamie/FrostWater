<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond(int $code, bool $ok, string $message): never {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Please use the contact form to send a message.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) respond(413, false, 'Your message is too long. Please shorten it.');
$limits = ['name' => 120, 'email' => 254, 'organization' => 160, 'project-type' => 80, 'referral' => 200, 'message' => 3000, 'website' => 200];
$fields = [];
foreach ($limits as $key => $limit) {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $limit * 4) respond(422, false, 'Please check your form entries and try again.');
    $fields[$key] = trim($value);
}
if ($fields['website'] !== '') respond(422, false, 'Unable to accept this submission.');
if ($fields['name'] === '' || $fields['message'] === '' || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $fields['email'])) {
    respond(422, false, 'Please enter your name, a valid email address, and your message.');
}
// Keep throttling data outside the public website. No enquiry contents are stored.
$path = sys_get_temp_dir() . '/frostwater-contact-' . hash('sha256', __DIR__) . '.json';
$file = @fopen($path, 'c+');
if (!$file || !flock($file, LOCK_EX)) respond(503, false, 'Sending is temporarily unavailable. Please email hello@frostwaterstudios.com.');
$records = json_decode(stream_get_contents($file), true) ?: [];
$now = time();
$records = array_filter($records, fn($record) => is_array($record) && ($record['start'] ?? 0) > $now - 900);
$key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$record = $records[$key] ?? ['start' => $now, 'count' => 0];
if ($record['count'] >= 5 || array_sum(array_column($records, 'count')) >= 100) {
    flock($file, LOCK_UN); fclose($file);
    respond(429, false, 'Too many attempts. Please wait 15 minutes or email hello@frostwaterstudios.com.');
}
$record['count']++;
$records[$key] = $record;
rewind($file); ftruncate($file, 0); fwrite($file, json_encode($records)); fflush($file);
flock($file, LOCK_UN); fclose($file);
require_once __DIR__ . '/includes/contact-email.php';
$email = formatContactEmail($fields);
$body = $email['body'];
$headers = [
    'From' => 'FrostWater Studios <hello@frostwaterstudios.com>',
    'Reply-To' => $fields['email'],
    'MIME-Version' => '1.0',
    'Content-Type' => $email['contentType']
];
try {
    $sent = @mail('hello@frostwaterstudios.com', 'Website project enquiry', $body, $headers);
} catch (Throwable $error) {
    $sent = false;
}
if (!$sent) respond(503, false, 'We could not send your message. Please try again or email hello@frostwaterstudios.com.');
respond(200, true, 'Thank you. Your message has been submitted to the FrostWater team.');
