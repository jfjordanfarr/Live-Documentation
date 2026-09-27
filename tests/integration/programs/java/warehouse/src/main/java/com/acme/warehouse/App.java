package com.acme.warehouse;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;
import com.acme.warehouse.model.Unit;
import com.acme.warehouse.report.*;
import com.acme.warehouse.store.Inventory;
import com.acme.warehouse.store.MemoryInventory;

/** Receives two items and prints the report. Mentions of Movement in this comment are not references. */
public final class App {
    private App() {
    }

    public static void main(String[] args) {
        Inventory inventory = new MemoryInventory();
        Inventory.Listener listener = (item, delta) -> System.out.println("moved " + item.sku());
        inventory.listen(listener);

        inventory.receive(new Item("A-1", "Anvil", Unit.EACH), new Quantity(2, Unit.EACH));
        inventory.receive(new Item("B-2", "Bolts", Unit.KILOGRAM), new Quantity(1.5, Unit.KILOGRAM));

        Report report = new ReportWriter().write(inventory);
        System.out.println("Report has " + report.lines().size() + " lines; Report.Builder is not named here");
        for (String line : report.lines()) {
            System.out.println(line);
        }
    }
}
