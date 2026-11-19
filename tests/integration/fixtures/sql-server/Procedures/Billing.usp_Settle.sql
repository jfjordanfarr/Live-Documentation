-- Deployed by an idempotent script: a stub when the procedure is missing, then its body.
IF OBJECT_ID(N'Billing.usp_Settle') IS NULL
    EXEC ('CREATE PROCEDURE Billing.usp_Settle AS BEGIN SELECT 1 END');
GO

ALTER PROCEDURE Billing.usp_Settle
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Archive NVARCHAR(200) = N'SELECT * FROM Billing.Archive';

    EXEC sp_executesql N'UPDATE Billing.Invoice SET IsOpen = 0 WHERE CustomerId = @c', N'@c INT', @c = @CustomerId;
    EXEC (N'SELECT CustomerId, Name FROM Billing.' + N'Customer WHERE Note = ''settled''');
    EXEC (@Archive);

    SELECT a.BALANCE
    FROM   OPENQUERY(ORACLE_CENTRAL, 'SELECT BALANCE FROM CENTRAL.ACCOUNT') AS a;
END;
GO

-- A view this folder never creates, brought up to date where it lives.
ALTER VIEW Billing.vw_Legacy AS SELECT 1 AS Settled;
