package com.acme.warehouse.store;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.acme.warehouse.model.*;

/** An {@link Inventory} kept in memory, with an audit trail of movements. */
@Audited("stock")
public class MemoryInventory implements Inventory {

    /** One change of stock, kept for the audit trail. */
    public static final class Movement {
        public final Item item;
        public final Quantity delta;

        Movement(Item item, Quantity delta) {
            this.item = item;
            this.delta = delta;
        }
    }

    private final Map<Item, Quantity> stock = new LinkedHashMap<>();
    private final List<Movement> movements = new ArrayList<>();
    private final List<Listener> listeners = new ArrayList<>();

    @Override
    public Quantity receive(Item item, Quantity delta) {
        Quantity current = stock.getOrDefault(item, Quantity.none(item.unit()));
        Quantity next = current.plus(delta);
        stock.put(item, next);
        movements.add(new Movement(item, delta));
        for (Listener listener : listeners) {
            listener.moved(item, delta);
        }
        return next;
    }

    @Override
    public Map<Item, Quantity> onHand() {
        return Map.copyOf(stock);
    }

    @Override
    public void listen(Listener listener) {
        listeners.add(listener);
    }

    /** The movements so far, oldest first. */
    public List<Movement> movements() {
        return List.copyOf(movements);
    }
}
