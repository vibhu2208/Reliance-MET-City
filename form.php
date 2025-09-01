<?php
// Basic contact form handler with DB insert and email
// Progressive enhancement support: returns plain text when X-Requested-With is sent

$subject = 'Emaar India Business Centre - New Enquiry';
$emailadd = 'query@aadharhomes.com';
$default_project = 'Emaar India Business Centre';

// Destination after non-JS submit
$redirect_url = 'index.html';

// DB credentials (update as needed)
$servername = "82.180.175.102";
$username   = "u766024435_website_enq";
$password   = "Anshu@#5566";
$database   = "u766024435_projects_db";

$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']);

// Simple IP-based rate limit: 1 submission per 15 seconds
session_start();
$now = time();
if (!isset($_SESSION['last_submit'])) {
    $_SESSION['last_submit'] = 0;
}
if ($now - $_SESSION['last_submit'] < 15) {
    $msg = 'Please wait a few seconds before submitting again.';
    if ($is_ajax) { echo $msg; } else { echo "<script>alert('$msg'); window.history.back();</script>"; }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $errors = [];

    // Normalize and sanitize inputs
    $name    = isset($_POST['name'])   ? trim($_POST['name'])   : '';
    $email   = isset($_POST['email'])  ? trim($_POST['email'])  : '';
    $mobile  = isset($_POST['mobile']) ? preg_replace('/\D+/', '', $_POST['mobile']) : '';
    $project = isset($_POST['project']) && $_POST['project'] !== '' ? trim($_POST['project']) : $default_project;

    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $project = htmlspecialchars($project, ENT_QUOTES, 'UTF-8');

    // Validate required
    if ($name === '') { $errors[] = 'Name is required'; }
    if ($mobile === '') { $errors[] = 'Mobile number is required'; }
    elseif (!preg_match('/^[0-9]{10}$/', $mobile)) { $errors[] = 'Mobile number must be 10 digits'; }
    // Email optional; if provided, validate
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'Invalid email format'; }

    if (!empty($errors)) {
        $msg = 'Error: ' . implode("\n", $errors);
        if ($is_ajax) { echo $msg; } else { echo "<script>alert('" . addslashes($msg) . "'); window.history.back();</script>"; }
        exit;
    }

    // Build email text
    $text = "Results from form:\n\n";
    $fields = [
        'name' => $name,
        'email' => $email,
        'mobile' => $mobile,
        'project' => $project,
    ];
    foreach ($fields as $k => $v) {
        $text .= ucfirst($k) . ": " . $v . "\n";
    }

    // Insert into DB (prepared statement)
    $connect_db = mysqli_connect($servername, $username, $password, $database);
    if (!$connect_db) {
        error_log('DB connect failed: ' . mysqli_connect_error());
        $msg = 'Server error. Please try again later.';
        if ($is_ajax) { echo $msg; } else { echo "<script>alert('$msg'); window.history.back();</script>"; }
        exit;
    }

    $stmt = mysqli_prepare($connect_db, 'INSERT INTO project_enq (name, email, mobile, project) VALUES (?, ?, ?, ?)');
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $mobile, $project);
        if (!mysqli_stmt_execute($stmt)) {
            error_log('DB insert error: ' . mysqli_error($connect_db));
        }
        mysqli_stmt_close($stmt);
    } else {
        error_log('DB prepare failed: ' . mysqli_error($connect_db));
    }

    // Send mail (basic)
    @mail($emailadd, $subject, $text, 'From: ' . $emailadd);

    $_SESSION['last_submit'] = $now;

    // Response
    $ok = 'Thank You! Details have been sent. We will get in touch with you at the earliest.';
    if ($is_ajax) {
        echo $ok;
    } else {
        echo "<script>alert('" . addslashes($ok) . "'); window.location='http://" . $_SERVER['HTTP_HOST'] . "';</script>";
    }
    exit;
} else {
    // Method not allowed
    header('HTTP/1.1 405 Method Not Allowed');
    header('Allow: POST');
    echo 'Method Not Allowed';
}
?>
