The PaymentService folder has six files, in two groups. Here is how they connect, based on the map's view of the code:

**Top level of `PaymentService/`**
- **`PaymentService.cs`** is the main service class. It is the hub of the folder. It offers the network endpoint `net.tcp://payments.onprem.example:8732/PaymentService`, which is configured in `App.config`. It also calls the `sqlserver` database and is called by the `hub` service.
- **`App.config`** holds the endpoint address that `PaymentService.cs` offers. The map draws a direct "offers" link between the two.
- **`PaymentService.csproj`** is the project file. It has no code-level links to the other files. It declares the packages the service uses: EntityFramework 6.5.1, System.ComponentModel.DataAnnotations, System.Data, and System.ServiceModel. It is the only file linked to those packages.

**`Data/` subfolder**
- **`PaymentsContext.cs`** is the Entity Framework database context. It has one connection to the rest of the code and links to the other data files.
- **`Payment.cs`** is a data model class. It has about six symbols and one connection.
- **`PostPaymentRow.cs`** is another data class with about four symbols. The map shows it linked to the context and to the service.

The lines in the map show `Data/` files feeding into both `PaymentService.cs` and `App.config`. I couldn't read every edge label, so I can't say exactly which file each line runs to. The map does show the context and models are used by the service, which in turn is exposed through `App.config`.

Two side notes: clicking the folder label in the map added pins to the view (the counter now says "2 pins"). I didn't change any files.
