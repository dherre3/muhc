<?php
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) $_POST = json_decode(file_get_contents('php://input'), true);
	include '../config.php';
	  $conn = new mysqli("localhost", DB_USERNAME, DB_PASSWORD, MYSQL_DB);  // Check connection
	  if ($conn->connect_error) {
	      die("<br>Connection failed: " . $conn->connect_error);
	  }
	$filter=1;
	$username=1;

	if ( isset($_POST["Filter"]))
	{	
		$filter="DateTime BETWEEN '".$_POST["filter"]."' AND NOW()";	
	}
	if(isset($_POST["Username"]))
	{
		$username="Username LIKE '".$_POST["Username"]."'";
	}
	$query="SELECT * FROM PatientActivityLog WHERE (Request='Login' OR Request='Logout') AND ".$filter." AND ".$username." AND DateTime>'2016-02-11' ORDER BY Username, DateTime ASC;";
	echo $query;
	$queryResults = $conn->query($query);

	if($queryResults->num_rows===0)
	{

		echo 'No activity found';
	}else{
		$json=array();
		while($row = $queryResults->fetch_assoc())
	    {
	        $json[] = $row;
	    }
	    echo json_encode($json);   
	}





?>