-- SQLite's spellings of what a script creates, which T-SQL does not write: each statement as SQLite runs it.
CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE "order lines" (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers (id));
CREATE TABLE `audit` (id INTEGER PRIMARY KEY, note TEXT);
CREATE TABLE [legacy] (id INTEGER);
CREATE TABLE IF NOT EXISTS `tick``ed` (id INTEGER);
CREATE INDEX IF NOT EXISTS ix_customers_name ON customers (name);
CREATE UNIQUE INDEX IF NOT EXISTS ux_audit_note ON `audit` (note);
CREATE VIEW IF NOT EXISTS customer_names AS SELECT name FROM customers;
CREATE TEMP TABLE scratch (id INTEGER);
CREATE TEMPORARY TABLE IF NOT EXISTS session_rows (id INTEGER);
CREATE TEMP VIEW recent_customers AS SELECT * FROM customers;
CREATE TRIGGER IF NOT EXISTS customers_audit AFTER INSERT ON customers
BEGIN
  INSERT INTO `audit` (note) VALUES (NEW.name);
END;
CREATE VIRTUAL TABLE IF NOT EXISTS notes USING fts5(body);
CREATE TABLE IF NOT EXISTS customers_archive AS SELECT * FROM customers;
DROP TABLE IF EXISTS never_made;
DROP VIEW IF EXISTS never_shown;
DROP INDEX IF EXISTS never_indexed;
CREATE TABLE after_the_trigger (id INTEGER);
