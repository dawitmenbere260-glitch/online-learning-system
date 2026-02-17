<?php

// Test the courses API endpoint
$url = 'http://127.0.0.1:8000/api/courses';

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method' => 'GET'
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "API call failed\n";
    if (isset($http_response_header)) {
        print_r($http_response_header);
    }
} else {
    echo "API Response:\n";
    $data = json_decode($result, true);
    if (isset($data['data'])) {
        echo "Found " . count($data['data']) . " courses:\n";
        foreach ($data['data'] as $course) {
            echo "- " . $course['title'] . " by " . $course['instructor']['name'] . "\n";
        }
    } else {
        echo $result . "\n";
    }
}