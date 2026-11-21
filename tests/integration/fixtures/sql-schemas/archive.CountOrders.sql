-- A string the procedure executes is a batch of its own, bound by the caller's default schema, not the procedure's.
CREATE PROCEDURE archive.CountOrders AS EXEC ('SELECT COUNT(*) FROM Orders');
