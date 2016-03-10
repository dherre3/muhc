var exports=module.exports={};

exports.patientQuery=function(userID)
{
  return 'SELECT ' +
                      'Patient.PatientSerNum,' +
                      'Patient.FirstName, ' +
                      'Patient.LastName,' +
                      'Patient.TelNum,' +
                      'Patient.PatientId, '+
                      'Patient.Email,' +
                      'Patient.Alias, '+
                      'Patient.Language,' +
                      'Patient.EnableSMS,' +
                      'Patient.ProfileImage, ' +
                      'Patient.SSN '+
                    'From ' +
                      'Patient, '+
                      'Users ' +
                    'WHERE '+
                      'Users.Username LIKE '+"\'"+ userID+"\'"+'AND Users.UserTypeSerNum = Patient.PatientSerNum';
}
exports.patientTableFields=function()
{
  return "SELECT Patient.PatientSerNum,Patient.FirstName, Patient.LastName, Patient.TelNum, Patient.PatientId, Patient.Email, Patient.Alias, Patient.Language, Patient.EnableSMS,Patient.ProfileImage, Patient.SSN FROM Patient, Users WHERE Users.Username LIKE ? AND Users.UserTypeSerNum=Patient.PatientSerNum AND Patient.LastUpdated > ?;"
}
exports.patientDoctorsQuery=function(userID)
{
  return 'SELECT '+
                      'Doctor.FirstName, '+
                      'Doctor.LastName, '+
                      'Doctor.DoctorSerNum, '+
                      'PatientDoctor.PrimaryFlag, '+
                      'PatientDoctor.OncologistFlag, '+
                      'Doctor.Email, '+
                      'Doctor.Phone, '+
                      'Doctor.ProfileImage, ' +
                      'Doctor.Address '+
                      'FROM '+
                        'Doctor, '+
                        'PatientDoctor, '+
                        'Patient, '+
                        'Users ' +
                      'WHERE '+
                        'Users.Username Like '+ "'" + userID +"'" +
                       ' AND '+
                       'Patient.PatientSerNum=Users.UserTypeSerNum AND '+
                        'PatientDoctor.PatientSerNum = Patient.PatientSerNum AND '+
                        'Doctor.DoctorSerNum = PatientDoctor.DoctorSerNum';
}
exports.patientDoctorTableFields=function()
{
  return "SELECT Doctor.FirstName, Doctor.LastName, Doctor.DoctorSerNum, PatientDoctor.PrimaryFlag, PatientDoctor.OncologistFlag, Doctor.Email,Doctor.Phone, Doctor.ProfileImage, Doctor.Address FROM Doctor, PatientDoctor, Patient, Users WHERE Users.Username Like ? AND Patient.PatientSerNum=Users.UserTypeSerNum AND PatientDoctor.PatientSerNum = Patient.PatientSerNum AND Doctor.DoctorSerNum = PatientDoctor.DoctorSerNum AND Doctor.LastUpdated > ?;"
}

