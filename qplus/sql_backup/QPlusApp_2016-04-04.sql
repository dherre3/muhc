# ************************************************************
# Sequel Pro SQL dump
# Version 4499
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.5.42)
# Database: QPlusApp
# Generation Time: 2016-04-04 15:32:35 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table EducationalMaterial
# ------------------------------------------------------------

DROP TABLE IF EXISTS `EducationalMaterial`;

CREATE TABLE `EducationalMaterial` (
  `EducationalMaterialSerNum` int(11) NOT NULL AUTO_INCREMENT,
  `EducationalMaterialControlSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `DateAdded` datetime NOT NULL,
  `ReadStatus` int(11) NOT NULL DEFAULT '0',
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`EducationalMaterialSerNum`),
  KEY `EducationalMaterialSerNum` (`EducationalMaterialControlSerNum`),
  KEY `PatientSerNum` (`PatientSerNum`),
  CONSTRAINT `EducationalMaterial_ibfk_3` FOREIGN KEY (`EducationalMaterialControlSerNum`) REFERENCES `EducationalMaterialControl` (`EducationalMaterialControlSerNum`) ON UPDATE CASCADE,
  CONSTRAINT `EducationalMaterial_ibfk_2` FOREIGN KEY (`PatientSerNum`) REFERENCES `Patient` (`PatientSerNum`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `EducationalMaterial` WRITE;
/*!40000 ALTER TABLE `EducationalMaterial` DISABLE KEYS */;

INSERT INTO `EducationalMaterial` (`EducationalMaterialSerNum`, `EducationalMaterialControlSerNum`, `PatientSerNum`, `DateAdded`, `ReadStatus`, `LastUpdated`)
VALUES
	(2,4,51,'2016-03-30 18:36:13',0,'2016-03-30 18:36:13'),
	(6,8,51,'2016-03-31 16:35:51',0,'2016-03-31 16:35:51'),
	(7,9,51,'2016-03-31 16:41:04',0,'2016-03-31 16:41:04'),
	(8,5,51,'2016-03-31 16:41:36',0,'2016-03-31 16:41:36'),
	(11,10,51,'2016-03-31 16:45:38',0,'2016-03-31 16:45:38');

/*!40000 ALTER TABLE `EducationalMaterial` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table EducationalMaterialControl
# ------------------------------------------------------------

DROP TABLE IF EXISTS `EducationalMaterialControl`;

CREATE TABLE `EducationalMaterialControl` (
  `EducationalMaterialControlSerNum` int(11) NOT NULL AUTO_INCREMENT,
  `EducationalMaterialType_EN` varchar(100) NOT NULL,
  `EducationalMaterialType_FR` varchar(100) NOT NULL,
  `TransferFlag` int(11) NOT NULL DEFAULT '0',
  `Name_EN` varchar(200) NOT NULL,
  `Name_FR` varchar(200) NOT NULL,
  `URL_EN` varchar(2000) NOT NULL,
  `URL_FR` varchar(2000) NOT NULL,
  `PhaseInTreatmentSerNum` int(11) NOT NULL,
  `DateAdded` datetime NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EducationalMaterialControlSerNum`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `EducationalMaterialControl` WRITE;
/*!40000 ALTER TABLE `EducationalMaterialControl` DISABLE KEYS */;

INSERT INTO `EducationalMaterialControl` (`EducationalMaterialControlSerNum`, `EducationalMaterialType_EN`, `EducationalMaterialType_FR`, `TransferFlag`, `Name_EN`, `Name_FR`, `URL_EN`, `URL_FR`, `PhaseInTreatmentSerNum`, `DateAdded`, `LastUpdated`)
VALUES
	(4,'Video','Video',0,'Planning for your radiotherapy','La planification de votre radiothérapie','https://www.youtube.com/watch?v=c8nHbGPs5SE','https://www.youtube.com/watch?v=c8nHbGPs5SE',1,'2016-03-21 16:18:33','2016-03-21 16:18:33'),
	(5,'Booklet','Brochure',0,'Beginning Radiotherapy','debut de la radiotherapie','https://www.depdocs.com/opal/www/pdfs/radiotherapy_journey.pdf','https://www.depdocs.com/opal/www/pdfs/radiotherapy_journey.pdf',1,'2016-03-31 16:10:23','2016-03-31 16:09:02'),
	(6,'Factsheet','Fiche Descriptive',0,'What is Raditherapy?','Qu\'est-ce que la radiothérapie','https://www.depdocs.com/opal/educational/pathway/PathwayTemplate1.php','https://www.depdocs.com/opal/educational/pathway/PathwayTemplate1.php',1,'2016-03-31 16:15:24','2016-03-31 16:11:53'),
	(7,'Factsheet','Fiche Descriptive',0,'Your Radiotherapy Pathway','Votre Radiothérapie Pathway','https://www.depdocs.com/opal/educational/pathway/PathwayTemplate2.php','https://www.depdocs.com/opal/educational/pathway/PathwayTemplate2.php',1,'2016-03-31 16:15:28','2016-03-31 16:11:57'),
	(8,'Booklet','Brochure',0,'Radiotherapy at the Cedars Cancer Center','Radiothérapie au Centre Cèdres contre le cancer','','',1,'2016-03-31 16:32:24','2016-03-31 16:15:44'),
	(9,'Treatment Guidelines','Treatment Guidelines',0,'Breast Cancer','Cancer du Sein','https://www.depdocs.com/opal/www/pdfs/breast-radiotherapy-treatment-guidelines.pdf','https://www.depdocs.com/opal/www/pdfs/breast-radiotherapy-treatment-guidelines.pdf',2,'2016-03-31 16:44:46','2016-03-31 16:38:09'),
	(10,'Factsheet','Fiche Descriptive',0,'When Radiotherapy Treatment Ends','Quand la Fin du Traitement de Radiothérapie','https://www.depdocs.com/opal/www/pdfs/end-of-radiotherapy-treatment-guidelines.pdf','https://www.depdocs.com/opal/www/pdfs/end-of-radiotherapy-treatment-guidelines.pdf',3,'2016-03-31 16:44:50','2016-03-31 16:42:26');

/*!40000 ALTER TABLE `EducationalMaterialControl` ENABLE KEYS */;
UNLOCK TABLES;
-- phpMyAdmin SQL Dump
-- version 4.4.1.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 07, 2016 at 06:35 PM
-- Server version: 5.5.42
-- PHP Version: 5.6.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `QPlusApp`
--

-- --------------------------------------------------------

--
-- Table structure for table `PhaseInTreatment`
--

CREATE TABLE `PhaseInTreatment` (
  `PhaseInTreatmentSerNum` int(11) unsigned NOT NULL,
  `Name_EN` varchar(255) DEFAULT NULL,
  `Name_FR` varchar(255) DEFAULT NULL,
  `LastUpdated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `PhaseInTreatment`
--

INSERT INTO `PhaseInTreatment` (`PhaseInTreatmentSerNum`, `Name_EN`, `Name_FR`, `LastUpdated`) VALUES
(1, 'Prior To Treatment', 'Avant le traitement', '2016-03-31 20:28:25'),
(2, 'During Treatment', 'Au cours du traitement', '2016-03-31 20:28:57'),
(3, 'After Treatment', 'Après le traitement', '2016-03-31 20:29:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `PhaseInTreatment`
--
ALTER TABLE `PhaseInTreatment`
  ADD PRIMARY KEY (`PhaseInTreatmentSerNum`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `PhaseInTreatment`
--
ALTER TABLE `PhaseInTreatment`
  MODIFY `PhaseInTreatmentSerNum` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- phpMyAdmin SQL Dump
-- version 4.4.1.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 07, 2016 at 06:36 PM
-- Server version: 5.5.42
-- PHP Version: 5.6.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `QPlusApp`
--

-- --------------------------------------------------------

--
-- Table structure for table `Notification`
--

CREATE TABLE `Notification` (
  `NotificationSerNum` int(11) NOT NULL,
  `PatientSerNum` int(11) NOT NULL,
  `NotificationControlSerNum` int(11) NOT NULL,
  `RefTableRowSerNum` int(11) NOT NULL,
  `DateAdded` datetime DEFAULT NULL,
  `ReadStatus` tinyint(1) NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Notification`
--

INSERT INTO `Notification` (`NotificationSerNum`, `PatientSerNum`, `NotificationControlSerNum`, `RefTableRowSerNum`, `DateAdded`, `ReadStatus`, `LastUpdated`) VALUES
(4, 51, 2, 2, '2016-01-19 11:13:29', 1, '2016-04-06 22:37:22'),
(7, 51, 4, 1, '2016-03-24 00:00:00', 1, '2016-04-06 22:37:20'),
(8, 51, 5, 1, '2016-03-29 00:00:00', 1, '2016-04-06 22:36:23'),
(9, 51, 6, 1, '2016-03-31 00:00:00', 1, '2016-04-06 22:36:22'),
(14, 51, 7, 2, '2016-03-30 20:15:15', 1, '2016-04-06 22:36:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`NotificationSerNum`),
  ADD KEY `NotificationControlSerNum` (`NotificationControlSerNum`),
  ADD KEY `PatientSerNum` (`PatientSerNum`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Notification`
--
ALTER TABLE `Notification`
  MODIFY `NotificationSerNum` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=15;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Notification`
--
ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_ibfk_2` FOREIGN KEY (`NotificationControlSerNum`) REFERENCES `NotificationControl` (`NotificationControlSerNum`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Notification_ibfk_1` FOREIGN KEY (`PatientSerNum`) REFERENCES `Patient` (`PatientSerNum`) ON UPDATE CASCADE;




# Dump of table EducationalMaterialTOC
# ------------------------------------------------------------

DROP TABLE IF EXISTS `EducationalMaterialTOC`;

CREATE TABLE `EducationalMaterialTOC` (
  `EducationalMaterialTOCSerNum` int(11) NOT NULL AUTO_INCREMENT,
  `ParentSerNum` int(11) NOT NULL,
  `OrderNum` int(11) NOT NULL,
  `EducationalMaterialControlSerNum` int(11) NOT NULL,
  `DateAdded` datetime NOT NULL,
  `LastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`EducationalMaterialTOCSerNum`),
  KEY `EducationalMaterialSerNum` (`ParentSerNum`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `EducationalMaterialTOC` WRITE;
/*!40000 ALTER TABLE `EducationalMaterialTOC` DISABLE KEYS */;

INSERT INTO `EducationalMaterialTOC` (`EducationalMaterialTOCSerNum`, `EducationalMaterialControlSerNum`, `ParentSerNum`, `OrderNum`, `DateAdded`, `LastUpdated`)
VALUES
	(9,8,1,7,'2016-03-21 16:18:33','2016-04-01 09:54:20'),
	(11,8,2,6,'2016-03-21 16:18:33','2016-04-01 09:54:24');

/*!40000 ALTER TABLE `EducationalMaterialTOC` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
