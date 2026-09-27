package com.acme.warehouse.store;

import org.junit.jupiter.api.Test;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;
import com.acme.warehouse.model.Unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Same package as {@link MemoryInventory}, in the other source root. */
class MemoryInventoryTest {

    @Test
    void receivingAddsUp() {
        MemoryInventory inventory = new MemoryInventory();
        Item bolts = new Item("B-2", "Bolts", Unit.KILOGRAM);
        inventory.receive(bolts, new Quantity(1, Unit.KILOGRAM));
        Quantity onHand = inventory.receive(bolts, new Quantity(2, Unit.KILOGRAM));
        assertEquals(3, onHand.amount());
        assertEquals(2, inventory.movements().size());
    }

    @Test
    void listenersHearEveryMovement() {
        MemoryInventory inventory = new MemoryInventory();
        int[] heard = {0};
        Inventory.Listener listener = (item, delta) -> heard[0]++;
        inventory.listen(listener);
        inventory.receive(new Item("A-1", "Anvil", Unit.EACH), new Quantity(1, Unit.EACH));
        assertEquals(1, heard[0]);
    }
}
