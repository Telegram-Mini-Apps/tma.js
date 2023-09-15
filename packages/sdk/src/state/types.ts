/**
 * Computes state property changed event.
 */
export type PropChangedEvent<K extends string> = `${K}Changed`;

/**
 * Returns object string keys.
 */
export type StringKeys<T extends object> = Extract<keyof T, string>;

/**
 * Extracts state property type by its computed change event name.
 */
export type PropertyType<State extends object, Event extends string> = {
  [Key in StringKeys<State>]: Event extends PropChangedEvent<Key> ? State[Key] : never;
}[StringKeys<State>];

/**
 * Creates map, where key is event name which is used, when state property was changed.
 * Value is according listener.
 */
export type PropChangedEventsMap<State extends object> = {
  [Event in `${StringKeys<State>}Changed`]: (value: PropertyType<State, Event>) => void;
};

/**
 * Creates map with all events emitted by state.
 */
export type StateEvents<State extends object> = PropChangedEventsMap<State> & {
  /**
   * Being called whenever any property was updated.
   */
  changed: () => void;
};