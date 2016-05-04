<?php
//==================================================================================== 
// similarCheckIns.php - php code to check if there are already patients checked in
// with similar identifiers 
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

// Extract the webpage parameters
$FirstName		= $_GET["FirstName"];
$LastNameFirstThree	= $_GET["LastNameFirstThree"];

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

//======================================================================================
// Aria patients 
//======================================================================================
$sqlAria = "

SELECT 

COUNT (DISTINCT Patient.SSN) AS numSimilarNames

FROM

variansystem.dbo.PatientLocation,
variansystem.dbo.ScheduledActivity ScheduledActivity,
variansystem.dbo.ActivityInstance ActivityInstance,
variansystem.dbo.Activity Activity,
variansystem.dbo.vv_ActivityLng vv_ActivityLng,
variansystem.dbo.Patient

WHERE
PatientLocation.CheckedInFlag                   = 1
AND ScheduledActivity.ScheduledActivitySer      = PatientLocation.ScheduledActivitySer
AND PatientLocation.ArrivalDateTime             > CONVERT (date, GETDATE()) 
AND ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer
AND ActivityInstance.ActivitySer 		= Activity.ActivitySer
AND Activity.ActivityCode 			= vv_ActivityLng.LookupValue
AND ScheduledActivity.PatientSer                = Patient.PatientSer
AND (ScheduledActivity.ScheduledActivityCode     = 'Open'
  OR ScheduledActivity.ScheduledActivityCode     = 'In Progress')
AND Patient.PatientId NOT LIKE 'QA_%'
AND Patient.FirstName NOT LIKE 'QA_%'
AND Patient.LastName NOT LIKE 'QA_%'
AND Patient.FirstName = '$FirstName'
AND Patient.SSN LIKE '$LastNameFirstThree%'
";
#AND Patient.FirstName = 'JOHN'
#AND Patient.SSN LIKE 'KIL%'

#echo "SQL: $sql<br>";

$query = mssql_query($sqlAria);

/* Process results */
$row = mssql_fetch_array($query);

if (!$query) {
    die('Query failed.');
}

$numAria = $row[0];
#echo "Number of Aria patients checked in: $numAria<br>";

// Free the query result
mssql_free_result($query);

//======================================================================================
// MediVisit/MySQL patients 
//======================================================================================
// Create MySQL DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

$sqlMV = "
SELECT 

COUNT(Patient.SSN) AS numSimilarNames

FROM 
PatientLocation,
Patient,
MediVisitAppointmentList

WHERE
PatientLocation.AppointmentSerNum = MediVisitAppointmentList.AppointmentSerNum
AND Patient.PatientSerNum = MediVisitAppointmentList.PatientSerNum
AND PatientLocation.ArrivalDateTime >= CURDATE()
AND Patient.FirstName = \"$FirstName\"
AND Patient.SSN LIKE \"$LastNameFirstThree%\"
";
#AND Patient.FirstName = \"JOHN\"
#AND Patient.SSN LIKE \"KIL%\"

#echo "Medivisit query: $sqlMV<br>";

/* Process results */
$result = $conn->query($sqlMV);

$numMV = "";

if ($result->num_rows > 0) {
    // output data of each row
    $row = $result->fetch_assoc(); 
  
    $numMV = $row["numSimilarNames"];
} 
 

#echo "Number of MV patients checked in: $numMV<br>";

$totSimilarNames = $numAria+ $numMV;

#echo "Number of all similar patients checked in: $totSimilarNames<br>";

# spit the result out to the webpage/calling function
echo $totSimilarNames;
?>


