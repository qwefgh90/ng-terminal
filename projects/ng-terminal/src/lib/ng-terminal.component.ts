import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription, combineLatest, ObjectUnsubscribedError, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResizeEvent } from 'angular-resizable-element';
import { ResizeObserver } from '@juggle/resize-observer';


@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgTerminalComponent implements OnInit, OnChanges, AfterViewInit, NgTerminal, OnDestroy {
  private term: Terminal;
  private fitAddon: FitAddon;
  private keyInputSubject: Subject<string> = new Subject<string>();
  private keyEventSubject = new Subject<{ key: string; domEvent: KeyboardEvent; }>();
  private requestRenderFromAPI = new Subject<{
    rowChanged?: boolean, columnChanged?: boolean
    , dragged?: { draggedWidth: string, draggedHeight: string }
    , hostResized?: { width: string, height: string }
    , whenTerminalDimensionIsOverOuterDiv?: { width: string, height: string }
  }>();
  private allLogsSubject = new Subject<{
    rowChanged: boolean
    , columnChanged: boolean
    , dragged?: { draggedWidth: string, draggedHeight: string }
    , hostResized?: { width: string, height: string }
    , whenTerminalDimensionIsOverOuterDiv?: { width: string, height: string }
  }>();
  // private afterViewInitSubject = new Subject<void>();

  private keyInputSubjectSubscription: Subscription;
  private keyEventSubjectSubscription: Subscription;
  private allLogsSubjectSubscription: Subscription;
  private requestRenderSubscription: Subscription;
  private resizableObservers: ResizeObserver[] = [];
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  // private displayOption: DisplayOption = {};
  private dataSource: Observable<string>;
  private dataSourceSubscription: Subscription;
  stylesForDiv: Partial<CSSStyleDeclaration> = { 'display': 'block' };

  @Input('dataSource')
  set _dataSource(ds) {
    if (this.dataSourceSubscription != null) {
      this.dataSourceSubscription.unsubscribe();
    }
    this.dataSource = ds;
    this.dataSourceSubscription = this.dataSource.subscribe((data) => {
      this.write(data);
    })
  }
  get _dataSource() {
    return this.dataSource;
  }

  @Input('rows')
  _rowsInput?: number;
  @Input('cols')
  _colsInput?: number;
  @Input('minWidth')
  _minWidthInput?: number;
  @Input('minHeight')
  _minHeightInput?: number;
  @Input('draggable')
  set draggable(draggable: boolean) {
    this._draggableInput = draggable;
    this.applyStyleToDraggable();
  }
  get draggable(){
    return this._draggableInput;
  }
  lastDraggedPosition:{width: string, height: string};

  _draggableInput?: boolean = false;

  _stylesInput: any = {};

  setMinWidth(width: number): void {
    this._minWidthInput = width;
  }
  setMinHeight(height: number): void {
    this._minHeightInput = height;
  }

  setDraggable(draggable: boolean): void {
    this._draggableInput = draggable;
    this.lastDraggedPosition = undefined;
    this.applyStyleToDraggable();
  }

  setRows(rows: number): void {
    if (this._rowsInput != rows){
      this._rowsInput = rows;
      this.requestRenderFromAPI.next({ rowChanged: true });
    }
  }

  setCols(cols: number): void {
    if (this._colsInput != cols){
      this._colsInput = cols;
      this.requestRenderFromAPI.next({ columnChanged: true });
    }
  }

  setStyle(styleObject: any): void {
    if (JSON.stringify(this._stylesInput ?? {}) != JSON.stringify(styleObject ?? {})){
      this._stylesInput = styleObject;
      this.requestRenderFromAPI.next({});
    }
    
  }

  @Output('keyInput')
  keyInputEmitter = new EventEmitter<string>();

  @Output('keyEvent')
  keyEventEmitter = new EventEmitter<{ key: string; domEvent: KeyboardEvent; }>();

  @ViewChild('terminal', { static: true })
  div: ElementRef;

  private getNextOrWait() {
    if (!this.hostRef.nativeElement.isConnected) {
      this.stopAndPolling();
    } else {
      this.releaseNextOne();
    }
  }
  private pushToWaitingQueue(item: {
    rowChanged: boolean
    , columnChanged: boolean
    , dragged?: { draggedWidth: string, draggedHeight: string }
    , hostResized?: { width: string, height: string }
    , whenTerminalDimensionIsOverOuterDiv?: { width: string, height: string }
  }) {
    this.waitingQueue.push(item);
    this.releaseNextOne();
  }

  /**
   * @internal
   */
  private stopAndPolling() {
    const pollFunction = () => {
      if (this.interval)
        return;
      const interval = setInterval(() => {
        if (this.hostRef.nativeElement.isConnected) {
          clearInterval(interval);
          this.interval = undefined;
          this.releaseNextOne();
        }
      }, 500);
      this.interval = interval;
    }
    pollFunction();
  }

  /**
   * @internal don't make a direct call
   */
  interval: ReturnType<typeof setInterval>;

  /**
   * @internal don't make a direct call
   */
  private releaseNextOne = () => {
    if (!this.interval) {
      let list = this.waitingQueue.splice(0, 1);
      if (list.length == 1) {
        this.allLogsSubject.next(list[0]);
      }
    }
  }

  /**
   * @internal don't make a direct call
   */
  private waitingQueue: {
    rowChanged: boolean
    , columnChanged: boolean
    , dragged?: { draggedWidth: string, draggedHeight: string }
    , hostResized?: { width: string, height: string }
    , whenTerminalDimensionIsOverOuterDiv?: { width: string, height: string }
  }[] = [];

  constructor(private renderer: Renderer2, private ref: ChangeDetectorRef, private hostRef: ElementRef) {
    this.requestRenderSubscription = this.requestRenderFromAPI.subscribe(change => {
      let changeWithDefault = {
        rowChanged: false, columnChanged: false, ...change
      };
      this.pushToWaitingQueue(changeWithDefault);
      this.getNextOrWait();
    });
  }
  private observableSetup() {
    this.term.onData((input) => {
      this.keyInputSubject.next(input);
    });
    this.term.onKey(e => {
      this.keyEventSubject.next(e);
    })
    this.keyInputSubjectSubscription = this.keyInputSubject.subscribe((data) => {
      this.keyInputEmitter.emit(data);
    })
    this.keyEventSubjectSubscription = this.keyEventSubject.subscribe((e) => {
      this.keyEventEmitter.emit(e);
    });

    this.resizableObservers = [this.observeTerminalDimension(), this.observeHostDimension()];
    this.allLogsSubjectSubscription = this.allLogsSubject.subscribe((change) => {
      if (change)
        this.coordinateOuterAndTerminal(change);
      else
        this.coordinateOuterAndTerminal(change);
      this.getNextOrWait();
    });
    this.getNextOrWait();
  }
  /**
   * set dimensions
   */
  private setOuterDimensions(left: number, top: number, width: number, height: number) {
    this.requestRenderFromAPI.next({
      rowChanged: false, columnChanged: false
      , dragged: { draggedWidth: `${width}px`, draggedHeight: `${height}px` }
    });
  }

  /**
   * Render is being used for fast rendering without markForCheck().
   */
  private applyStyleToDiv() {
    Object.keys(this.stylesForDiv).map(key => {
      return { key, value: this.stylesForDiv[key] }
    }).forEach(({ key, value }) => {
      if (value)
        this.renderer.setStyle(this.div.nativeElement, key, value);
      else {
        this.renderer.removeStyle(this.div.nativeElement, key);
      }
    });
    this.stylesForDiv = this.stylesForDiv; //invalidate
  }

  /**
   * When draggable is true, add border styles 
   * Render is being used for fast rendering without markForCheck().
   */
  private applyStyleToDraggable() {
    if (this._draggableInput)
      this.renderer.addClass(this.div.nativeElement, 'draggable');
    else
      this.renderer.removeClass(this.div.nativeElement, 'draggable');
  }

  ngOnInit() {
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngAfterViewInit() {
    console.debug("ngAfterViewInit");
    this.fitAddon = new FitAddon();
    this.term = new Terminal();
    this.term.open(this.div.nativeElement);
    this.term.loadAddon(this.fitAddon);
    this.observableSetup();
    this.requestRenderFromAPI.next({});
  }

  ngOnChanges(changes?: SimpleChanges) {
    console.group("onChanges");
    console.debug('prop: ', changes);
    console.groupEnd();
    if (changes?._rowsInput) {
      if (changes?._rowsInput?.previousValue != changes?._rowsInput?.currentValue) {
        this.requestRenderFromAPI.next({ rowChanged: true });
      }
    }
    if (changes?._colsInput) {
      if (changes?._colsInput?.previousValue != changes?._colsInput?.currentValue) {
        this.requestRenderFromAPI.next({ columnChanged: true });
      }
    }
    // this.requestRenderFromAPI.next({});
  }
  /**
   * It must be called after having initialized the terminal.
   * xterm fit
   * @param rowColChange 
   * @returns 
   */
  private coordinateOuterAndTerminal(changeList: {
    rowChanged: boolean
    , columnChanged: boolean
    , dragged?: { draggedWidth: string, draggedHeight: string }
    , hostResized?: { width: string, height: string }
    , whenTerminalDimensionIsOverOuterDiv?: { width: string, height: string }
  }) {
    console.debug(`changeList: ${JSON.stringify(changeList)}`);
    // apply a style input while keeping width and height default
    this.stylesForDiv = {
      ...this.stylesForDiv
      , ...this._stylesInput
      , width: this.stylesForDiv.width
      , height: this.stylesForDiv.height
    };
    // but if the div is dragged, update width, height
    if (changeList.dragged) {
      this.stylesForDiv.width = changeList.dragged.draggedWidth;
      this.stylesForDiv.height = changeList.dragged.draggedHeight;
      this.lastDraggedPosition = {width: changeList.dragged.draggedWidth, height: changeList.dragged.draggedHeight};
    } else if (!this._rowsInput && !this._colsInput && !(this.draggable && this.lastDraggedPosition)) {
      // but if the dimension of host element is resized, update width and height
      this.stylesForDiv.width = '100%';
      this.stylesForDiv.height = '100%';
    }
    this.applyStyleToDiv();

    // resize with new cols and rows if they changed.
    if (changeList.rowChanged || changeList.columnChanged) {
      this.term.resize(this._colsInput ?? this.term.cols, this._rowsInput ?? this.term.rows);
      console.debug('finished resize()');
    } else { // fit with div
      this.fitAddon.fit();
      console.debug('finished fit()');
    }

    // coordinate difference between terminal and outer

    // setTimeout(() => {

    // let dim = this.getDimensionsAheadOfRendering();
    // if (dim) {
    // this.outerStyle = { ...this.outerStyle, width: `${dim.width}px`, height: `${dim.height}px` };
    let xtermScreen = this.term.element.getElementsByClassName('xterm-screen')[0];
    let xtermViewport = this.term.element.getElementsByClassName('xterm-viewport')[0];
    // let scrollArea = this.term.element.getElementsByClassName('xterm-scroll-area')[0];
    // let terminal = this.term.element;
    const terminalWidth = xtermScreen.clientWidth;
    const terminalHeight = xtermScreen.clientHeight;
    const borderWidth = this.div.nativeElement ? parseFloat(getComputedStyle(this.div.nativeElement).borderWidth) : 0;
    const core = (this.underlying as any)._core;
    const scrollWidth: number = core.viewport.scrollBarWidth as number;
    
    // It fixes that the viewport's width doesn't changes after calling fit()
    this.renderer.setStyle(xtermViewport, 'width', `${terminalWidth + scrollWidth}px`);
    console.debug(terminalWidth, scrollWidth + borderWidth * 2);
    console.debug(terminalHeight,  borderWidth * 2);
    this.stylesForDiv = {
      ...this.stylesForDiv, width: `${terminalWidth + scrollWidth + borderWidth * 2 + 10}px`
      , height: `${terminalHeight + borderWidth * 2 + 10}px`
    };
    this.applyStyleToDiv();
    this.ref.markForCheck();
    // } 
    // else {
    // console.warn("NgTerminal can't fit to the outer div. Check whether the outer div is accessable.");
    // }
    // }, 50);
  }

  observeTerminalDimension() {
    let viewport: HTMLDivElement | undefined = this.div.nativeElement.querySelector('.xterm-viewport');
    if (viewport) {
      const resizeObserver = new ResizeObserver(entries => {
        const divWidth = parseFloat(getComputedStyle(this.div.nativeElement).width);
        const divHeight = parseFloat(getComputedStyle(this.div.nativeElement).height);
        let width: number = undefined;
        let height: number = undefined;
        for (let entry of entries) {
          if (entry.contentBoxSize) {
            if (entry.target instanceof HTMLElement) {
              width = parseFloat(getComputedStyle(entry.target).width);
              height = parseFloat(getComputedStyle(entry.target).height);
            }
          } else {
            width = parseFloat(getComputedStyle(entry.target).width);
            height = parseFloat(getComputedStyle(entry.target).height);
          }
        }
        if (width > divWidth || height > divHeight) {
          this.requestRenderFromAPI.next({ whenTerminalDimensionIsOverOuterDiv: { width: `${width}px`, height: `${height}px` } });
        }
      });
      resizeObserver.observe(viewport);
      return resizeObserver;
    } else {
      console.error("Invalid state is detected. xterm element should exist below .terminal-outer.")
    }
  }

  observeHostDimension() {
    let hostElement: HTMLDivElement | undefined = this.hostRef.nativeElement;
    if (hostElement) {
      const resizeObserver = new ResizeObserver(entries => {
        let width: number = undefined;
        let height: number = undefined;
        for (let entry of entries) {
          if (entry.contentBoxSize) {
            if (entry.target instanceof HTMLElement) {
              width = parseFloat(getComputedStyle(entry.target).width);
              height = parseFloat(getComputedStyle(entry.target).height);
            }
          } else {
            width = parseFloat(getComputedStyle(entry.target).width);
            height = parseFloat(getComputedStyle(entry.target).height);
          }
        }
        this.requestRenderFromAPI.next({ hostResized: { width: `${width}px`, height: `${height}px` } });
      });
      resizeObserver.observe(hostElement);
      return resizeObserver;
    } else {
      console.error("Invalid state is detected. xterm element should exist below .terminal-outer.")
    }
  }
  /**
   * clean all resources
   */
  ngOnDestroy(): void {
    console.debug("ngOnDestroy");
    if (this.keyInputSubjectSubscription)
      this.keyInputSubjectSubscription.unsubscribe();
    if (this.dataSourceSubscription)
      this.dataSourceSubscription.unsubscribe();
    if (this.keyEventSubjectSubscription)
      this.keyEventSubjectSubscription.unsubscribe();
    if (this.requestRenderSubscription)
      this.requestRenderSubscription.unsubscribe();
    if (this.allLogsSubjectSubscription)
      this.allLogsSubjectSubscription.unsubscribe();
    if (this.interval)
      clearInterval(this.interval);
    if (this.term)
      this.term.dispose();
    this.resizableObservers.forEach(ob => ob.disconnect());
  }

  write(chars: string) {
    this.term.write(chars);
  }

  get keyInput(): Observable<string> {
    return this.keyInputSubject;
  }

  get keyEventInput(): Observable<{ key: string; domEvent: KeyboardEvent; }> {
    return this.keyEventSubject;
  }

  get underlying(): Terminal {
    return this.term;
  }

  get isDraggableOnEdgeActivated() {
    // return this.displayOption.activateDraggableOnEdge != undefined && this.displayOption.fixedGrid == undefined;
    return this._draggableInput;
  }

  /**
   * After user coordinate dimensions of terminal, it's called.
   * @param left 
   * @param top 
   * @param width 
   * @param height 
   */
  onResizeEnd(left: number, top: number, width: number, height: number): void {
    this.setOuterDimensions(left, top, width, height);
  }

  /**
   * Before onResizeEnd is called, it valiates dimensions to change.
   * @param re dimension to be submitted from resizable stuff
   */
  validatorFactory(): (re: ResizeEvent) => boolean {
    const comp = this;
    return (re: ResizeEvent) => {
      // const displayOption = comp.displayOption;
      if (this._draggableInput) {
        let left = re.rectangle.left, top = re.rectangle.top, width = re.rectangle.width, height = re.rectangle.height;
        if ((width < (this._minWidthInput ?? 100)) || (height < (this._minHeightInput ?? 50))) {
          return false;
        } else return true;
      } else
        return false;
    }
  }

}
