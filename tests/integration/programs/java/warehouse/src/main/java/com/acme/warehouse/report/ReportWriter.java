package com.acme.warehouse.report;

import java.util.Map;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;

import static com.acme.warehouse.model.Quantity.none;

/** Turns what an inventory holds into a {@link Report}. */
public class ReportWriter {

    /** A report of everything the inventory has on hand, named without an import. */
    public Report write(com.acme.warehouse.store.Inventory inventory) {
        Report.Builder builder = new Report.Builder();
        for (Map.Entry<Item, Quantity> entry : inventory.onHand().entrySet()) {
            builder.add(entry.getKey(), entry.getValue());
        }
        return builder.build();
    }

    /** The quantity of an item the inventory lacks: none, in the item's unit. */
    public static <T extends Item> Quantity missing(T item) {
        return none(item.unit());
    }
}
