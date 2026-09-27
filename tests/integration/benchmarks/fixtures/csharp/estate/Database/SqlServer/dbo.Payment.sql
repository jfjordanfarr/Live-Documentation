CREATE TABLE dbo.Payment
(
    PaymentId     NVARCHAR(36)   NOT NULL PRIMARY KEY,
    AccountNumber NVARCHAR(32)   NOT NULL,
    Amount        DECIMAL(18, 2) NOT NULL,
    Status        NVARCHAR(16)   NOT NULL,
    PostedAt      DATETIME2      NOT NULL
);
