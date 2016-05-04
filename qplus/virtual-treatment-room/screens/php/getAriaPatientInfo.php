<?php
//==================================================================================== 
// getAriaPatientInfo.php - php code to query the Aria database and extract the list of patients
// who are currently checked in for open appointments today
//==================================================================================== 
include_once("config_screens.php");

$link = mssql_connect(ARIA_DB, ARIA_USERNAME, ARIA_PASSWORD);

$SSN = $_GET["SSN"];

#echo "Got a link<br>";

if (!$link) {
    die('Something went wrong while connecting to MSSQL - getAriaPatientInfo');
}

$sql = "

SELECT DISTINCT
Patient.LastName,
Patient.FirstName,
Patient.PatientId

FROM

variansystem.dbo.Patient

WHERE
Patient.SSN LIKE '%$SSN%'
";

# Need to be sure that appointments are open*****

$query = mssql_query($sql);
#echo "here<br>SQL: $sql";


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

?>


