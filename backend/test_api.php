<?php

// Test the login API endpoint
$url = 'http://127.0.0.1:8000/api/login';
$data = [
    'email' => 'admin@example.com',
    'password' => 'password'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "API call failed\n";
    print_r($http_response_header);
} else {
    echo "API Response:\n";
    echo $result . "\n";
}