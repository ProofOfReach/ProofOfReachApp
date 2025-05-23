interface Window {
  Redoc: {
    init: (
      spec: Record<UserRole, unknown>,
      options: Record<UserRole, unknown>,
      element: HTMLElement | null,
      callback?: () => void
    ) => void;
  };
  redocSpec?: Record<UserRole, unknown>;
}