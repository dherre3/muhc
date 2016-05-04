<?php
//==================================================================================== 
// dischargePatient.php - php code to discharge a medivisit patient 
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');
$row  = "";

// Extract the webpage parameters
$CheckinVenue 		= $_GET["CheckinVenue"];
$AppointmentSerNum 	= $_GET["ScheduledActivitySer"];
$PatientId		= $_GET["PatientId"];

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

//======================================================================================
// Check the patient out of this Medivisit appointment
//======================================================================================
// Check the PatientLocation table to get the revision count
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
    die("Doesn't seem like the patient is checked in...");
}

echo "PatientLocationSerNum: $PatientLocationSerNum<br>";
echo "PatientLocationRevCount: $PatientLocationRevCount<br>";
echo "CheckinVenueName: $CheckinVenueName<br>";
echo "ArrivalDateTime: $ArrivalDateTime<br>";

// update the MH table for the last checkin
echo "inserting into MH table";

$sql_insert_previousCheckin= "INSERT INTO PatientLocationMH(PatientLocationSerNum,PatientLocationRevCount,AppointmentSerNum,CheckinVenueName,ArrivalDateTime) VALUES ('$PatientLocationSerNum','$PatientLocationRevCount','$AppointmentSerNum','$CheckinVenueName','$ArrivalDateTime')";
echo "sql_insert_previousCheckin: $sql_insert_previousCheckin";

$result = $conn->query($sql_insert_previousCheckin);

// remove appointment from PatientLocation table
echo "deleting existing entry in PatientLocation table<br>";
$sql_delete_previousCheckin= "DELETE FROM PatientLocation WHERE PatientLocationSerNum=$PatientLocationSerNum";

$result = $conn->query($sql_delete_previousCheckin);

echo "deleted...<b>";


// update MediVisitAppointmentList table to show that appointment is no longer open
echo "Udating MediVisitAppointmentList table to set status of appointment as Completed<br>";

$sql_closeApt = "UPDATE MediVisitAppointmentList SET Status = 'Completed' WHERE AppointmentSerNum = '$AppointmentSerNum'";
$result = $conn->query($sql_closeApt);

echo "Updated...<br>";

//======================================================================================
// Check for upcoming appointments in both Aria and Medivisit for this patient
//======================================================================================
$Today = date("Y-m-d");
$startOfToday = "$Today 00:00:00";
$endOfToday = "$Today 23:59:59";

echo "startOfToday: $startOfToday, endOfToday: $endOfToday<br>";

