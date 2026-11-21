/*
    A customer's statement: the open invoices, the balance, and a note of when it was printed.

    Archives what is settled first, then reads what remains. The note is written into
    the customer's row: 'printed' with the date. A multi-line comment and a string that
    spans lines stand before the procedure, so that its line is counted past them.
*/
CREATE PROCEDURE [Billing].[usp_Statement]
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Archived INT;
    DECLARE @Lines TABLE (InvoiceId INT, Amount DECIMAL(18, 2), Product NVARCHAR(100));
    DECLARE @Banner NVARCHAR(200) = N'Statement
for customer';

    IF OBJECT_ID(N'Billing.Customer') IS NULL OR NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = N'Invoice')
        RETURN;

    EXEC @Archived = Billing.usp_Archive @CustomerId = @CustomerId;

    CREATE TABLE #Totals (CustomerId INT, Total DECIMAL(18, 2));

    WITH recent AS (SELECT InvoiceId, Amount, Lines FROM Billing.Invoice WHERE CustomerId = @CustomerId)
    INSERT @Lines (InvoiceId, Amount, Product)
    SELECT r.InvoiceId, r.Amount, r.Lines.value('(/lines/line/@product)[1]', 'NVARCHAR(100)')
    FROM recent AS r;

    INSERT #Totals (CustomerId, Total)
    SELECT @CustomerId, Billing.fn_Balance(@CustomerId);

    UPDATE c
    SET    Note = @Banner + N' printed ' + CONVERT(NVARCHAR(30), SYSUTCDATETIME())
    FROM   Billing.Customer AS c
    WHERE  c.CustomerId = @CustomerId;

    SELECT o.InvoiceId, o.Amount, t.Total
    FROM   #Totals AS t
    CROSS APPLY Billing.fn_OpenInvoices(t.CustomerId) AS o;

    EXEC (N'SELECT COUNT(*) FROM Billing.Invoice WHERE IsOpen = 1');
END;
