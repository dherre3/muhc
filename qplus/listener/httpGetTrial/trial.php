<?php
if ($_SERVER['REQUEST_METHOD'] == 'GET' && empty($_GET)){
  $_GET = json_decode(file_get_contents('php://input'), true);
}
?>

//Things to be done:

- Checkin for all the appointments for the day. Is this really necessary?
- Push notifications Android and iOS system
- Re-run and test the admin panel, registration of patients and doctors.
- Including the waiting time estimates for the treatment plan.
- Translation.
- Dealing with the security concerns from the security people about documents and confidentiality
- Encryption of documents in device, for iOS is fine but for Android we will have to let the user know that they are responsible for those
documents being free on the device
- Determining what we need in the core
 - Questions about: Maps, parking, lab results, messaging, diagnosis translation, treatment plan descriptions. 
 
- Descriptions in general to help the patient understand the data on the phone
- Contact information for doctors
- Educational material?
- SMS notifications?
- Document provided** (when, why, what)
- Admin Panel, every user should have the same credentials across all platforms!!
- Alerts and handling of notifications within the app!