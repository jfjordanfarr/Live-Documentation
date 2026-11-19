-- Totals the ledger entries for an account from the Oracle system of record,
-- reached through the ORALINK linked server.
CREATE PROCEDURE dbo.usp_LedgerTotals
    @AccountNumber NVARCHAR(32)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT e.ACCOUNT_NO, SUM(e.AMOUNT) AS Total
    FROM   OPENQUERY(ORALINK, 'select account_no, amount from ledger.entries') AS e
    WHERE  e.ACCOUNT_NO = @AccountNumber
    GROUP BY e.ACCOUNT_NO;
END;
