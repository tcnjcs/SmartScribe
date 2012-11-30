<!-- Upload a file -->
<html>
<?php include "./header.php"; ?>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<head>
		<title>SmartScribe - Upload</title>
		<link href="css/page_style.css" rel="stylesheet" type="text/css" />
		<script>
		
		</script>
	</head>
	
	<body>
	<table align="center">
		<tr>
		<td align="center">
			<table id="main_frame" align="center">
				<tr height="50px"></tr>
				<tr>
					<th align="center">Please select a video file to upload</th>
				</tr>
				<tr height="10px"></tr>
					<td align="center">
						<table>
							<td>
								<form enctype="multipart/form-data" action="uploader.php" method="POST">
								Choose a file to upload: <input name="uploadedfile" type="file" /><br />
							</td>
							<td align="right">
								<input type="submit" value="Upload File" />
							</td>
							</form>
						</table>
					</td>
			</table>
		</td>
		<td align="right" valign="top">
			<table>
				<td align="right">
				<ul id="toolbar">
					<li><a href="./index.php">Home</a></li>
					<li><a href="./transcribe.php">Transcribe Audio</a></li>
					<li><a href="./upload.php">Upload File</a></li>
					<li><a href="./browse.php">Browse Transciptions</a></li>
					<li><a href="./account.php">Account</a></li>
				</ul>
				</td>
			</table>
		</td>
		</tr>
	</table>
	
	</body>

</html>