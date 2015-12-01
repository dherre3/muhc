<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);

$PatientId=$_POST["PatientId"];
$FirstName=$_POST["PatientFirstName"];
$LastName=$_POST["PatientLastName"];
$TelNumForSMS=$_POST["TelNumForSMS"];
$Email=$_POST["Email"];
$loginID=$_POST["LoginId"];
$Language=$_POST["Language"];
$PatientSSN=$_POST["PatientSSN"];
$PatientSerNum=$_POST["PatientSer"];
$Password=$_POST["Password"];
$EnableSMS=$_POST["EnableSMS"];
$var=$_POST;
$SSN=$_POST["SSN"];
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
  $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",".$PatientId.","."'".$FirstName."','".$LastName."','',".$TelNumForSMS.",".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";
  echo $sqlInsert;
  if ($conn->query($sqlInsert) === TRUE)
  {
    $query="SELECT PatientSerNum FROM Patient WHERE PatientId='".$PatientId."'";
    //echo $query;
    $serNum = $conn->query($query);
    $row=$serNum->fetch_assoc();
    echo json_encode($row);
    $sql="INSERT INTO `Users` (`UserSerNum`, `UserType`, `UserTypeSerNum`, `Username`, `Password`) VALUES (NULL,'Patient',".$row['PatientSerNum'].",'".$loginID."','')";
    echo $sql;
    if($conn->query($sql) === TRUE)
    {
      echo "Patient has been registered succesfully!";
    }else{
      echo "Insertion Query Failed!"; 
    }

  } else
  {
    echo "Insertion Query Failed!";
  }
}else
{
	echo "Patient is already registered!";
}

$conn->close();

?>
