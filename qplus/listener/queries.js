var exports=module.exports={};

exports.patientTableFields=function()
{
  return "SELECT Patient.PatientSerNum,Patient.FirstName, Patient.LastName, Patient.TelNum, Patient.PatientId, Patient.Email, Patient.Alias, Patient.Language, Patient.EnableSMS,Patient.ProfileImage, Patient.SSN FROM Patient, Users WHERE Users.Username LIKE ? AND Users.UserTypeSerNum=Patient.PatientSerNum AND Patient.LastUpdated > ?;"
}

exports.patientDoctorTableFields=function()
{
  return "SELECT Doctor.FirstName, Doctor.LastName, Doctor.DoctorSerNum, PatientDoctor.PrimaryFlag, PatientDoctor.OncologistFlag, Doctor.Email,Doctor.Phone, Doctor.ProfileImage, Doctor.Address FROM Doctor, PatientDoctor, Patient, Users WHERE Users.Username Like ? AND Patient.PatientSerNum=Users.UserTypeSerNum AND PatientDoctor.PatientSerNum = Patient.PatientSerNum AND Doctor.DoctorSerNum = PatientDoctor.DoctorSerNum AND (Doctor.LastUpdated > ? OR PatientDoctor.LastUpdated > ?);"
}

exports.patientDiagnosisTableFields=function()
{
  return "SELECT Diagnosis.CreationDate, Diagnosis.Description_EN, Diagnosis.Description_FR FROM Diagnosis, Patient, Users WHERE Users.UserTypeSerNum=Patient.PatientSerNum AND Diagnosis.PatientSerNum = Patient.PatientSerNum AND Users.Username Like ? AND Diagnosis.LastUpdated > ?;";
}

exports.patientMessageTableFields=function()
{
  return "SELECT Messages.MessageSerNum, Messages.LastUpdated, Messages.SenderRole, Messages.ReceiverRole, Messages.SenderSerNum, Messages.ReceiverSerNum, Messages.MessageContent, Messages.ReadStatus, Messages.MessageDate FROM Messages, Patient, Users WHERE Patient.PatientSerNum=Users.UserTypeSerNum AND ((Messages.ReceiverRole='Patient' AND Patient.PatientSerNum = Messages.ReceiverSerNum) OR (Messages.SenderRole='Patient' AND Patient.PatientSerNum = Messages.SenderSerNum)) AND Users.Username Like ? AND Messages.LastUpdated > ? ORDER BY Messages.MessageDate ASC;"
}

exports.patientAppointmentsTableFields=function()
{
  return "SELECT Alias.AliasName_EN AS AppointmentType_EN, Alias.AliasName_FR AS AppointmentType_FR, Alias.AliasDescription_EN AS AppointmentDescription_EN, Alias.AliasDescription_FR AS AppointmentDescription_FR, Appointment.ScheduledStartTime, Appointment.AppointmentSerNum, Appointment.ScheduledEndTime,Appointment.Location, Appointment.Checkin,Appointment.Checkin, Appointment.Checkin, Appointment.ReadStatus, Appointment.ChangeRequest, Resource.ResourceName, HospitalMap.MapUrl,HospitalMap.MapName_EN,HospitalMap.MapName_FR,HospitalMap.MapDescription_EN,HospitalMap.MapDescription_FR FROM Appointment, AliasExpression, Alias,Resource, Patient, HospitalMap, Users WHERE HospitalMap.HospitalMapSerNum = Appointment.Location AND Resource.ResourceSerNum = Appointment.ResourceSerNum AND Patient.PatientSerNum = Appointment.PatientSerNum AND AliasExpression.AliasExpressionSerNum=Appointment.AliasExpressionSerNum AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Appointment.LastUpdated > ? OR Alias.LastUpdated > ?);";
}

exports.patientDocumentTableFields=function()
{
  return "SELECT Document.FinalFileName, Alias.AliasName_EN, Alias.AliasName_FR, Document.ReadStatus, Alias.AliasDescription_EN, Alias.AliasDescription_FR, Document.DocumentSerNum, Document.DateAdded FROM Document, Patient, Alias, AliasExpression, Users WHERE Document.AliasExpressionSerNum=AliasExpression.AliasExpressionSerNum AND Document.ValidEntry='Y' AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Patient.PatientSerNum=Document.PatientSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Document.LastUpdated > ? OR Alias.LastUpdated > ?);";
}

