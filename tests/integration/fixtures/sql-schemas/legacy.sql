-- Created without a schema, as scripts written before schemas were, so in its creator's default schema, dbo; then
-- altered by its schema, which T-SQL takes for the same procedure.
CREATE PROCEDURE ListLegacy AS SELECT 1 AS Id;
GO
ALTER PROCEDURE dbo.ListLegacy AS SELECT Id FROM Orders;
