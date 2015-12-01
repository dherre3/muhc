<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);

$PatientId=$_POST["PatientId"];
$FirstName=$_POST["FirstName"];
$LastName=$_POST["LastName"];
$TelNumForSMS=$_POST["TelNumForSMS"];
$Email=$_POST["Email"];
$loginID=$_POST["loginID"];
$Language=$_POST["Language"];
$Oncologist=$_POST["Oncologist"];
$Physician=$_POST["Physician"];
$PatientSSN=$_POST["PatientSSN"];
$PatientSerNum=$_POST["PatientSer"];
$Password=$_POST["Password"];
$EnableSMS=$_POST["EnableSMS"];





// Create DB connection
include 'config.php';
$conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);

// Check connection
if ($conn->connect_error) {
    die("<br>Connection failed: " . $conn->connect_error);
}
$sqlLookup="
	SELECT *
	FROM
	Patient
	WHERE
	PatientId='".$PatientId."' LIMIT 1
";
$lookupResult = $conn->query($sqlLookup);
// If patientId doesn't already exist , Register the patient
if ($lookupResult->num_rows===0) {
  $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",".$PatientId.","."'".$FirstName."','".$LastName."',NULL,".$TelNumForSMS.",'".$EnableSMS."','".$Email."','".$Language."','".$SSN."', NULL)";
  echo $sqlInsert;
  if ($conn->query($sqlInsert) === TRUE)
  {
    echo "Registration was successful. A confirmation email was sent to you.";
    $PatientControlInsert="
    SELECT PatientSerNum INTO patientcontrol WHERE patient.PatientAriaSer=". $PatientSerNum ;
  } else
  {
     echo "Insertion Query Failed!"; }
  }
else
{
	echo "Patient is already registered!";
}

$conn->close();

?>
