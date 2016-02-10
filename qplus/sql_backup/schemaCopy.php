<?php
system("rm -f ./backups/*");
$file='./backups/db_backup'.date("Y-m-d").'.sql'; 
system("mysqldump -u root -p QPlusApp > ".$file);
?>