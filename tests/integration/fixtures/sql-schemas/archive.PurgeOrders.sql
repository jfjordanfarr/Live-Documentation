-- TRUNCATE TABLE is DDL, which binds a one-part name by the caller's default schema even inside an archive procedure.
CREATE PROCEDURE archive.PurgeOrders AS TRUNCATE TABLE Orders;
