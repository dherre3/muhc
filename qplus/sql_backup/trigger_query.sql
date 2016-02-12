DROP TRIGGER IF EXISTS `appointment_update_trigger`//
CREATE TRIGGER `appointment_update_trigger` AFTER UPDATE ON `Appointment`
 FOR EACH ROW BEGIN
 INSERT INTO `AppointmentMH`(`AppointmentSerNum`, `AppointmentRevCount`, `AliasExpressionSerNum`, `PatientSerNum`, `AppointmentAriaSer`, `ScheduledStartTime`, `ScheduledEndTime`, `ResourceSerNum`, `Location`, `Checkin`, `DateAdded`, `ReadStatus`, `LastUpdated`) VALUES (NEW.AppointmentSerNum,NULL,NEW.AliasExpressionSerNum, NEW.PatientSerNum,NEW.AppointmentAriaSer,NEW.ScheduledStartTime,NEW.ScheduledEndTime, NEW.ResourceSerNum, NEW.Location,NEW.Checkin, NEW.DateAdded,NEW.ReadStatus,NOW());
END
//

