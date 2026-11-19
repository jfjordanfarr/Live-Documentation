I opened PaymentService and expanded its Data subfolder. The folder has six files: **PostPaymentRow.cs**, **Payment.cs** and **PaymentsContext.cs** in Data, plus **PaymentService.cs**, **App.config** and **PaymentService.csproj** at the top level.

On this map, each line runs from the file that offers something to the file that uses it. Here are the links I can see:

- **Payment.cs** and **PostPaymentRow.cs** both feed into **PaymentsContext.cs** and **PaymentService.cs**. They look like the data shapes those two files use.
- **PaymentsContext.cs** feeds into **PaymentService.cs**.
- **App.config** feeds into **PaymentsContext.cs**, probably supplying settings like the connection string.
- **PaymentService.cs** and **App.config** depend on each other in a loop. The map marks this as "1 connection returns in a cycle" on both cards. Before I expanded Data, the map showed a direct line between them.
- **PaymentService.csproj** has no lines to the other files here. It's just the project file, and its one connection goes outside the folder.

So **PaymentService.cs** is the hub: everything else in the folder flows into it. It also has the most links leaving the folder (about 9 more on its card).

I read the direction of each line from the map's colours, so a few arrows could be the other way around. I didn't copy anything to the clipboard.