exports.patientDiagnosesQuery=function(userID)
{
  return 'SELECT '+
                      'Diagnosis.CreationDate, '+
                      'Diagnosis.Description_EN, '+
                      'Diagnosis.Description_FR '+
                      'FROM '+
                        'Diagnosis, '+
                        'Patient, '+
                        'Users ' +
                      'WHERE '+
                        'Users.Username Like '+ "'" + userID +"'" +
                       ' AND '+
                       'Users.UserTypeSerNum=Patient.PatientSerNum AND '+
                        'Diagnosis.PatientSerNum = Patient.PatientSerNum';
}
exports.patientDiagnosisTableFields=function()
{
  return "SELECT Diagnosis.CreationDate, Diagnosis.Description_EN, Diagnosis.Description_FR FROM Diagnosis, Patient, Users WHERE Users.UserTypeSerNum=Patient.PatientSerNum AND Diagnosis.PatientSerNum = Patient.PatientSerNum AND Users.Username Like ? AND Diagnosis.LastUpdated > ?;";
}
exports.patientMessagesQuery=function(userID)
{
  return 'SELECT '+
                      'Messages.MessageSerNum, '+
                      'Messages.SenderRole, '+
                      'Messages.ReceiverRole, '+
                      'Messages.SenderSerNum, '+
                      'Messages.ReceiverSerNum, '+
                      'Messages.MessageContent, '+
                      'Messages.ReadStatus, '+
                      'Messages.MessageDate '+
                      'FROM '+
                        'Messages, '+
                        'Patient, '+
                        'Users ' +
                      'WHERE '+
                        '(Users.Username Like '+ "'" + userID +"' )" +
                       ' AND '+
                       'Patient.PatientSerNum=Users.UserTypeSerNum AND' +
                        "( (Messages.ReceiverRole='Patient' AND Patient.PatientSerNum = Messages.ReceiverSerNum) OR (Messages.SenderRole='Patient' AND Patient.PatientSerNum = Messages.SenderSerNum) )";
}
exports.patientMessageTableFields=function()
{
  return "SELECT Messages.MessageSerNum, Messages.LastUpdated, Messages.SenderRole, Messages.ReceiverRole, Messages.SenderSerNum, Messages.ReceiverSerNum, Messages.MessageContent, Messages.ReadStatus, Messages.MessageDate FROM Messages, Patient, Users WHERE Patient.PatientSerNum=Users.UserTypeSerNum AND ((Messages.ReceiverRole='Patient' AND Patient.PatientSerNum = Messages.ReceiverSerNum) OR (Messages.SenderRole='Patient' AND Patient.PatientSerNum = Messages.SenderSerNum)) AND Users.Username Like ? AND Messages.LastUpdated > ?;"
}
exports.patientAppointmentsQuery=function(userID)
{
  return 'SELECT '+
                      'Alias.AliasName_EN AS AppointmentType_EN, '+
                      'Alias.AliasName_FR AS AppointmentType_FR, '+
                      'Alias.AliasDescription_EN AS AppointmentDescription_EN, '+
                      'Alias.AliasDescription_FR AS AppointmentDescription_FR, '+
                      'Appointment.ScheduledStartTime, '+
                      'Appointment.AppointmentSerNum, '+
                      'Appointment.ScheduledEndTime, '+
                      'Appointment.Location, '+
                      'Appointment.Checkin, '+
                      'Appointment.ChangeRequest, '+
                      'Resource.ResourceName '+
                    'From '+
                      'Appointment, '+
                      'AliasExpression, '+
                      'Alias, ' +
                      'Resource, '+
                      'Patient, '+
                      'Users ' +
                    'WHERE '+
                      'Resource.ResourceSerNum = Appointment.ResourceSerNum AND '+
                      'Patient.PatientSerNum = Appointment.PatientSerNum AND '+
                      'AliasExpression.AliasExpressionSerNum=Appointment.AliasExpressionSerNum AND '+
                      'AliasExpression.AliasSerNum=Alias.AliasSerNum AND '+
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '+
                      'Users.Username Like '+"'"+ userID+"'";
}

