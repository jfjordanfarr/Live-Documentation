package org.eclipse.core.runtime;

/** Compile-time stand-in; see Platform. */
public interface IBundleGroupProvider {
    IBundleGroup[] getBundleGroups();
}
