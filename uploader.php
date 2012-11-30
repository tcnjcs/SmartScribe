
 <?php
	define("target", "uploads/");
	 
	if (!empty($_FILES["uploadedfile"])) {
	    $uploadedfile = $_FILES["uploadedfile"];
	 
	    if ($uploadedfile["error"] !== UPLOAD_ERR_OK) {
	        echo "An error occurred";
	        exit;
	    }
		
		if (file_exists(target . $uploadedfile["name"])){
			echo "The file name already exists";
			exit;
		}

	    // move the file to the uploads directory
	    $success = move_uploaded_file($uploadedfile["tmp_name"], target . $uploadedfile["name"]);
	    if (!$success) { 
	        echo "Unable to save file";
	        exit;
	    }
		
		header( 'Location: ./transcribe.php' ) ;
	}
	?>