exports.patientNotificationsTableFields=function()
{
  return "SELECT NotificationRecords.NotificationSerNum, NotificationRecords.DateAdded, NotificationRecords.ReadStatus, NotificationRecords.RefTableRowSerNum, Notification.NotificationType, Notification.Name_EN, Notification.Name_FR, Notification.Description_EN, Notification.Description_FR FROM NotificationRecords, Notification, Patient, Users WHERE Notification.NotificationSerNum=NotificationRecords.NotificationSerNum AND NotificationRecords.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (NotificationRecords.LastUpdated > ? OR Notification.LastUpdated > ?);"
}
exports.patientTeamMessagesTableFields=function()
{
  return "SELECT TxRecords.RecordSerNum, TxRecords.DateAdded, TxRecords.ReadStatus, Post.PostType, Post.Body_EN, Post.Body_FR, Post.PostName_EN, Post.PostName_FR FROM Post, TxTeamMessageRecords as TxRecords, Patient, Users WHERE Post.PostSerNum=TxRecords.PostSerNum AND TxRecords.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (TxRecords.LastUpdated > ? OR Post.LastUpdated > ?);"
}
exports.patientAnnouncementsTableFields=function()
{
  return "SELECT Announcement.RecordSerNum, Announcement.DateAdded, Announcement.ReadStatus, Post.PostType, Post.Body_EN, Post.Body_FR, Post.PostName_EN, Post.PostName_FR FROM Post, AnnouncementRecords as Announcement, Users, Patient WHERE Post.PostSerNum=Announcement.PostSerNum AND Announcement.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (Announcement.LastUpdated > ? OR Post.LastUpdated > ?);";
}
exports.patientEducationalMaterialTableFields=function()
{
  return "SELECT Records.RecordSerNum, Records.DateAdded, Records.ReadStatus, EduMat.EducationalMaterialSerNum, EduMat.EducationalMaterialType_EN, EduMat.EducationalMaterialType_FR, EduMat.Name_EN, EduMat.Name_FR, EduMat.URL_EN, EduMat.URL_FR, EduMat.PhaseInTreatment, EduMat.DateAdded FROM EducationalMaterialTOC as TOC, EducationalMaterialRecords as Records, EducationalMaterial  as EduMat, Patient, Users WHERE EduMat.EducationalMaterialSerNum=Records.EducationalMaterialSerNum AND TOC.EducationalMaterialSerNum=EduMat.EducationalMaterialSerNum AND Patient.PatientSerNum = Records.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username = ?  AND (EduMat.LastUpdated > ? OR Records.LastUpdated > ? OR TOC.LastUpdated > ?);";
}
exports.patientEducationalMaterialContents=function()
{
  return "SELECT OrderNum, Name_EN, Name_FR, URL_EN, URL_FR, DateAdded FROM EducationalMaterialTOC WHERE EducationalMaterialSerNum = ? ORDER BY EducationalMaterialSerNum, OrderNum;";
}
exports.patientTasksTableFields=function()
{
  return "SELECT Alias.AliasName_EN AS TaskName_EN,Alias.AliasName_FR AS TaskName_FR,Alias.AliasDescription_EN AS TaskDescription_EN,Alias.AliasDescription_FR AS TaskDescription_FR,Task.DueDateTime FROM Task,Alias,AliasExpression,Patient,Users WHERE Patient.PatientSerNum = Task.PatientSerNum AND AliasExpression.AliasExpressionSerNum =Task.AliasExpressionSerNum AND AliasExpression.AliasSerNum = Alias.AliasSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Task.LastUpdated > ? OR Alias.LastUpdated > ?);";
}
exports.patientTestResultsTableFields=function()
{
  return 'SELECT ComponentName, FacComponentName, AbnormalFlag, MaxNorm, MinNorm, TestValue, TestValueString, UnitDescription, CAST(TestDate AS char(30)) as `TestDate` FROM TestResult, Users, Patient WHERE Users.UserTypeSerNum=Patient.PatientSerNum AND TestResult.PatientSerNum = Patient.PatientSerNum AND Users.Username LIKE ? AND TestResult.LastUpdated > ?;';
}

exports.getPatientFieldsForPasswordReset=function(userID)
{
  return 'SELECT Patient.SSN, Patient.PatientSerNum FROM Patient, Users WHERE Users.Username LIKE '+"\'"+ userID+"\'"+'AND Users.UserTypeSerNum = Patient.PatientSerNum';
}
exports.setNewPassword=function(password,patientSerNum, token)
{
  console.log("UPDATE Users SET Password='"+password+"', SessionId='"+token+"' WHERE UserType = 'Patient' AND UserTypeSerNum="+patientSerNum);
  return "UPDATE Users SET Password='"+password+"', SessionId='"+token+"' WHERE UserType = 'Patient' AND UserTypeSerNum="+patientSerNum;
}

exports.readMessage=function(MessageSerNum,token)
{
  return "UPDATE `Messages` SET ReadStatus=1, SessionId='"+token+"' WHERE Messages.MessageSerNum='"+MessageSerNum+"'";
}

