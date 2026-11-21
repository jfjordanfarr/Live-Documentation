package org.eclipse.core.runtime;

/**
 * Compile-time stand-in for Eclipse's Platform. Referenced only by
 * DefaultHTTPClientFactory.getProductInformation (the Eclipse plug-in's HTTP
 * user agent), which the .tfignore oracle never runs.
 */
public final class Platform {
    public static IProduct getProduct() {
        throw new UnsupportedOperationException("Eclipse runtime not present");
    }

    public static IBundleGroupProvider[] getBundleGroupProviders() {
        throw new UnsupportedOperationException("Eclipse runtime not present");
    }
}
