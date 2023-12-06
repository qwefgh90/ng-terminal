import { ResizeObserver as PollyfillResizeObserver } from '@juggle/resize-observer';

export class ResizeObserverFactory {
  static supportNative(): boolean {
    try {
      const native = new ResizeObserver(() => {});
      return (
        native.observe !== undefined &&
        native.disconnect !== undefined &&
        native.unobserve !== undefined
      );
    } catch (e) {
      return false;
    }
  }
  static create(callback: ResizeObserverCallback): ResizeObserver {
    if (this.supportNative()) {
      return new ResizeObserver(callback);
    } else {
      return new PollyfillResizeObserver(callback);
    }
  }
}