-- A linked server's object. With its schema left out, the linked server's login's default schema names it, which no
-- file states, so it binds to nothing here; with its schema written, it is that schema's object.
SELECT Id FROM Srv...Orders;
SELECT Id FROM Srv.Sales.archive.Orders;
