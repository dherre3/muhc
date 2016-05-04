<?php
//==================================================================================== 
// getExamRooms.php - php code to query the MySQL database and extract the list 
// exam rooms associated with a particular intermediate venue 
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
	ExamRoom.AriaVenueId
  FROM
    	IntermediateVenue,
    	ExamRoom
  WHERE
    	IntermediateVenue.IntermediateVenueSerNum = ExamRoom.IntermediateVenueSerNum
    	AND IntermediateVenue.AriaVenueId = '$IntermediateVenue'
";

/* Process results */
$json = array();
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
     	$json[] = $row;
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


