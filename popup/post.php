<?php
$postUrl = "http://localhost/chrome_content_saver/popup/post.php";

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

function generate_random_string($num){
	$permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	$rand_key =  substr(str_shuffle($permitted_chars), 0, $num);
	return $rand_key;
}

function generate_valid_key(){
	$conn = $GLOBALS['conn'];
	while (True) {
		$rand_key =  generate_random_string(7);
		$sql = "SELECT * FROM `post_keys` WHERE `postkey` = '".$rand_key."'";
		$result = $conn->query($sql);

		if ($result->num_rows > 0) {
		    // output data of each row
		    while($row = $result->fetch_assoc()) {
		        //echo $row["postkey"];
		    }
		} else {
		    //echo "No Match key- unique";
		    $post_key = $rand_key;
		    break;
		}
	}
	$sql = "INSERT INTO `post_keys` (`postkey`) VALUES ('".$rand_key."')";
	$result = $conn->query($sql);
	return $post_key;
}



if($_GET){
	$category = $_GET["cat"];
	$solution = $_GET["sol"];
	$question = $_GET["ques"];
	$note = $_GET["note"];
	$url = $_GET["url"];
	$title = $_GET["title"];

	$sql = "SELECT `value` FROM `constants` WHERE `name` = 'Resource_Categories'";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
	    while($row = $result->fetch_assoc()) {
	        $categories = $row["value"];
	    }
	}
	$categories = explode(',', $categories);
	//array_push($categories,'NEW');
	?>
	<form action="post.php" method="post">
		<input type="hidden" name="action" value="details_form">
		<input type="hidden" name="postkey" value="<?php echo generate_valid_key();?>">
		<label for="">Title -  <?php echo $title;?></label><br>
		<input name="title" type="hidden" value="<?php echo $title;?>">
		<label for="">Url -  <?php echo $url;?></label><br>
		<input name="url" type="hidden" value="<?php echo $url;?>">
		Category <select name="select">
			<?php
			foreach($categories as $cat){
				if($cat == $category){
					echo "<option selected>".$cat."</option>";
				}else{
					echo "<option>".$cat."</option>";
				}
			}
			?>
		</select><br>
		Question <input type="text" placeholder="Question" name="question" value="<?php echo $question;?>"><br>
		Solution <input type="text" placeholder="Solution" name="solution" value="<?php echo $solution;?>"><br>
		Note <input type="text" placeholder="Note" name="note" value="<?php echo $note;?>"><br>
		
	</form>
	<button id="submit">Submit</button>
	<script src="jquery.min.js" type="text/javascript"></script>
	<script type="text/javascript">
		document.addEventListener("click", function(e) {
		  if(e.target.id == "submit"){
		    var action = document.getElementsByName("action")[0].value;
		    var title = document.getElementsByName("title")[0].value;
		    var url = document.getElementsByName("url")[0].value;
		    var select = document.getElementsByName("select")[0].value;
		    var question = document.getElementsByName("question")[0].value;
		    var solution = document.getElementsByName("solution")[0].value;
		    var note = document.getElementsByName("note")[0].value;
		    var postkey = document.getElementsByName("postkey")[0].value;
		    $.post( "<?php echo $postUrl; ?>",
		    	{"action":action,"title":title,"url":url,"select":select,"question":question,"solution":solution,"note":note,"postkey":postkey},
		    	function(txt){
		    		if(txt = postkey){
						document.body.innerHTML = "Successfully Done !!! Close the tab.";
		    		}
		    	}
		    );
		  }
		});
	</script>
	<?php
}else if($_POST){
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
	}else if($_POST['action']=='details_form'){
		$category = $_POST["select"];
		$solution = $_POST["solution"];
		$question = $_POST["question"];
		$note = $_POST["note"];
		$url = $_POST["url"];
		$title = $_POST["title"];
		$post_key = $_POST["postkey"];
		
		$sql = "INSERT INTO `data` (`title`, `resource_url`, `category`,`solution`,`postkey`,`question`,`note`)
		VALUES ('".$title."', '".$url."','".$category."','".$solution."','".$post_key."','".$question."','".$note."')";
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
	}else if($_POST['action']=='input_category'){
		$sql = "SELECT * FROM `constants` WHERE `name` = 'Resource_Categories'";
		$row = $conn->query($sql)->fetch_assoc();
		$update_cat = $row['value'].','.$_POST['new_category'];
		$sql = "UPDATE `constants` SET `value` = '".$update_cat."' WHERE `name` = 'Resource_Categories'";
		$conn->query($sql);

	}else if($_POST['action']=='save_this_session'){
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
		$note = $_POST['note'];
		$question = $_POST['question'];

		file_put_contents("debug.txt", $title . " - " . $url);

		$sql = "INSERT INTO `data` (`title`, `resource_url`, `category`,`solution`,`postkey`,`question`,`note`)
		VALUES ('".$title."', '".$url."','".$category."','".$solution."','".$post_key."','".$question."','".$note."')";
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


}



$conn->close();

?>