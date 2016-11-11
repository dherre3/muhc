<?php
   require_once('pushIOS.php');
    $data = array(
        'mtitle' => "Hello",
        'mdesc' => "World"
    );
    $result = PushNotifications::iOS($data, "065d6f42deca7a36ee57c14384b031972622b3213819116b65dd69de09390542");
    echo json_encode($result);
?>