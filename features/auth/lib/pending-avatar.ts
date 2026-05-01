let pendingAvatar: string | null = null;

export const PendingAvatar = {
  set(dataUrl: string | null) {
    pendingAvatar = dataUrl;
  },
  consume(): string | null {
    const value = pendingAvatar;
    pendingAvatar = null;
    return value;
  },
  has(): boolean {
    return pendingAvatar !== null;
  },
};