exports.checkin=function(AppointmentSerNum,token)
{
  return "UPDATE Appointment SET Checkin=1, SessionId='"+token+"' WHERE Appointment.Checkin=0 AND Appointment.AppointmentSerNum='"+AppointmentSerNum+"'";
}
exports.readNotification=function(NotificationSerNum,token)
{
  return "UPDATE Notifications SET ReadStatus=1, SessionId='"+token+"' WHERE `Notifications`.`NotificationSerNum`='"+NotificationSerNum+"'";
}
exports.accountChange=function( serNum, field, newValue, token)
{
  return "UPDATE Patient SET "+field+"='"+newValue+"', SessionId='"+token+"' WHERE PatientSerNum LIKE '"+serNum+"'";
}
exports.inputFeedback=function(UserSerNum, content)
{
  return "INSERT INTO Feedback (`FeedbackSerNum`,`UserSerNum`,`FeedbackContent`,`SessionId`, `LastUpdated`) VALUES (NULL,'"+UserSerNum+"','"+ content + "',"+"CURRENT_TIMESTAMP )";
}
exports.sendMessage=function(objectRequest)
{
  var token=objectRequest.Token;
  objectRequest=objectRequest.Parameters;
  var senderRole=objectRequest.SenderRole;
  var receiverRole=objectRequest.ReceiverRole;
  var senderSerNum=objectRequest.SenderSerNum;
  var receiverSerNum=objectRequest.ReceiverSerNum;
  var messageContent=objectRequest.MessageContent;
  var messageDate=objectRequest.MessageDate;

  console.log("INSERT INTO Messages (`MessageSerNum`, `SenderRole`,`ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`,`MessageContent`,`ReadStatus`,`MessageDate`,`LastUpdated`) VALUES (NULL,'"+senderRole+"','"+ receiverRole + "', '"+senderSerNum+"','"+ receiverSerNum +"','" +messageContent+"',0,'"+messageDate+"' ,CURRENT_TIMESTAMP )");
  return "INSERT INTO Messages (`MessageSerNum`, `SenderRole`,`ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`,`MessageContent`,`ReadStatus`,`MessageDate`,`SessionId`,`LastUpdated`) VALUES (NULL,'"+senderRole+"','"+ receiverRole + "', '"+senderSerNum+"','"+ receiverSerNum +"','" +messageContent+"',0,'"+messageDate+"','"+token+"' ,CURRENT_TIMESTAMP )";
}
exports.getUserFromUserId=function(userID)
{
  return "SELECT UserTypeSerNum, UserSerNum FROM Users WHERE Username LIKE"+"\'"+ userID+"\'"+" AND UserType LIKE 'Patient'";
}
exports.logActivity=function(requestObject)
{

  return "INSERT INTO PatientActivityLog (`ActivitySerNum`,`Request`,`Username`, `DeviceId`,`SessionId`,`DateTime`,`LastUpdated`) VALUES (NULL,'"+requestObject.Request+ "', '"+requestObject.UserID+ "', '"+requestObject.DeviceId+"','"+requestObject.Token+"', CURRENT_TIMESTAMP ,CURRENT_TIMESTAMP )";
}

exports.userPassword=function(username)
{
  return "SELECT Password FROM Users WHERE Username LIKE '"+username+"'";
};
exports.getSecurityQuestions=function(serNum)
{
  return "SELECT Question, Answer FROM SecurityQuestion WHERE PatientSerNum="+serNum;
}


exports.updateLogout=function(requestObject)
{
  return "INSERT INTO PatientActivityLog (`ActivitySerNum`,`Request`,`Username`, `DeviceId`,`SessionId`,`DateTime`,`LastUpdated`) VALUES (NULL,'"+requestObject.Request+ "', '"+requestObject.Username+ "', '"+requestObject.DeviceId+"','"+requestObject.SessionId+"', '"+requestObject.DateTime+"' ,CURRENT_TIMESTAMP )";
}

exports.getMapLocation=function(qrCode)
{
  console.log("SELECT * FROM HospitalMap WHERE QRMapAlias = '"+qrCode+"';");
  return "SELECT * FROM HospitalMap WHERE QRMapAlias = '"+qrCode+"';";
}

exports.changeReadStatus=function(table, patientSerNum)
{
  return "UPDATE '"+table+"' SET ReadStatus=1 WHERE PatientSerNum="+patientSerNum;
}
exports.updateReadStatus=function()
{
  return "UPDATE ?? , Patient, Users SET ReadStatus = 0 WHERE ?? = ? AND Patient.PatientSerNum = ?? AND Patient.PatientSerNum = Users.UserTypeSerNum AND Users.Username = ?;";
}
exports.getPatientDeviceLastActivity=function(userid,device)
{
  return "SELECT * FROM PatientActivityLog WHERE Username='"+userid+"' AND DeviceId='"+device+"' ORDER BY ActivitySerNum DESC LIMIT 1;";
}
exports.getEducationMaterial=function(userId)
{
    return "SELECT E.DateAdded, E.ReadStatus, E.EducationalMaterialSerNum, P.PostName_FR, P.PostName_EN, P.Body_FR, P.Body_EN FROM EducationalMaterial as E, Users as U, Patient as Pa, Post as P WHERE Pa.PatientSerNum=E.PatientSerNum AND U.UserTypeSerNum=Pa.PatientSerNum AND U.Username LIKE '"+userID+"'";
}
