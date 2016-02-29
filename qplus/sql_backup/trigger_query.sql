DROP TRIGGER IF EXISTS `appointment_update_trigger`//
CREATE TRIGGER `appointment_update_trigger` AFTER UPDATE ON `Appointment`
 FOR EACH ROW BEGIN
 INSERT INTO `AppointmentMH`(`AppointmentSerNum`, `AppointmentRevCount`, `AliasExpressionSerNum`, `PatientSerNum`, `AppointmentAriaSer`, `ScheduledStartTime`, `ScheduledEndTime`, `ResourceSerNum`, `Location`, `Checkin`, `DateAdded`, `ReadStatus`, `LastUpdated`) VALUES (NEW.AppointmentSerNum,NULL,NEW.AliasExpressionSerNum, NEW.PatientSerNum,NEW.AppointmentAriaSer,NEW.ScheduledStartTime,NEW.ScheduledEndTime, NEW.ResourceSerNum, NEW.Location,NEW.Checkin, NEW.DateAdded,NEW.ReadStatus,NOW());
END
//

CREATE TABLE `HospitalMap` (
  `MapSerNum` int(11) unsigned NOT NULL,
  `Url` varchar(255) DEFAULT NULL,
  `MapNameAlias` varchar(255) DEFAULT NULL,
  `FileName` varchar(255) NOT NULL,
  `MapName_EN` varchar(255) DEFAULT NULL,
  `MapDescription_EN` varchar(255) DEFAULT NULL,
  `MapName_FR` varchar(255) DEFAULT NULL,
  `MapDescription_FR` varchar(255) DEFAULT NULL,
  `LastUpdated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;