-- A script outside any module binds by the caller's default schema, which the text does not give; dbo is the default.
-- dbo.ListLegacy is the procedure legacy.sql creates without a schema, in that same default.
SELECT Id FROM Orders;
EXEC dbo.ListLegacy;
