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
$response= array();
if ($lookupResult->num_rows===0) {
if(!isset($TelNumForSMS)){
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",".$PatientId.","."'".$FirstName."','".$LastName."','',NULL,".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";

  }else{
    $sqlInsert="INSERT INTO `Patient`(`PatientSerNum`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated`) VALUES (NULL,".$PatientSerNum.",".$PatientId.","."'".$FirstName."','".$LastName."','',".$TelNumForSMS.",".$EnableSMS.",'".$Email."','".$Language."','".$SSN."', NULL)";
  }
  if ($conn->query($sqlInsert) === TRUE)
  {
    $query="SELECT PatientSerNum FROM Patient WHERE PatientId='".$PatientId."'";
    //echo $query;
    $serNum = $conn->query($query);
    $row=$serNum->fetch_assoc();

    $sql="INSERT INTO `Users` (`UserSerNum`, `UserType`, `UserTypeSerNum`, `Username`, `Password`) VALUES (NULL,'Patient',".$row['PatientSerNum'].",'".$loginID."','')";
  
    if($conn->query($sql) === TRUE)
    {
      $response['Type']='success';
      $response['Response']="Patient has been registered succesfully!";
      echo json_encode($response);
    }else{
      $response['Type']='danger';
      $response['Response']="Server problem, missing fields in request!";
      echo json_encode($response);
    }

  } else
  {
      $response['Type']='danger';
      $response['Response']="Server problem, missing fields in request!";
      echo json_encode($response);
  }
}else
{
      $response['Type']='warning';
      $response['Response']="Patient has already been registered!";
      echo json_encode($response);
}

$conn->close();

?>