// Aria
# We need a union on the query as the appointment is either with an auxiliary or a doctor or a resource 
$sqlAppt = "
	  SELECT DISTINCT 
		Patient.PatientId,
		Patient.FirstName,
		Patient.LastName,
		ScheduledActivity.ScheduledStartTime,
		vv_ActivityLng.Expression1,
		ResourceActivity.ResourceSer,	
		ScheduledActivity.ScheduledActivitySer,
		Auxiliary.AuxiliaryId,
		Resource.ResourceType,	
		DATEDIFF(n,'$startOfToday',ScheduledActivity.ScheduledStartTime) AS AptTimeSinceMidnight 
          FROM  
		variansystem.dbo.Patient Patient,
           	variansystem.dbo.ScheduledActivity ScheduledActivity,
		variansystem.dbo.ActivityInstance ActivityInstance,
		variansystem.dbo.Activity Activity,
		variansystem.dbo.vv_ActivityLng vv_ActivityLng,
		variansystem.dbo.ResourceActivity ResourceActivity,
		variansystem.dbo.Auxiliary Auxiliary, 
		variansystem.dbo.Resource Resource
          WHERE 
            	( ScheduledActivity.ScheduledStartTime 		> '$startOfToday' )    
            AND	( ScheduledActivity.ScheduledStartTime 		< '$endOfToday' )    
	    AND ( ScheduledActivity.PatientSer 			= Patient.PatientSer)           
	    AND ( Patient.PatientId 				= $PatientId)           
	    AND ( ScheduledActivity.ScheduledActivityCode 	= 'Open')
            AND ( ResourceActivity.ScheduledActivitySer 	= ScheduledActivity.ScheduledActivitySer )
            AND ( ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer)
            AND ( ActivityInstance.ActivitySer 			= Activity.ActivitySer)
            AND ( Activity.ActivityCode 			= vv_ActivityLng.LookupValue)
	    AND ( Patient.PatientSer 				= ScheduledActivity.PatientSer)           
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FIRST CONSULT')
	    AND ( vv_ActivityLng.Expression1 			!= 'FIRST CONSULT')
	    AND ( 
		  vv_ActivityLng.Expression1 			LIKE '%.EB%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CT%'
		 OR vv_ActivityLng.Expression1 			LIKE '%.BXC%'
		 OR vv_ActivityLng.Expression1 			LIKE '%F-U %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW UP %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW-UP%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Transfusion%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Injection%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Nursing Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Hydration%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CONSULT%'
		)
	    AND  ResourceActivity.ResourceSer = Auxiliary.ResourceSer 
	    AND  Resource.ResourceSer = Auxiliary.ResourceSer 
	UNION
	  SELECT DISTINCT
		Patient.PatientId,
		Patient.FirstName,
		Patient.LastName,
		ScheduledActivity.ScheduledStartTime,
		vv_ActivityLng.Expression1,
		ResourceActivity.ResourceSer,	
		ScheduledActivity.ScheduledActivitySer,
		Doctor.DoctorId,	
		Resource.ResourceType,	
		DATEDIFF(n,'$startOfToday',ScheduledActivity.ScheduledStartTime) AS AptTimeSinceMidnight 
          FROM  
		variansystem.dbo.Patient Patient,
           	variansystem.dbo.ScheduledActivity ScheduledActivity,
		variansystem.dbo.ActivityInstance ActivityInstance,
		variansystem.dbo.Activity Activity,
		variansystem.dbo.vv_ActivityLng vv_ActivityLng,
		variansystem.dbo.ResourceActivity ResourceActivity,
		variansystem.dbo.Doctor Doctor,
		variansystem.dbo.Resource Resource
          WHERE 
            	( ScheduledActivity.ScheduledStartTime 		> '$startOfToday' )    
            AND	( ScheduledActivity.ScheduledStartTime 		< '$endOfToday' )    
	    AND ( ScheduledActivity.PatientSer 			= Patient.PatientSer)           
	    AND ( Patient.PatientId 				= $PatientId)           
	    AND ( ScheduledActivity.ScheduledActivityCode 	= 'Open')
            AND ( ResourceActivity.ScheduledActivitySer 	= ScheduledActivity.ScheduledActivitySer )
            AND ( ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer)
            AND ( ActivityInstance.ActivitySer 			= Activity.ActivitySer)
            AND ( Activity.ActivityCode 			= vv_ActivityLng.LookupValue)
	    AND ( Patient.PatientSer 				= ScheduledActivity.PatientSer)           
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FIRST CONSULT')
	    AND ( vv_ActivityLng.Expression1 			!= 'FIRST CONSULT')
	    AND ( 
		  vv_ActivityLng.Expression1 			LIKE '%.EB%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CT%'
		 OR vv_ActivityLng.Expression1 			LIKE '%.BXC%'
		 OR vv_ActivityLng.Expression1 			LIKE '%F-U %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW UP %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW-UP%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Transfusion%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Injection%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Nursing Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Hydration%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CONSULT%'
		)
	    AND  ResourceActivity.ResourceSer = Doctor.ResourceSer 
	    AND  Resource.ResourceSer = Doctor.ResourceSer 
	UNION
	  SELECT DISTINCT 
		Patient.PatientId,
		Patient.FirstName,
		Patient.LastName,
		ScheduledActivity.ScheduledStartTime,
		vv_ActivityLng.Expression1,
		ResourceActivity.ResourceSer,	
		ScheduledActivity.ScheduledActivitySer,
		CONVERT(varchar(30), Resource.ResourceSer),
		Resource.ResourceType,	
		DATEDIFF(n,'$startOfToday',ScheduledActivity.ScheduledStartTime) AS AptTimeSinceMidnight 
          FROM  
		variansystem.dbo.Patient Patient,
           	variansystem.dbo.ScheduledActivity ScheduledActivity,
		variansystem.dbo.ActivityInstance ActivityInstance,
		variansystem.dbo.Activity Activity,
		variansystem.dbo.vv_ActivityLng vv_ActivityLng,
		variansystem.dbo.ResourceActivity ResourceActivity,
		variansystem.dbo.Resource Resource
          WHERE 
            	( ScheduledActivity.ScheduledStartTime 		> '$startOfToday' )    
            AND	( ScheduledActivity.ScheduledStartTime 		< '$endOfToday' )    
	    AND ( ScheduledActivity.PatientSer 			= Patient.PatientSer)           
	    AND ( Patient.PatientId 				= $PatientId)           
	    AND ( ScheduledActivity.ScheduledActivityCode 	= 'Open')
            AND ( ResourceActivity.ScheduledActivitySer 	= ScheduledActivity.ScheduledActivitySer )
            AND ( ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer)
            AND ( ActivityInstance.ActivitySer 			= Activity.ActivitySer)
            AND ( Activity.ActivityCode 			= vv_ActivityLng.LookupValue)
	    AND ( Patient.PatientSer 				= ScheduledActivity.PatientSer)           
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'FOLLOW UP')
	    AND ( vv_ActivityLng.Expression1 			!= 'NUTRITION FIRST CONSULT')
	    AND ( vv_ActivityLng.Expression1 			!= 'FIRST CONSULT')
	    AND ( 
		  vv_ActivityLng.Expression1 			LIKE '%.EB%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CT%'
		 OR vv_ActivityLng.Expression1 			LIKE '%.BXC%'
		 OR vv_ActivityLng.Expression1 			LIKE '%F-U %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW UP %'
		 OR vv_ActivityLng.Expression1 			LIKE '%FOLLOW-UP%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Transfusion%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Injection%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Nursing Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Hydration%'
		 OR vv_ActivityLng.Expression1 			LIKE '%Consult%'
		 OR vv_ActivityLng.Expression1 			LIKE '%CONSULT%'
		)
	    AND  ResourceActivity.ResourceSer = Resource.ResourceSer
	  ORDER BY ScheduledActivity.ScheduledStartTime ASC 
	";

