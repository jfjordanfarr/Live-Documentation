-- The account of record, in the Oracle database at the centre of the estate.
CREATE TABLE CENTRAL.ACCOUNT
(
    ACCOUNT_NO VARCHAR2(32)   NOT NULL PRIMARY KEY,
    BALANCE    NUMBER(18, 2)  NOT NULL
);
