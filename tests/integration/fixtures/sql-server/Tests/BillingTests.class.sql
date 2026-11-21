-- Tests in the shape tSQLt gives them: a class is a schema, a test a procedure whose
-- name is a sentence, quoted in brackets, apostrophes, dots and all.
EXEC tSQLt.NewTestClass 'BillingTests';
GO

CREATE PROCEDURE BillingTests.[test it doesn't count a settled invoice]
AS
BEGIN
    CREATE TABLE BillingTests.Expected (Total DECIMAL(18, 2));
    INSERT INTO BillingTests.Expected VALUES (0);

    EXEC tSQLt.FakeTable 'Billing.Invoice';
    INSERT INTO Billing.Invoice (InvoiceId, CustomerId, Amount, IsOpen) VALUES (1, 7, 10, 0);

    SELECT Billing.fn_Balance(7) AS Total INTO BillingTests.Actual;

    EXEC tSQLt.AssertEqualsTable 'BillingTests.Expected', 'BillingTests.Actual';
END;
GO

CREATE PROCEDURE BillingTests.[test fn_Balance.sums the open ones]
AS
BEGIN
    DECLARE @Balance DECIMAL(18, 2);
    EXEC tSQLt.FakeTable 'Billing.Invoice';
    INSERT INTO Billing.Invoice (InvoiceId, CustomerId, Amount, IsOpen) VALUES (1, 7, 10, 1), (2, 7, 5, 1);
    SET @Balance = Billing.fn_Balance(7);
    EXEC tSQLt.AssertEquals 15, @Balance;
END;
GO