# print the SQL query for debugging
echo "SQL: $sqlAppt<br>";

$query = mssql_query($sqlAppt);
$row = mssql_fetch_array($query);

#$PatientId		= $row["PatientId"];
$PatientFirstName	= $row["FirstName"];
$PatientLastName	= $row["LastName"];
$ScheduledStartTime	= $row["ScheduledStartTime"];
$ApptDescription	= $row["Expression1"];
$ResourceSer		= $row["ResourceSer"];
$ScheduledActivitySer	= $row["ScheduledActivitySer"];
$AuxiliaryId		= $row["AuxiliaryId"];
$ResourceType 		= $row["ResourceType"];
$AptTimeSinceMidnight 	= $row["AptTimeSinceMidnight"];

// Set the time since midnight to an initially outrageously large value
if(!$AptTimeSinceMidnight) { 
  $AptTimeSinceMidnight= 9e11;
}

// Medivisit
$sqlApptMedivisit = "
	  SELECT DISTINCT 
		Patient.PatientId,
		Patient.FirstName,
		Patient.LastName,
		MediVisitAppointmentList.ScheduledDateTime, 
		MediVisitAppointmentList.AppointmentCode,
		MediVisitAppointmentList.ResourceDescription,
		(UNIX_TIMESTAMP(MediVisitAppointmentList.ScheduledDateTime)-UNIX_TIMESTAMP('$startOfToday'))/60 AS AptTimeSinceMidnight, 
		MediVisitAppointmentList.AppointmentSerNum,
		MediVisitAppointmentList.Status
          FROM
		Patient,
		MediVisitAppointmentList
	 WHERE
		MediVisitAppointmentList.PatientSerNum = Patient.PatientSerNum
		AND MediVisitAppointmentList.PatientSerNum = Patient.PatientSerNum 
		AND Patient.PatientId = $PatientId
            	AND ( MediVisitAppointmentList.ScheduledDateTime > '$startOfToday' )    
                AND ( MediVisitAppointmentList.ScheduledDateTime < '$endOfToday' )  
		AND MediVisitAppointmentList.Status = 'Open'
		ORDER BY MediVisitAppointmentList.ScheduledDateTime
		LIMIT 1
