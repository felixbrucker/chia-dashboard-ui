export enum AutoUpdateMode {
  off = 'off',
  slow = 'slow',
  regular = 'regular',
  fast = 'fast',
}

export function getIntervalInSeconds(autoUpdateMode: AutoUpdateMode): number|undefined {
  switch (autoUpdateMode) {
    case AutoUpdateMode.slow:
      return 90
    case AutoUpdateMode.regular:
      return 60
    case AutoUpdateMode.fast:
      return 30
  }
}
