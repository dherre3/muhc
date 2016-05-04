<?php
//==================================================================================== 
// getScheduledResources.php - php code to query the MySQL database and extract the list 
// resources associated with a particular intermediate venue 
//==================================================================================== 
include_once("config_screens.php");

// Create DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Extract the webpage parameters
$IntermediateVenue = $_GET["IntermediateVenue"];

// Determine today's data
$day = date(D);
$hours = date(G); # 24 hour format
if($hours >= 13) {
  $AMPM = "PM";
} else {
  $AMPM = "AM";
}

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

#$day = 'Mon';

$sql = "
  SELECT DISTINCT 
	ClinicResources.ResourceName
  FROM
	ExamRoom,
	IntermediateVenue,
	ClinicResources,
	ClinicSchedule
  WHERE
	ClinicResources.ClinicScheduleSerNum = ClinicSchedule.ClinicScheduleSerNum
	AND ClinicSchedule.Day = '$day' 
	AND ClinicSchedule.AMPM = '$AMPM'
	AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum
	AND ExamRoom.IntermediateVenueSerNum = IntermediateVenue.IntermediateVenueSerNum
	AND IntermediateVenue.AriaVenueId = '$IntermediateVenue'
";
#echo $sql;
/* Process results */
$json = array();
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
     	$json[] = $row['ResourceName'];
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


