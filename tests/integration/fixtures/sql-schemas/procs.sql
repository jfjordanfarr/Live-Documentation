-- A dbo procedure's one-part Orders is dbo.Orders, its module's schema; SisterDb..Orders omits only the schema and
-- reads as SisterDb.dbo.Orders does.
CREATE PROCEDURE dbo.ListOrders AS SELECT Id FROM Orders;
GO
CREATE PROCEDURE dbo.ListSisterOrders AS
BEGIN
    SELECT Id FROM SisterDb..Orders;
    SELECT Id FROM SisterDb.dbo.Orders;
END;