"; 

echo "sqlApptMedivisit: $sqlApptMedivisit<br>";

/* Process results */
$result = $conn->query($sqlApptMedivisit);

// Set the time since midnight to an initially outrageously large value
$MV_AptTimeSinceMidnight = 9e11;
if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {

      #$MV_PatientId		= $row["PatientId"];
      $MV_PatientFirstName	= $row["FirstName"];
      $MV_PatientLastName	= $row["LastName"];
      $MV_ScheduledStartTime	= $row["ScheduledStartTime"];
      $MV_ApptDescription	= $row["AppointmentCode"];
      $MV_Resource		= $row["ResourceDescription"];
      $MV_AptTimeSinceMidnight	= $row["AptTimeSinceMidnight"];
      $MV_AppointmentSerNum  	= $row["AppointmentSerNum"];
      $MV_Status		= $row["Status"];
    }
} else {
    echo "No further Medivisit appointments today";
}

//======================================================================================
// If there is an Aria and a Medivisit appointment, figure out which comes first, this 
// is the one we should check in for 
//======================================================================================
echo "MV_AptTimeSinceMidnight: $MV_AptTimeSinceMidnight; AptTimeSinceMidnight $AptTimeSinceMidnight<br>";


if($MV_AptTimeSinceMidnight < $AptTimeSinceMidnight) {
  echo "Medivisit apt comes first<br>";
  $nextApptSystem = "Medivisit";
} else {
  echo "Aria apt comes first<br>";
  $nextApptSystem = "Aria";
}

//======================================================================================
// Check in to Aria appointment, if there is one 
//======================================================================================
if($nextApptSystem === "Aria")
{
    echo "About to attempt Aria checkin<br>";
    $checkinSQL= "
	exec variansystem.dbo.vp_CheckInPatient \@nVenueLocationSer = $CheckinVenue, \@nScheduledActivitySer = $ScheduledActivitySer, \@strComment = null, \@strHstryUserName=N'$location'
	";

    # print the SQL query for debugging
    echo "checkinSQL: $checkinSQL<br><p>\n";

    # prepare and check the query for the database
    $query = mssql_query($checkinSQL);

}




//======================================================================================
// Check in to MediVisit/MySQL appointment, if there is one 
//======================================================================================
if($nextApptSystem === "Medivisit")
{
    echo "About to attempt Medivisit checkin<br>";

    $MV_CheckInURL_raw = "http://172.26.66.41/devDocuments/screens/php/checkInPatientMV.php?CheckinVenue=$CheckinVenue&ScheduledActivitySer=$MV_AppointmentSerNum";
    $MV_CheckInURL = str_replace(' ', '%20', $MV_CheckInURL_raw);

    # since a script exists for this, best to call it here rather than rewrite the wheel
    echo "MV_CheckInURL: $MV_CheckInURL<br>";
    $lines = file($MV_CheckInURL);

}

?>


