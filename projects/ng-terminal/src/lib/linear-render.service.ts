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
  public handleNextOne(lazy = false) {
    if (!this.hostRef.nativeElement.isConnected || lazy) {
      this.pollAndHandle(
        !this.hostRef.nativeElement.isConnected
          ? 'NOT_CONNECTED_ELEMENT'
          : 'LAZY'
      );
    } else {
      this.handleImmediate();
    }
  }

  /**
   * This method pushes item into {@link propertyChangeQueue}.
   * @param item
   */
  public pushAndHandle(item: PropertyChangeSet, lazy = false) {
    let changeWithDefault = {
      ...item,
    };
    this.propertyChangeQueue.push(changeWithDefault);
    this.handleNextOne(lazy);
  }

  /**
   * {@link pollAndHandle()} continues checking whether new item is put on a queue to call {@link handleImmediate()}.
   */
  private pollAndHandle(mode: 'NOT_CONNECTED_ELEMENT' | 'LAZY') {
    const pollFunction = () => {
      if (this.handlerToCheckElementConnection) return;
      const interval = setInterval(
        () => {
          if (this.hostRef.nativeElement.isConnected) {
            clearInterval(interval);
            this.handlerToCheckElementConnection = undefined;
            this.handleImmediate();
          }
        },
        mode === 'NOT_CONNECTED_ELEMENT' ? 500 : 30
      );
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

export type PropertyChangeSet =
  | { type: 'rowChanged'}
  | { type: 'columnChanged'}
  | {
      type: 'dragged';
      dragged: { draggedWidth: string; draggedHeight: string };
    }
  | { type: 'hostResized'; hostResized: { width: string; height: string } }
  | {
      type: 'xtermViewportExceedingOuterDiv';
      xtermViewportExceedingOuterDiv: {
        width: string;
        height: string;
        outerDivWidth: string;
        outerDivHeight: string;
      };
    }
  | { type: 'none' };
