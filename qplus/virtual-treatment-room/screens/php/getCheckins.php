<?php
//==================================================================================== 
// getCheckins.php - php code to query the Aria database and extract the list of patients
// who are currently checked in for open appointments today
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
DATEPART(mm, Patient.DateOfBirth) AS DateOfBirth_mm,
DATEPART(dd, Patient.DateOfBirth) AS DateOfBirth_dd,
Patient.PatientSer,
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

/* Run the tabular results through json_encode() */
/* And ensure numbers don't get cast to trings */
#echo json_encode($json,<code> JSON_NUMERIC_CHECK</code>);
echo json_encode($json);


/* Free statement and connection resources. */

if (!$query) {
    die('Query failed.');
}

// Free the query result
mssql_free_result($query);
exit();

?>


