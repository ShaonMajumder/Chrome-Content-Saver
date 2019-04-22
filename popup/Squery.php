<?php
/*
Usage::
$MySquery = new MyQueries($conn);

$result = $MySquery->insert('data', array('resource_url','read_count','postkey'), array('url','0','gdfg'));

$result = $MySquery->edit('data',array('read_count','postkey'),array('0','518swb'),"`title` = 'switch to tab id chrome.tabs - Google Search'");

$result = $MySquery->delete("post_keys","`postkey` = 'gdgr'");
*/

class MyQueries {
	//private $conn;
 
	function __construct(mysqli $conn) {
		$this->conn = $conn;
	}

	function insert($database,$insert_fields,$insert_values){
		$fields = '(`'.implode("`,`", $insert_fields)."`)";
		$values = "('".implode("','", $insert_values)."')";
		$sql = "INSERT INTO `{$database}` {$fields} VALUES {$values}";
		$result = $this->conn->query($sql);
		return $result;
	}
	function delete($database,$condition) {
		$sql = "DELETE FROM `{$database}` WHERE {$condition}";
		$result = $this->conn->query($sql);
		return $result;
	}
	function edit($data,$update_key,$update_values,$condition) {
		$stri = "";
		foreach ($update_key as $keya => $vala) {
			$valb = $update_values[$keya];
			$stri = $stri . "`{$vala}` = '{$valb}',";
		}
		$stri = rtrim($stri,",");
		$sql = "UPDATE `{$data}` SET {$stri} WHERE {$condition}";
		$result = $this->conn->query($sql);
		return $result;
	}
}
?>