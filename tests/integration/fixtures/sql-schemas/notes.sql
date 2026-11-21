-- Neither the procedure's schema nor dbo, here the same, holds Notes, so T-SQL binds it to nothing in this folder,
-- though archive holds a Notes.
CREATE PROCEDURE dbo.ListNotes AS SELECT Id FROM Notes;
