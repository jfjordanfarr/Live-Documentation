/* What a customer owes: the sum of the customer's open invoices.
   A customer with none owes nothing. */
CREATE FUNCTION Billing.fn_Balance (@CustomerId INT)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    RETURN ISNULL((SELECT SUM(i.Amount) FROM Billing.Invoice AS i WHERE i.CustomerId = @CustomerId AND i.IsOpen = 1), 0);
END;
GO

CREATE FUNCTION Billing.fn_OpenInvoices (@CustomerId INT)
RETURNS TABLE
AS
RETURN
    WITH open_invoices AS (SELECT InvoiceId, Amount FROM Billing.Invoice WHERE CustomerId = @CustomerId AND IsOpen = 1)
    SELECT InvoiceId, Amount FROM open_invoices;
