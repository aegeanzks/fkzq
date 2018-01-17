/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50547
Source Host           : localhost:3306
Source Database       : demo_db

Target Server Type    : MYSQL
Target Server Version : 50547
File Encoding         : 65001

Date: 2018-01-10 17:10:45
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `groupid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`groupid`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of groups
-- ----------------------------
INSERT INTO `groups` VALUES ('1', '管理员', '2017-12-20 09:20:33', '2017-12-20 09:20:38');
INSERT INTO `groups` VALUES ('2', '超级管理员', '2017-12-20 09:20:49', '2017-12-20 09:20:53');

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `migration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES ('2014_10_12_000000_create_users_table', '1');
INSERT INTO `migrations` VALUES ('2014_10_12_100000_create_password_resets_table', '1');
INSERT INTO `migrations` VALUES ('2017_12_18_070508_create_groups_table', '1');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `groupid` int(11) NOT NULL DEFAULT '1',
  `isdelete` int(11) NOT NULL DEFAULT '0',
  `realname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `mobile` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `loginip` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'chenhang', '89206261@qq.com', '$2y$10$dUBkYbjcwzPhPlU7VUDpk.LRkPrDDNBarURNsiWSqARXOrdYcBXoG', 'vzOUimN7GMb412KuiYjQTyq8DhbZ6SGSS5KZxa7O5F5OiCnB3rtJiirVsbti', '2017-12-20 01:18:31', '2017-12-21 09:55:05', '2', '0', '陈先生', '18860023333', '36.63.123.203');
INSERT INTO `users` VALUES ('2', 'hanghang', '88888@qq.com', '$2y$10$dUBkYbjcwzPhPlU7VUDpk.LRkPrDDNBarURNsiWSqARXOrdYcBXoG', 'YPxLiCSdmcxqlol4VvS2wCiUyecjQqP8TW6FrsMBZN8kINnGoUyyfHqAWpTO', '2017-12-20 15:25:02', '2017-12-21 08:29:11', '1', '1', '黄先生', '19952526365', '45.52.232.11');
INSERT INTO `users` VALUES ('4', 'chenlong', '999999@qq.com', '$2y$10$xLKtzR3b64ziuq22Vp43SO85DQ9HNDIvRacgZXF2XyX7.RKirgTni', null, '2017-12-21 07:29:17', '2018-01-10 08:14:22', '2', '0', '陈空', '18865653636', '123.63.63.95');
INSERT INTO `users` VALUES ('5', 'huangxiaoxiao', '9658123@qq.com', '$2y$10$TQ6fy.ALpReO87j4hwKdreWZuTm9ql3YptgLw.ZqJoSWgk8p3YeqG', null, '2017-12-21 07:34:16', '2017-12-21 07:34:16', '1', '0', '黄晓晓', '17869693232', '');
