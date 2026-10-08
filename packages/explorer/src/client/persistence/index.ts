/**
 * Persistence Module Index
 *
 * Re-exports the URL state and localStorage persistence functions that the
 * client imports through here; the keys, versions and record types are
 * imported from their modules.
 */

export {
  parseInitialState,
  updateUrlState
} from "./url-state";

export {
  getDefaultFilters,
  getDefaultTuning,
  readPersistedUi,
  applyPersistedUi,
  createPersistUiScheduler,
  readPersistedNav,
  createPersistNavScheduler
} from "./local-storage";
