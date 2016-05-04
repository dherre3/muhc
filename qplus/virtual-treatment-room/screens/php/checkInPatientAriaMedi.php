<?php
//==================================================================================== 
// checkInPatientAriaMedi.php - php code to check a patient into Aria or Medivisit/MySQL
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');
$row  = "";

// Extract the webpage parameters
$CheckinVenue 		= $_GET["CheckinVenue"];
$ScheduledActivitySer	= $_GET["ScheduledActivitySer"];
$location		= $_GET["location"];
$DB			= $_GET["DB"];

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

//======================================================================================
// Aria checkin
//======================================================================================
if($DB === "Aria")
{  $sql = "
  declare @var INT

  SET @var = (SELECT 
  Venue.ResourceSer AS ResourceSer
  FROM
  variansystem.dbo.Venue Venue
  WHERE 
  Venue.VenueId='$CheckinVenue')

  exec variansystem.dbo.vp_CheckInPatient @nVenueLocationSer = @var, @nScheduledActivitySer = $ScheduledActivitySer, @strComment = null, @strHstryUserName=N'DS1_1' 

  ";

  #echo "SQL: $sql<br>";

  $query = mssql_query($sql);

  /* Process results */
  $row = mssql_fetch_array($query);
  #echo "row: $row[1]<br>";

  if (!$query) {
      die('Query failed.');
  }

  // Free the query result
  mssql_free_result($query);
}

//======================================================================================
// MediVisit/MySQL checkin
//======================================================================================
if($DB === "MediVisit")
{
  # First, 
  $sql = "";

 


}



?>


