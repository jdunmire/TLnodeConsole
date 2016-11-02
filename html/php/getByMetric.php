<?php
/*
 * Supply node values to d3.js
 * Arguments are optional: metric, interval
 */

// database configuration
include 'config.php';
    /*
        $hostname
        $user
        $password
        $database
     */

// Database connecten
$mysqli = new mysqli($hostname, $user, $password, $database)
    or die('Could not connect: ' . $mysqli->error);

// Query
$db_table = '`nodevalues`';

$interval = 'full';
$interval = '3D';
$where = "WHERE `timestamp` > (?) ORDER BY `timestamp` DESC";

if (isset($_GET['interval']) === true) {
    $interval = $_GET['interval'];
} 

if ($interval !== 'full') {
    $sinceDate = new DateTime();
    $sinceDate->sub(new DateInterval('P' . $interval));
} else {
    $where = "ORDER BY `timestamp` DESC";
}

$myMetric = 'voltage';
if (isset($_GET['metric']) === true
    && $_GET['metric'] !== '') {
    $myMetric = $_GET['metric'];
} 

// optional limit
//  ' LIMIT 10 '
$limit = ' LIMIT 5';
$limit = '';

$query = 'SELECT * FROM (SELECT timestamp,deviceid,'
    . $myMetric . ' FROM '
    . $db_table
    . ' ' . $where
    . ' ' . $limit . ') tmp ORDER BY `timestamp`';

//#$query = "SELECT * FROM (SELECT * FROM `nodevalues` WHERE `deviceid` LIKE ? ORDER BY `timestamp` DESC LIMIT 10) tmp ORDER BY `timestamp` ASC";

$stmt = $mysqli->prepare($query);

if ($interval !== 'full') {
    $dt = $sinceDate->format('Y-m-d H:i:sO');
    $stmt->bind_param('s', $dt);
}

$stmt->execute();
$stmt->bind_result(
    $timestamp, $deviceid, $metric
);
//    $temperature, $elapsedTime, $ambient_lux

$tz = 60 * 60 * 7 *1000;
$fp = fopen('php://output', 'w');
if ($fp !== false) {
    /*
     * these headers would tell the browser something useful,
     * but this script is putting out information to be consumed
     * by javascript (d3.js to be specific) so they are not needed.
     *   header('Content-Disposition: attachment; filename="export.csv"');
     *   header('Pragma: no-cache');
     *   header('Expires: 0');
     */
    //header('Content-Type: text/csv');

    fputcsv($fp, array(
        'timestamp',
        'deviceid', 'metric'
    ));
    while( $stmt->fetch()) {
        fputcsv($fp, array(
            strtotime($timestamp)*1000 -$tz,
            $deviceid,
            $metric
            /*
            $temperature != '' ?number_format($temperature, 1):'',
            $voltage != '' ? number_format($voltage, 3) : '',
            $elapsedTime != '' ? number_format($elapsedTime,4) : '',
            $ambient_lux
             */
        )
    );
    }
}

?>
