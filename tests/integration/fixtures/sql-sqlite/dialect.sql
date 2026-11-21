-- SQLite's spellings of what a script creates, which T-SQL does not write: each statement as SQLite runs it.
-- Every name starts with shop_, so that no other fixture's script, read in this repository as one workspace, names one.
CREATE TABLE IF NOT EXISTS shop_customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE "shop order lines" (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES shop_customers (id));
CREATE TABLE `shop_audit` (id INTEGER PRIMARY KEY, note TEXT);
CREATE TABLE [shop_legacy] (id INTEGER);
CREATE TABLE IF NOT EXISTS `shop_tick``ed` (id INTEGER);
CREATE INDEX IF NOT EXISTS shop_ix_customers_name ON shop_customers (name);
CREATE UNIQUE INDEX IF NOT EXISTS shop_ux_audit_note ON `shop_audit` (note);
CREATE VIEW IF NOT EXISTS shop_customer_names AS SELECT name FROM shop_customers;
CREATE TEMP TABLE shop_scratch (id INTEGER);
CREATE TEMPORARY TABLE IF NOT EXISTS shop_session_rows (id INTEGER);
CREATE TEMP VIEW shop_recent_customers AS SELECT * FROM shop_customers;
CREATE TRIGGER IF NOT EXISTS shop_customers_audit AFTER INSERT ON shop_customers
BEGIN
  INSERT INTO `shop_audit` (note) VALUES (NEW.name);
END;
CREATE VIRTUAL TABLE IF NOT EXISTS shop_notes USING fts5(body);
CREATE TABLE IF NOT EXISTS shop_customers_archive AS SELECT * FROM shop_customers;
DROP TABLE IF EXISTS shop_never_made;
DROP VIEW IF EXISTS shop_never_shown;
DROP INDEX IF EXISTS shop_never_indexed;
CREATE TABLE shop_after_the_trigger (id INTEGER);
