<?php
//==================================================================================== 
// getVenues.php - php code to query the Aria and MySQL (for Medivisit) databases and 
// extract the list of resources 
//==================================================================================== 
include_once("config_screens.php");

#-------------------------------------------------------------------------------------
# First, get the Aria resources
#-------------------------------------------------------------------------------------
$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

//echo "Got a link<br>";

if (!$link) {
    die('Something went wrong while connecting to MSSQL');
}

$sql = "
  SELECT DISTINCT
	vv_ResourceName.ResourceName
  FROM
  	variansystem.dbo.vv_ResourceName vv_ResourceName,
	variansystem.dbo.Resource Resource
  WHERE 
	Resource.SchedulableFlag = 1
	AND Resource.ResourceSer = vv_ResourceName.ResourceSer
";

$query = mssql_query($sql);

/* Process results */
$json = array();

while($row = mssql_fetch_array($query)){
  #echo "$row[0]<br>";
     $json[] = $row['ResourceName'];
}

#-------------------------------------------------------------------------------------
# Second, get the Medivisit resources from MySQL
# Only get those that are different to the Aria resources as the Aria resources will 
# have already been taken care of 
#-------------------------------------------------------------------------------------
// Create MySQL DB connection
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, 'WaitRoomManagement');

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
} 

$sql = "
  SELECT 
	MediVisitResources.ResourceName AS MediVisitResourceName
  FROM
    	MediVisitResources
";

/* Process results */
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
     	$json[] = $row['MediVisitResourceName'];
    }
} else {
    die("0 results from MySQL");
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

?>


