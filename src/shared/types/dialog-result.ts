export type DialogResult<T> =
  | { status: 'confirmed'; value: T; }
  | { status: 'dismissed'; };
