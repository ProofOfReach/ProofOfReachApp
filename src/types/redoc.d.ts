interface Window {
  Redoc: {
    init: (
      spec: Record<string, unknown>,
      options: Record<string, unknown>,
      element: HTMLElement | null,
      callback?: () => void
    ) => void;
  };
  redocSpec?: Record<string, unknown>;
}