exports.patientDocumentsQuery=function(userID)
{
  return 'SELECT '+
                      'Document.FinalFileName, '+
                      'Alias.AliasName_EN, ' +
                      'Alias.AliasName_FR, '+
                      'Document.ReadStatus, '+
                      'Alias.AliasDescription_EN, '+
                      'Alias.AliasDescription_FR, '+
                      'Document.DocumentSerNum, ' +
                      'Document.DateAdded ' +
                    'From '+
                      'Document,'+
                      'Patient, '+
                      'Alias, '+
                      'AliasExpression, ' +
                      'Users ' +

                    'WHERE '+
                      'Document.AliasExpressionSerNum = AliasExpression.AliasExpressionSerNum AND '+
                      "Document.ValidEntry = 'Y' AND " +
                      'AliasExpression.AliasSerNum = Alias.AliasSerNum AND '+
                      'Patient.PatientSerNum = Document.PatientSerNum AND '+
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '+
                      'Users.Username Like '+"'"+ userID+"'";


}
exports.patientDocumentTableField=function()
{
  return "SELECT Document.FinalFileName, Alias.AliasName_EN, Alias.AliasName_FR, Document.ReadStatus, Alias.AliasDescription_EN, Alias.AliasDescription_FR, Document.DocumentSerNum, Document.DateAdded FROM Document, Patient, Alias, AliasExpression, Users WHERE Document.AliasExpressionSerNum=AliasExpression.AliasExpressionSerNum AND Document.ValidEntry='Y' AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Patient.PatientSerNum=Document.PatientSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND Document.LastUpdated > ?;";
}
exports.patientNotificationsQuery=function(userID)
{
  return 'SELECT '+
                      'Notifications.NotificationSerNum, '+
                      'Notifications.Type, '+
                      'Notifications.TypeSerNum, '+
                      'Notifications.AliasSerNum, '+
                      'Notifications.ReadStatus, '+
                      'Notifications.DateAdded, '+
                      'Alias.AliasName_FR, '+
                      'Alias.AliasDescription_EN, '+
                      'Alias.AliasName_EN, '+
                      'Alias.AliasDescription_FR '+
                    'From '+
                      'Notifications, '+
                      'Patient, '+
                      'Users, ' +
                      'Alias ' +
                    'WHERE '+
                      'Alias.AliasSerNum = Notifications.AliasSerNum AND '+
                      'Patient.PatientSerNum = Notifications.PatientSerNum AND '+
                      'Users.UserTypeSerNum=Patient.PatientSerNum AND '+
                      'Users.Username Like '+"'"+ userID+"'";
}
//To be decided!!!!!
exports.notesQuery=function(userID)
{
  return 'SELECT '+
                  'patientnotes.NoteSerNum, '+
                  'patientnotes.Title, '+
                  'patientnotes.Content, '+
                  'patientnotes.DateAdded '+
                'From '+
                  'patientnotes, '+
                  'patient '+
                'WHERE '+
                  'patient.PatientSerNum = patientnotes.PatientSerNum AND '+
                  'patient.LoginID Like '+"\'"+ userID+"\'";
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
exports.patientTasksQuery=function(userID)
{

  return 'SELECT '+
             'Alias.AliasName_EN AS TaskName_EN, '+
             'Alias.AliasName_FR AS TaskName_FR, '+
             'Alias.AliasDescription_EN AS TaskDescription_EN, '+
             'Alias.AliasDescription_FR AS TaskDescription_FR, '+
             'Task.DueDateTime '+
           'From '+
             'Task, '+
             'Alias, '+
             'AliasExpression, '+
             'Patient, '+
             'Users '+
           'WHERE '+
             'Patient.PatientSerNum = Task.PatientSerNum AND ' +
             'AliasExpression.AliasExpressionSerNum =Task.AliasExpressionSerNum AND '+
             'AliasExpression.AliasSerNum = Alias.AliasSerNum AND '+
             'Users.UserTypeSerNum=Patient.PatientSerNum AND '+
             'Users.Username Like '+"'"+ userID+"'";

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
exports.getPatientFromUserId=function(userID)
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

exports.patientLabResultsQuery=function(userID)
{
  return "SELECT ComponentName, FacComponentName, AbnormalFlag, MaxNorm, MinNorm, "+
  "TestValue, TestValueString, UnitDescription, CAST(TestDate AS char(30)) as `TestDate`"+
  " FROM TestResult, Users, Patient "+
  'WHERE Users.UserTypeSerNum=Patient.PatientSerNum AND TestResult.PatientSerNum = Patient.PatientSerNum AND '+
  'Users.Username Like '+"'"+ userID+"'";
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
exports.changeReadStatus=function(table, patientSerNum)
{
  return "UPDATE '"+table+"' SET ReadStatus=1 WHERE PatientSerNum="+patientSerNum;
}
exports.getPatientDeviceLastActivity=function(userid,device)
{
  return "SELECT * FROM PatientActivityLog WHERE Username='"+userid+"' AND DeviceId='"+device+"' ORDER BY ActivitySerNum DESC LIMIT 1;";
}
exports.getEducationMaterial=function(userId)
{
    return "SELECT E.DateAdded, E.ReadStatus, E.EducationalMaterialSerNum, P.PostName_FR, P.PostName_EN, P.Body_FR, P.Body_EN FROM EducationalMaterial as E, Users as U, Patient as Pa, Post as P WHERE Pa.PatientSerNum=E.PatientSerNum AND U.UserTypeSerNum=Pa.PatientSerNum AND U.Username LIKE '"+userID+"'";
}
