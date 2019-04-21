<?php
date_default_timezone_set("Asia/Dhaka");
$date_now = date("Y-m-d");

$ini_array = parse_ini_file("config.ini");
$servername = $ini_array["servername"];
$username = $ini_array["username"];
$password = $ini_array["password"];
$dbname = $ini_array["dbname"];

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if($_POST['action']=='save_this_session'){
	$urls = explode(",", $_POST['urls']);
	$postkey = $_POST['postkey'];
	foreach($urls as $url){
		$sql = "SELECT `date` FROM `browsing` WHERE `url` = '".$url."' and `date`='".$date_now."'";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) {
		} else {
		    $sql = "INSERT INTO `browsing` (`date`,`url`,`postkey`) VALUES ('".$date_now."','".$url."','".$postkey."')";
		    $conn->query($sql);
		}
	}

	$sql = "SELECT * FROM `browsing` WHERE `postkey` = '".$postkey."'";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
	    // output data of each row
	    while($row = $result->fetch_assoc()) {
	        echo $row["postkey"];
	        break;
	    }
	} else {
	    echo "No Match key";
	}

}
else if($_POST['action']=='restore_last_session'){
	$arr = array();
	$sql = "SELECT * FROM `browsing` WHERE `date`='".$date_now."'";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		foreach ($result as $row) {
			array_push($arr,$row['url']);
		}
		
	} else {
	    
	}
	echo json_encode($arr);
}
else if($_POST['action']=='post_data'){
	$category = $_POST["tag"];
	$url =  $_POST["url"];
	$title = $_POST["title"];
	$solution = $_POST["solution"];
	$post_key = $_POST['postkey'];

	file_put_contents("debug.txt", $title . " - " . $url);

}else if($_POST['action']=='get_cats'){
	$sql = "SELECT `value` FROM `constants` WHERE `name` = 'Resource_Categories'";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
	    // output data of each row
	    while($row = $result->fetch_assoc()) {
	        echo $row["value"];
	    }
	} else {
	    echo "No Match key";
	}
}



if($_POST['action'] == "validate_key"){
	$sql = "SELECT * FROM `post_keys` WHERE `postkey` = '".$_POST['key_need']."'";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
	    // output data of each row
	    while($row = $result->fetch_assoc()) {
	        echo $row["postkey"];
	    }
	} else {
	    echo "No Match key";
	    $sql = "INSERT INTO `post_keys` (`postkey`) VALUES ('".$_POST["key_need"]."')";
		$conn->query($sql);
	}
}else if($_POST['action'] == "post_data"){
	$sql = "INSERT INTO `data` (`title`, `resource_url`, `category`,`solution`,`postkey`)
	VALUES ('".$title."', '".$url."','".$category."','".$solution."','".$post_key."')";
	$conn->query($sql);

	$sql = "SELECT * FROM `data` WHERE `postkey` = '".$post_key."'";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
	    // output data of each row
	    while($row = $result->fetch_assoc()) {
	        echo $row["postkey"];
	    }
	} else {
	    echo "0 results";
	}	
}


$conn->close();

?>