-- An invoice belongs to a customer; its total is the sum of its lines.
CREATE TABLE [Billing].[Invoice]
(
    InvoiceId  INT            NOT NULL PRIMARY KEY,
    CustomerId INT            NOT NULL REFERENCES Billing.Customer (CustomerId),
    Amount     DECIMAL(18, 2) NOT NULL,
    Lines      XML            NULL,
    IsOpen     BIT            NOT NULL
);
