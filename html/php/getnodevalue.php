<?php
/*
 * Supply node values to d3.js
 * Arguments are optional: deviceid, interval
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

$interval = '3D';
$interval = 'full';
$where = "WHERE `deviceid` LIKE ? AND `timestamp` > (?) ORDER BY `timestamp` DESC";

if (isset($_GET['interval']) === true) {
    $interval = $_GET['interval'];
} 

if ($interval !== 'full') {
    $sinceDate = new DateTime();
    $sinceDate->sub(new DateInterval('P' . $interval));
} else {
    $where = "WHERE `deviceid` LIKE ? ORDER BY `timestamp` DESC";
}

$myDevice = 'RDS_0098C006';
if (isset($_GET['device']) === true
    && $_GET['device'] !== '') {
    $myDevice = $_GET['device'];
} 

// optional limit
//  ' LIMIT 10 '
$limit = ' LIMIT 10';
$limit = '';

$query = 'SELECT * FROM (SELECT * FROM '
    . $db_table
    . ' ' . $where
    . ' ' . $limit . ') tmp ORDER BY `timestamp`';

//#$query = "SELECT * FROM (SELECT * FROM `nodevalues` WHERE `deviceid` LIKE ? ORDER BY `timestamp` DESC LIMIT 10) tmp ORDER BY `timestamp` ASC";
//print $query;

$stmt = $mysqli->prepare($query);

if ($interval !== 'full') {
    //$stmt->bind_param('ss',$sinceDate->format('Y-m-d H:i:sO'), $property);
    $stmt->bind_param('ss',$myDevice, $sinceDate->format('Y-m-d H:i:sO'));
} else {
    $stmt->bind_param('s', $myDevice);
}

$stmt->execute();
$stmt->bind_result(
    $timestamp, $deviceid, $voltage,
    $temperature, $elapsedTime, $ambient_lux
);

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
        'deviceid', 'temperature', 'voltage', 'elapsedTime', 'ambient_lux'
    ));
    while( $stmt->fetch()) {
        fputcsv($fp, array(
            strtotime($timestamp)*1000 -$tz,
            $deviceid,
            $temperature != '' ?number_format($temperature, 1):'',
            $voltage != '' ? number_format($voltage, 3) : '',
            $elapsedTime != '' ? number_format($elapsedTime,4) : '',
            $ambient_lux
        )
    );
    }
}

?>
