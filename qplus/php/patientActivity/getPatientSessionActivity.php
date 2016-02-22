<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
	if ( isset($_POST["SessionId"]))
	{	
		include '../config.php';
		$con = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
		if ($con->connect_error) {
		      die("<br>Connection failed: " . $conn->connect_error);
		}else{
			//MessagesMH query
			$query="SELECT `MessageSerNum`, `MessagesRevSerNum`, `SessionId`, `SenderRole`, `ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`, `MessageContent`, `ReadStatus`, `Attachment`, `MessageDate`, `LastUpdated` FROM `MessagesMH` WHERE `SessionId` ='".$_POST['SessionId']."';";

			//DocumentMH query
			$query.="SELECT `DocumentSerNum`, `DocumentRevCount`, `SessionId`, `PatientSerNum`, `DocumentId`, `AliasExpressionSerNum`, `ApprovedBySerNum`, `ApprovedTimeStamp`, `Revised`, `ValidEntry`, `ErrorReasonText`, `OriginalFileName`, `FinalFileName`, `TransferStatus`, `TransferLog`, `DateAdded`, `ReadStatus`, `LastUpdated` FROM `DocumentMH` WHERE `SessionId` ='".$_POST['SessionId']."';";
			$query.="SELECT `PatientSerNum`, `PatientRevSerNum`, `SessionId`, `PatientAriaSer`, `PatientId`, `FirstName`, `LastName`, `Alias`, `ProfileImage`, `TelNum`, `EnableSMS`, `Email`, `Language`, `SSN`, `LastUpdated` FROM `PatientMH` WHERE `SessionId` ='".$_POST['SessionId']."';";
			$query.="SELECT `UserSerNum`, `UserRevSerNum`, `SessionId`, `UserType`, `UserTypeSerNum`, `Username`, `Password`, `LastUpdated` FROM `UsersMH` WHERE `SessionId` ='".$_POST['SessionId']."';";
			$query.="SELECT `AppointmentSerNum`, `AppointmentRevCount`, `SessionId`, `AliasExpressionSerNum`, `PatientSerNum`, `AppointmentAriaSer`, `ScheduledStartTime`, `ScheduledEndTime`, `ResourceSerNum`, `Location`, `Checkin`, `DateAdded`, `ReadStatus`, `LastUpdated` FROM `AppointmentMH` WHERE `SessionId` ='".$_POST['SessionId']."';";
			$fieldsArray=array('MessagesMH','DocumentsMH','PatientMH','UsersMH','AppointmentMH');
	 		$index=0;
			$patientDataArray=array();
			if (mysqli_multi_query($con,$query))
			{
			  do
			    {
			    // Store first result set
			    if ($result=mysqli_store_result($con)) {
			      // Fetch one and one row
			    	$json=array();
			      while ($row=mysqli_fetch_assoc($result))
			        {
			       	$json[]=$row;
			        }
			        $patientDataArray[$fieldsArray[$index]]=$json;

			        //Checking for the  last table query to spit the data.
			        if($fieldsArray[$index]=='AppointmentMH')
			       	{
						echo json_encode($patientDataArray);
			       	}
			       $index++;
			      // Free result set
			      mysqli_free_result($result);
			      }
			    }
			  while (mysqli_next_result($con));
			}else{
				echo 'error';
			}
		}
	}else{
		
		exit();
	}


	


	


?>