<?php
//==================================================================================== 
// getVenues.php - php code to query the Aria database and extract the list of venues 
//==================================================================================== 
include_once("config_screens.php");

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


