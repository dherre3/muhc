<?php

//header('Content-Type: image/jpg');
exec('gs  -sDEVICE=jpeg  -o %03d.jpeg  -dFirstPage=1  -dLastPage=1  -dJPEGQ=30  -r72x72   file.pdf');
?>