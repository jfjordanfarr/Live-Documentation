package com.acme.tally.app;

import com.acme.tally.core.Ledger;

/** Prints the sum of the counts given on the command line. */
public final class Main {
    public static void main(String[] args) {
        Ledger ledger = new Ledger();
        for (String arg : args) {
            ledger.add(Integer.parseInt(arg));
        }
        System.out.println(ledger.total());
    }
}
