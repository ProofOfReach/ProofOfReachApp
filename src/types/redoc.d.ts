interface Window {
  Redoc: {
    init: (
      spec: any,
      options: any,
      element: HTMLElement | null,
      callback?: () => void
    ) => void;
  };
  redocSpec?: any;
}