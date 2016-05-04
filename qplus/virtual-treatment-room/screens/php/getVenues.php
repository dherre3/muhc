<?php
//==================================================================================== 
// getVenues.php - php code to query the Aria database and extract the list of venues 
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

//echo "Got a link $link<br>";

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

$sql = "

SELECT DISTINCT
Venue.VenueId AS VenueId,
Venue.VenueId AS VenueId2,
Venue.ResourceSer

FROM

variansystem.dbo.Venue Venue

WHERE 
Venue.VenueId LIKE '%AREA%'
OR Venue.VenueId LIKE '%DOOR%'
OR Venue.VenueId LIKE '%TX%'
OR Venue.VenueId LIKE '%CLINIC%'
OR Venue.VenueId LIKE '%TEST%'
OR Venue.VenueId LIKE '%Cyber%'

";


$query = mssql_query($sql);


/* Process results */
$json = array();

while($row = mssql_fetch_array($query)){
  #echo "$row[0]<br>";
 

     $json[] = $row;
}




/* Run the tabular results through json_encode() */
/* And ensure numbers don't get cast to trings */
#echo json_encode($json,<code> JSON_NUMERIC_CHECK</code>);
$json_data = json_encode($json);
#echo $json_data;
#echo json_encode($json);


$decode = json_decode($json_data);
foreach($decode as $item)
{
    if($item->VenueId == "DOOR A"){$item->VenueId = "Porte A / Door A";}
    if($item->VenueId == "DOOR B"){$item->VenueId = "Porte B / Door B";}
    if($item->VenueId == "DOOR C"){$item->VenueId = "Porte C / Door C";}
    if($item->VenueId == "DOOR D"){$item->VenueId = "Porte D / Door D";}
    if($item->VenueId == "RT TX ROOM 1"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 1 / Radiotherapy Room 1";}
    if($item->VenueId == "RT TX ROOM 2"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 2 / Radiotherapy Room 2";}
    if($item->VenueId == "RT TX ROOM 3"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 3 / Radiotherapy Room 3";}
    if($item->VenueId == "RT TX ROOM 4"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 4 / Radiotherapy Room 4";}
    if($item->VenueId == "RT TX ROOM 5"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 5 / Radiotherapy Room 5";}
    if($item->VenueId == "RT TX ROOM 6"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 6 / Radiotherapy Room 6";}
    if($item->VenueId == "CyberKnife"){$item->VenueId = "<span>&larr; &larr;</span> Salle de radiothérapie 7 / Radiotherapy Room 7";}
    if($item->VenueId == "TX AREA A"){$item->VenueId = "Aire de traitement A / Treatment Area A";}
    if($item->VenueId == "TX AREA B"){$item->VenueId = "Aire de traitement B / Treatment Area B";}
    if($item->VenueId == "TX AREA C"){$item->VenueId = "Aire de traitement C / Treatment Area C";}
    if($item->VenueId == "TX AREA D"){$item->VenueId = "Aire de traitement D / Treatment Area D";}
    if($item->VenueId == "TX AREA E"){$item->VenueId = "Aire de traitement E / Treatment Area E";}
    if($item->VenueId == "TX AREA F"){$item->VenueId = "Aire de traitement F / Treatment Area F";}
    if($item->VenueId == "TX AREA G"){$item->VenueId = "Aire de traitement G / Treatment Area G";}
    if($item->VenueId == "TX AREA H"){$item->VenueId = "Aire de traitement H / Treatment Area H";}
    if($item->VenueId == "TEST CENTRE WAIT"){$item->VenueId = "Salle d'attente du centre de prélèvements / Test Centre Waiting Room";}
    if($item->VenueId == "S1 CLINIC"){$item->VenueId = "Clinique Radio-oncologie / Radiation Oncology Clinic <span>&rarr; &rarr;</span>";}
}

$json_data = json_encode($decode);
echo $json_data;



/* Free statement and connection resources. */

if (!$query) {
    die('Query failed.');
}

// Free the query result
mssql_free_result($query);

?>


