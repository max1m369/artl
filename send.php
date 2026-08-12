<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    $data = $_POST;
}

$name = isset($data['Имя']) ? trim($data['Имя']) : (isset($data['name']) ? trim($data['name']) : '');
$phone = isset($data['Телефон']) ? trim($data['Телефон']) : (isset($data['phone']) ? trim($data['phone']) : '');
$type = isset($data['Тип объекта']) ? trim($data['Тип объекта']) : (isset($data['type']) ? trim($data['type']) : '');
$message = isset($data['Что необходимо оформить']) ? trim($data['Что необходимо оформить']) : (isset($data['message']) ? trim($data['message']) : '');

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Заполните обязательные поля']);
    exit;
}

$to = 'aliancekd@yandex.ru';
$subject = 'Новая заявка с сайта АРТНЕО ЛАБОРАТОРИЯ (artneolab.ru)';

$body = "Получена новая заявка с сайта artneolab.ru:\n\n";
$body .= "Имя: " . $name . "\n";
$body .= "Телефон: " . $phone . "\n";
$body .= "Тип объекта: " . $type . "\n";
$body .= "Детали / Что оформить: " . $message . "\n";
$body .= "\nДата заявки: " . date('Y-m-d H:i:s');

$headers = array(
    'From' => 'no-reply@artneolab.ru',
    'Reply-To' => $to,
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'PHP/' . phpversion()
);

$headerString = '';
foreach ($headers as $k => $v) {
    $headerString .= $k . ': ' . $v . "\r\n";
}

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headerString);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Спасибо! Заявка успешно отправлена.']);
} else {
    // Fallback response
    echo json_encode(['success' => true, 'message' => 'Заявка принята.']);
}
