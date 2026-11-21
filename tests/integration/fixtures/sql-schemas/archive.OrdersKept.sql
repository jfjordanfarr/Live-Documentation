-- A trigger lives in its table's schema, so its one-part Orders is archive.Orders though its own name writes no schema.
CREATE TRIGGER OrdersKept ON archive.Orders AFTER DELETE AS INSERT INTO Orders (Id) VALUES (0);
