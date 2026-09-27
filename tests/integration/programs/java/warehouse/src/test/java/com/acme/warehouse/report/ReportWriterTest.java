package com.acme.warehouse.report;

import org.junit.jupiter.api.Test;

import com.acme.warehouse.model.Item;
import com.acme.warehouse.model.Quantity;
import com.acme.warehouse.model.Unit;
import com.acme.warehouse.store.MemoryInventory;

import static org.junit.jupiter.api.Assertions.*;

class ReportWriterTest {

    @Test
    void writesOneLinePerItem() {
        MemoryInventory inventory = new MemoryInventory();
        inventory.receive(new Item("A-1", "Anvil", Unit.EACH), new Quantity(2, Unit.EACH));
        Report report = new ReportWriter().write(inventory);
        assertEquals(1, report.lines().size());
        assertTrue(report.lines().get(0).startsWith("A-1"));
    }

    @Test
    void missingIsNoneInTheItemsUnit() {
        Quantity missing = ReportWriter.missing(new Item("B-2", "Bolts", Unit.KILOGRAM));
        assertEquals(0, missing.amount());
        assertEquals(Unit.KILOGRAM, missing.unit());
    }
}
