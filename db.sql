-- Run this in HeidiSQL to set up the database and tables

CREATE DATABASE IF NOT EXISTS royal_plastic_db;

USE royal_plastic_db;

CREATE TABLE IF NOT EXISTS messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  phone      VARCHAR(20)   NOT NULL,
  message    TEXT          NOT NULL,
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer     VARCHAR(100)   NOT NULL,
  phone        VARCHAR(20)    NOT NULL,
  address      TEXT           NOT NULL,
  product      VARCHAR(150)   NOT NULL,
  quantity     INT            NOT NULL DEFAULT 1,
  price        DECIMAL(10,2)  NOT NULL,
  total        DECIMAL(10,2)  NOT NULL,
  status       ENUM('Pending','Confirmed','Delivered','Cancelled') DEFAULT 'Pending',
  created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP
);
