-- A second schema holding a table of the same name as dbo's, and one dbo has none of.
CREATE SCHEMA archive;
GO
CREATE TABLE archive.Orders (Id INT NOT NULL PRIMARY KEY);
GO
CREATE TABLE archive.Notes (Id INT NOT NULL PRIMARY KEY);
