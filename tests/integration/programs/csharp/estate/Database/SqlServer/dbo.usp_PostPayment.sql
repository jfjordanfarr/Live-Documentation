-- Posts a payment and returns the account balance from the system of record.
-- The balance lives in the Oracle database reached through the ORACLE_CENTRAL linked server.
CREATE PROCEDURE dbo.usp_PostPayment
    @AccountNumber NVARCHAR(32),
    @Amount        DECIMAL(18, 2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PaymentId NVARCHAR(36) = CONVERT(NVARCHAR(36), NEWID());

    INSERT INTO dbo.Payment (PaymentId, AccountNumber, Amount, Status, PostedAt)
    VALUES (@PaymentId, @AccountNumber, @Amount, N'Posted', SYSUTCDATETIME());

    SELECT @PaymentId                          AS PaymentId,
           N'Posted'                           AS Status,
           CONVERT(DECIMAL(18, 2), a.BALANCE)  AS AccountBalance
    FROM   ORACLE_CENTRAL..CENTRAL.ACCOUNT AS a
    WHERE  a.ACCOUNT_NO = @AccountNumber;
END;
