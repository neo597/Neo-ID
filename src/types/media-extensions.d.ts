// Type extensions for camera torch functionality
// The torch property is supported by some browsers but not in the standard TypeScript definitions

declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }

  interface MediaTrackConstraintSet {
    torch?: boolean;
  }

  interface MediaTrackSettings {
    torch?: boolean;
  }
}

export {};