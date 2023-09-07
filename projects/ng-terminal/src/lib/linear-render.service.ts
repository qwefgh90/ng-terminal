import { Injectable, ElementRef, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 *
 * In the past, indivisual property changes caused very unexpected behavior on NgTerminal.
 * To solve issues related to property changes, Queue is applied.
 */
@Injectable({
  providedIn: 'root',
})
export class LinearRenderService implements OnDestroy {
  constructor(private hostRef: ElementRef) {}

  private handlerToCheckElementConnection?: ReturnType<typeof setInterval> =
    undefined;

  /**
   * This queue has items to have a influence on the view and items are handled in order.
   */
  private propertyChangeQueue: PropertyChangeSet[] = [];
  private itemsToBeHandled = new Subject<PropertyChangeSet>();

  get renderObservable(): Observable<PropertyChangeSet> {
    return this.itemsToBeHandled;
  }

  /**
   * {@link handleNextOne()} calls {@link handleImmediate()} if an element is connected.
   * Otherwise, {@link pollAndHandle()} is called.
   */
  public handleNextOne() {
    if (!this.hostRef.nativeElement.isConnected) {
      this.pollAndHandle();
    } else {
      this.handleImmediate();
    }
  }

  /**
   * This method pushes item into {@link propertyChangeQueue}.
   * @param item
   */
  public pushAndHandle(item: Partial<PropertyChangeSet>) {
    let changeWithDefault = {
      rowChanged: false,
      columnChanged: false,
      ...item,
    };
    this.propertyChangeQueue.push(changeWithDefault);
    this.handleNextOne();
  }

  /**
   * {@link pollAndHandle()} continues checking whether new item is put on a queue to call {@link handleImmediate()}.
   */
  public pollAndHandle() {
    const pollFunction = () => {
      if (this.handlerToCheckElementConnection) return;
      const interval = setInterval(() => {
        if (this.hostRef.nativeElement.isConnected) {
          clearInterval(interval);
          this.handlerToCheckElementConnection = undefined;
          this.handleImmediate();
        }
      }, 500);
      this.handlerToCheckElementConnection = interval;
    };
    // Start polling
    pollFunction();
  }

  /**
   * Handle a next set of changes if it exists.
   */
  private handleImmediate = () => {
    if (!this.handlerToCheckElementConnection) {
      let list = this.propertyChangeQueue.splice(0, 1);
      if (list.length == 1) {
        this.itemsToBeHandled.next(list[0]);
      }
    }
  };

  ngOnDestroy(): void {
    if (this.handlerToCheckElementConnection)
      clearInterval(this.handlerToCheckElementConnection);
  }
}

type PropertyChangeSet = {
  rowChanged: boolean;
  columnChanged: boolean;
  dragged?: { draggedWidth: string; draggedHeight: string };
  hostResized?: { width: string; height: string };
  whenTerminalDimensionIsOverOuterDiv?: { width: string; height: string };
};
