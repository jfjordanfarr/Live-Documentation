package com.acme.warehouse.store;

import java.util.Map;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;

/**
 * Where stock is kept.
 *
 * @see MemoryInventory
 */
public interface Inventory {

    /** Told about every movement of stock. */
    interface Listener {
        void moved(Item item, Quantity delta);
    }

    /**
     * Adds stock of an item.
     *
     * @param item  the item received
     * @param delta how much arrived
     * @return the quantity on hand afterwards
     * @throws IllegalArgumentException if the delta's unit is not the item's
     */
    Quantity receive(Item item, Quantity delta);

    /** Everything on hand, by item. */
    Map<Item, Quantity> onHand();

    /** Registers a listener; the default keeps none. */
    default void listen(Listener listener) {
    }
}
