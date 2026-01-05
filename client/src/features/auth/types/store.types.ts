import store from '../../../store';

/**
 * Root state type inferred from Redux store
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type inferred from Redux store
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Typed selector hook for accessing auth state
 */
export type AuthSelector<T> = (state: RootState) => T;
