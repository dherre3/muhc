<?php
//==================================================================================== 
// getLocationInfo.php - php code to query the MySQL database and extract information
// regarding a given intermediate venue location 
//==================================================================================== 
include_once("config_screens.php");

// Create DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Extract the webpage parameters
$IntermediateVenue = $_GET["IntermediateVenue"];

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

$sql = "
  SELECT 
	IntermediateVenue.ScreenDisplayName
  FROM
	IntermediateVenue
  WHERE
	IntermediateVenue.AriaVenueId = '$IntermediateVenue'
";
//echo $sql;
/* Process results */
$json = array();
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
     	#$json[] = $row['ScreenDisplayName'];
	$json = array(
		'ScreenDisplayName' => $row['ScreenDisplayName'] # Use this notation as just expecting 1 row
	);
    }
} else {
    die("0 results");
}

/* Run the tabular results through json_encode() */
/* And ensure numbers don't get cast to trings */
#echo json_encode($json,<code> JSON_NUMERIC_CHECK</code>);
echo json_encode($json);

// Close the MySQL connection
$conn->close();
?>


