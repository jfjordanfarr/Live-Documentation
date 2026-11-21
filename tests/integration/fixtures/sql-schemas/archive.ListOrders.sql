-- In an archive procedure, Orders is archive.Orders, and Customers, which archive does not hold, is dbo.Customers.
CREATE PROCEDURE archive.ListOrders AS
SELECT o.Id FROM Orders AS o JOIN Customers AS c ON c.Id = o.Id;
