"""Writes one C# and one SQL file in each encoding Windows tools save in, into the folder given."""
import os
import sys

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

CS = """namespace Shop.Data
{
    /// <summary>Reads the café's customers.</summary>
    public class CustomerRepository
    {
        public Customer Find(int id) { return null; }
    }

    public class Customer { }
}
"""

SQL = """-- Lists the café's orders.
CREATE PROCEDURE dbo.usp_ListOrders
AS
BEGIN
    SELECT * FROM dbo.Orders;
END
GO
"""

ENCODINGS = {
    "utf8": lambda text: text.encode("utf-8"),
    "utf8bom": lambda text: b"\xef\xbb\xbf" + text.encode("utf-8"),
    "utf16le": lambda text: b"\xff\xfe" + text.replace("\n", "\r\n").encode("utf-16-le"),
    "utf16be": lambda text: b"\xfe\xff" + text.replace("\n", "\r\n").encode("utf-16-be"),
    "cp1252": lambda text: text.replace("\n", "\r\n").encode("cp1252"),
}

for name, encode in ENCODINGS.items():
    with open(os.path.join(out, f"Repo_{name}.cs"), "wb") as handle:
        handle.write(encode(CS.replace("CustomerRepository", f"CustomerRepository_{name}").replace("class Customer ", f"class Customer_{name} ")))
    with open(os.path.join(out, f"orders_{name}.sql"), "wb") as handle:
        handle.write(encode(SQL.replace("usp_ListOrders", f"usp_ListOrders_{name}")))
