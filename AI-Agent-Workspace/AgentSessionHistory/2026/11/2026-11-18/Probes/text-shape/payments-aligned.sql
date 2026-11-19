-- Payments posted in a period, with the account, its customer and the invoice each settles.
-- Aligned by eye: every alias at one column, every join and its conditions lined up.
SELECT
    p.PaymentId                                   AS payment_id,
    p.PostedAt                                    AS posted_at,
    p.Amount                                      AS amount,
    p.Currency                                    AS currency,
    a.AccountNumber                               AS account_number,
    a.Status                                      AS account_status,
    c.CustomerId                                  AS customer_id,
    c.DisplayName                                 AS customer_name,
    c.Region                                      AS customer_region,
    i.InvoiceNumber                               AS invoice_number,
    i.DueAt                                       AS invoice_due_at,
    i.Total                                       AS invoice_total,
    i.Total - COALESCE(s.SettledSoFar, 0)         AS invoice_open,
    m.MethodName                                  AS method_name,
    b.BatchCode                                   AS batch_code
FROM       dbo.Payments          AS p
INNER JOIN dbo.Accounts          AS a  ON a.AccountId    = p.AccountId
INNER JOIN dbo.Customers         AS c  ON c.CustomerId   = a.CustomerId
LEFT  JOIN dbo.Invoices          AS i  ON i.InvoiceId    = p.InvoiceId
                                      AND i.CustomerId   = c.CustomerId
LEFT  JOIN dbo.PaymentMethods    AS m  ON m.MethodId     = p.MethodId
LEFT  JOIN dbo.PostingBatches    AS b  ON b.BatchId      = p.BatchId
                                      AND b.ClosedAt    IS NOT NULL
LEFT  JOIN (SELECT   x.InvoiceId,
                     SUM(x.Amount)                AS SettledSoFar
            FROM     dbo.Payments AS x
            WHERE    x.PostedAt   <  @PeriodStart
            GROUP BY x.InvoiceId)    AS s  ON s.InvoiceId    = i.InvoiceId
WHERE      p.PostedAt   >= @PeriodStart
  AND      p.PostedAt   <  @PeriodEnd
  AND      p.Amount     >  0
  AND      a.Status     IN ('Open', 'Suspended')
  AND      c.Region     =  @Region
ORDER BY   p.PostedAt,
           p.PaymentId;
