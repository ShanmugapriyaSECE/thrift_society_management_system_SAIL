CREATE DATABASE thrift_society;

USE thrift_society;

CREATE TABLE ects_master (
    sno INT,
    emp VARCHAR(7) PRIMARY KEY,
    mth VARCHAR(4),
    ects_sub DECIMAL(10,2),
    ects_loan_bal DECIMAL(10,2),
    cect_subs DECIMAL(10,2),
    cplb DECIMAL(10,2),
    ects_memno INT,
    father_name VARCHAR(100),
    address VARCHAR(100),
    aadhar VARCHAR(15),
    name VARCHAR(100)
);

CREATE TABLE ects_loan_master (
    s_no INT,
    empno VARCHAR(7),
    loan_no INT,
    empname VARCHAR(35),
    desig VARCHAR(35),
    memno INT,
    date_of_loan DATE,
    loan_amt DECIMAL(10,2),
    inst_no INT,
    inst_amt DECIMAL(10,2),
    interest DECIMAL(10,2),
    tot_deduc DECIMAL(10,2),
    loan_balance DECIMAL(10,2),
    tot_nstalments INT,
    mnyr VARCHAR(10),
    arr_int INT,
    arr_amt INT,
    receipt INT
);