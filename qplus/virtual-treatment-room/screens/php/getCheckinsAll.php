<?php
//==================================================================================== 
// getCheckinsAll.php - php code to query the Aria and MySQL databases and extract the list of patients
// who are currently checked in for open appointments today in either Aria or Medivisit (MySQL)
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

//echo "Got a link<br>";

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

$sql = "

SELECT DISTINCT
PatientLocation.ScheduledActivitySer,
PatientLocation.ArrivalDateTime,
vv_ActivityLng.Expression1,
Patient.LastName,
Patient.FirstName,
Patient.PatientId,
ScheduledActivity.ScheduledActivityCode,
vv_ResourceName.ResourceName,
ScheduledActivity.ScheduledStartTime,
DATEPART(hh,ScheduledActivity.ScheduledStartTime) AS ScheduledStartTime_hh,
RIGHT( ('00' + DATEPART(mi,ScheduledActivity.ScheduledStartTime)), 2) AS ScheduledStartTime_mm, 
DATEDIFF(n, GETDATE(), ScheduledActivity.ScheduledStartTime) AS TimeRemaining,
DATEDIFF(n, PatientLocation.ArrivalDateTime, GETDATE()) AS WaitTime, 
DATEPART(hh, PatientLocation.ArrivalDateTime) AS ArrivalDateTime_hh,
RIGHT( ('00' + DATEPART(mi,PatientLocation.ArrivalDateTime)), 2) AS ArrivalDateTime_mm, 
Venue.VenueId,
Doctor.LastName AS DoctorName,
Patient.PatientSer,
'Aria' AS CheckInSystem,
SUBSTRING(Patient.SSN,1,3) AS SSN,
SUBSTRING(Patient.SSN,9,2) AS DAYOFBIRTH,
SUBSTRING(Patient.SSN,7,2) AS MONTHOFBIRTH

FROM

variansystem.dbo.PatientLocation,
variansystem.dbo.ScheduledActivity ScheduledActivity,
variansystem.dbo.ActivityInstance ActivityInstance,
variansystem.dbo.Activity Activity,
variansystem.dbo.vv_ActivityLng vv_ActivityLng,
variansystem.dbo.Patient,
variansystem.dbo.vv_ResourceName vv_ResourceName,
variansystem.dbo.ResourceActivity ResourceActivity,
variansystem.dbo.Venue Venue,
variansystem.dbo.Doctor,
variansystem.dbo.PatientDoctor

WHERE
PatientLocation.CheckedInFlag                   = 1
AND ScheduledActivity.ScheduledActivitySer      = PatientLocation.ScheduledActivitySer
AND PatientLocation.ArrivalDateTime             > CONVERT (date, GETDATE()) 
--AND ( ScheduledActivity.ScheduledStartime 	>= '2015-04-10 20:00:00')
AND ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer
AND ActivityInstance.ActivitySer 		= Activity.ActivitySer
AND Activity.ActivityCode 			= vv_ActivityLng.LookupValue
AND ScheduledActivity.PatientSer                = Patient.PatientSer
AND (ScheduledActivity.ScheduledActivityCode     = 'Open'
  OR ScheduledActivity.ScheduledActivityCode     = 'In Progress')
AND ResourceActivity.ScheduledActivitySer       = ScheduledActivity.ScheduledActivitySer
AND vv_ResourceName.ResourceSer                 = ResourceActivity.ResourceSer
AND Venue.ResourceSer                 		= PatientLocation.ResourceSer
--AND Venue.ResourceSer                 	= 8226 
AND Patient.PatientId NOT LIKE 'QA_%'
AND Patient.FirstName NOT LIKE 'QA_%'
AND Patient.LastName NOT LIKE 'QA_%'
AND PatientDoctor.PatientSer 			= Patient.PatientSer
AND PatientDoctor.OncologistFlag		= 1
AND PatientDoctor.PrimaryFlag			= 1
AND Doctor.ResourceSer 				= PatientDoctor.ResourceSer
--AND Patient.LastName = 'Flinstone'
ORDER BY
ScheduledActivity.ScheduledStartTime
";

# Need to be sure that appointments are open*****

$query = mssql_query($sql);
#echo "here<br>";


/* Process results */
$json = array();

while($row = mssql_fetch_array($query)){
  #echo "$row[0]<br>";
     $json[] = $row;
}

#-------------------------------------------------------------------------------------
# Now, get the Medivisit checkins from MySQL
#-------------------------------------------------------------------------------------
// Create MySQL DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

$sql = "
SELECT 

PatientLocation.AppointmentSerNum AS ScheduledActivitySer,
PatientLocation.ArrivalDateTime AS ArrivalDateTime,
MediVisitAppointmentList.AppointmentCode AS Expression1,
Patient.LastName AS LastName,
Patient.FirstName AS FirstName,
Patient.PatientId AS PatientId,
MediVisitAppointmentList.Status AS ScheduledActivityCode,
MediVisitAppointmentList.ResourceDescription AS ResourceName,
MediVisitAppointmentList.ScheduledDateTime,
hour(MediVisitAppointmentList.ScheduledDateTime) AS ScheduledStartTime_hh,
minute(MediVisitAppointmentList.ScheduledDateTime) AS ScheduledStartTime_mm,
MediVisitAppointmentList.ScheduledDateTime AS ScheduledStartTime,
TIMESTAMPDIFF(MINUTE,NOW(), MediVisitAppointmentList.ScheduledDateTime) AS TimeRemaining,
TIMESTAMPDIFF(MINUTE,PatientLocation.ArrivalDateTime,NOW()) AS Waittime,
hour(PatientLocation.ArrivalDateTime) AS ArrivalDateTime_hh,
minute(PatientLocation.ArrivalDateTime) AS ArrivalDateTime_mm,
PatientLocation.CheckinVenueName AS VenueId,
MediVisitAppointmentList.ResourceDescription AS DoctorName,
Patient.PatientSerNum AS PatientSer,
'Medivisit' AS CheckInSystem, 
SUBSTRING(Patient.SSN,1,3) AS SSN,
SUBSTRING(Patient.SSN,9,2) AS DAYOFBIRTH,
SUBSTRING(Patient.SSN,7,2) AS MONTHOFBIRTH

FROM 
PatientLocation,
Patient,
MediVisitAppointmentList

WHERE
PatientLocation.AppointmentSerNum = MediVisitAppointmentList.AppointmentSerNum
AND Patient.PatientSerNum = MediVisitAppointmentList.PatientSerNum
AND PatientLocation.ArrivalDateTime >= CURDATE()
ORDER BY LastName
";

#echo "Medivisit query: $sql<br>";
/* Process results */
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
     	$json[] = $row;
    }
} 

/* Run the tabular results through json_encode() */
/* And ensure numbers don't get cast to trings */
#echo json_encode($json,<code> JSON_NUMERIC_CHECK</code>);
echo json_encode($json);

/* Free statement and connection resources. */

if (!$query) {
    die('Mysql Query failed.');
}

// Free the query result
mssql_free_result($query);

?>


