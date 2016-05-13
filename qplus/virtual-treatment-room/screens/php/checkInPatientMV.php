<?php
//==================================================================================== 
// checkInPatientMV.php - php code to check a Medivisit patient into Mysql 
//==================================================================================== 
include_once("config_screens.php");

// Create DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Extract the webpage parameters
$CheckinVenue = $_GET["CheckinVenue"];
$AppointmentSerNum = $_GET["ScheduledActivitySer"];

echo "CheckinVenue: $CheckinVenue<br>";
echo "AppointmentSerNum: $AppointmentSerNum<br>";

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

#---------------------------------------------------------------------------------------------
# First, check for an existing entry in the patient location table for this appointment
#---------------------------------------------------------------------------------------------
$PatientLocationSerNum;
$PatientLocationRevCount;
$CheckinVenueName;
$ArrivalDateTime;

$sqlMV_checkCheckin = "
  SELECT DISTINCT 
    PatientLocation.PatientLocationSerNum,
    PatientLocation.PatientLocationRevCount,
    PatientLocation.CheckinVenueName,
    PatientLocation.ArrivalDateTime
  FROM
    PatientLocation
  WHERE
    PatientLocation.AppointmentSerNum = $AppointmentSerNum
";

echo "<p>sqlMV_checkCheckin: $sqlMV_checkCheckin<br>";

/* Process results */
$result = $conn->query($sqlMV_checkCheckin);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {

       	$PatientLocationSerNum	= $row["PatientLocationSerNum"];
    	$PatientLocationRevCount= $row["PatientLocationRevCount"];
    	$CheckinVenueName	= $row["CheckinVenueName"]; 
    	$ArrivalDateTime	= $row["ArrivalDateTime"];
    }
} else {
    echo "Patient not already checked in for this appointment... proceeding to check in";
}

echo "PatientLocationSerNum: $PatientLocationSerNum<br>";
echo "PatientLocationRevCount: $PatientLocationRevCount<br>";
echo "CheckinVenueName: $CheckinVenueName<br>";
echo "ArrivalDateTime: $ArrivalDateTime<br>";

#---------------------------------------------------------------------------------------------
# If there is an existing entry in the patient location table, take the values and 
# insert them into the PatientLocationMH table
#---------------------------------------------------------------------------------------------
if($PatientLocationSerNum)
{
	echo "inserting into MH table";
	$sql_insert_previousCheckin= "INSERT INTO PatientLocationMH(PatientLocationSerNum,PatientLocationRevCount,AppointmentSerNum,CheckinVenueName,ArrivalDateTime) VALUES ('$PatientLocationSerNum','$PatientLocationRevCount','$AppointmentSerNum','$CheckinVenueName','$ArrivalDateTime')";
	echo "sql_insert_previousCheckin: $sql_insert_previousCheckin";

	$result = $conn->query($sql_insert_previousCheckin);
}

#---------------------------------------------------------------------------------------------
# Put an entry into the PatientLocation table
# - first time entry the RevCount = 0, increment it to 1
# - not first time entry, increment by one the RevCount of the previous entry
#---------------------------------------------------------------------------------------------
$PatientLocationRevCount++;
$sql_insert_newCheckin= "INSERT INTO PatientLocation(PatientLocationRevCount,AppointmentSerNum,CheckinVenueName,ArrivalDateTime) VALUES ('$PatientLocationRevCount','$AppointmentSerNum','$CheckinVenue',NOW())";

echo "sql_insert_newCheckin: $sql_insert_newCheckin<br>";

if($conn->query($sql_insert_newCheckin))
{
      	$CheckinStatus = "OK";
}
else
{
      	$CheckinStatus = "Unable to check in";
}

echo "CheckinStatus: $CheckinStatus... ";

# if there was an existing entry in the patient location table, delete it now 
if($PatientLocationSerNum)
{
      	echo "deleting existing entry in PatientLocation table<br>";
      	$sql_delete_previousCheckin= "DELETE FROM PatientLocation WHERE PatientLocationSerNum=$PatientLocationSerNum";

	$result = $conn->query($sql_delete_previousCheckin);

      	echo "deleted...<b>";
}

// Close the MySQL connection
$conn->close();
?>

