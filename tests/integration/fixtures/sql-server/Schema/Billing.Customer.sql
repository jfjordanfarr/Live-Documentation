/*
    The customers of record.
    Kept by the billing team; a customer's name is written as the customer wrote it.
*/
CREATE TABLE Billing.Customer
(
    CustomerId INT           NOT NULL PRIMARY KEY,
    Name       NVARCHAR(100) NOT NULL,
    Note       NVARCHAR(200) NOT NULL DEFAULT N'it''s new'
);
