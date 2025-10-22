-- init.sql
CREATE DATABASE IF NOT EXISTS CourierDB;
USE CourierDB;

-- Customers table
CREATE TABLE IF NOT EXISTS Customers (
  CustomerID INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(20),
  Address VARCHAR(255),
  UNIQUE KEY uniq_customer (FullName, PhoneNumber)
);

-- Couriers table
CREATE TABLE IF NOT EXISTS Couriers (
  CourierID INT AUTO_INCREMENT PRIMARY KEY,
  TrackingNumber VARCHAR(50) UNIQUE NOT NULL,
  SenderID INT,
  ReceiverID INT,
  Weight DECIMAL(10,2) DEFAULT 0.0,
  Status VARCHAR(50) DEFAULT 'Pending',
  DispatchDate DATE,
  DeliveryDate DATE,
  Remarks VARCHAR(255),
  FOREIGN KEY (SenderID) REFERENCES Customers(CustomerID) ON DELETE SET NULL,
  FOREIGN KEY (ReceiverID) REFERENCES Customers(CustomerID) ON DELETE SET NULL
);
