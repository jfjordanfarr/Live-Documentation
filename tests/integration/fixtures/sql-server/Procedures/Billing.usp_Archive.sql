CREATE PROCEDURE Billing.usp_Archive
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE Billing.Invoice WHERE CustomerId = @CustomerId AND IsOpen = 0;
    RETURN @@ROWCOUNT;
END;
