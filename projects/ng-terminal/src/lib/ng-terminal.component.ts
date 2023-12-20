import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  Renderer2,
  SimpleChanges,
  isDevMode,
} from '@angular/core';
import { ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription } from 'rxjs';
import { ResizeEvent } from 'angular-resizable-element';
import {
  LinearRenderService,
  PropertyChangeSet,
} from './linear-render.service';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css'],
  providers: [LinearRenderService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgTerminalComponent
  implements OnInit, OnChanges, AfterViewInit, NgTerminal, OnDestroy
{
  private linearRender: LinearRenderService;
  private xterm?: Terminal;
  private fitAddon?: FitAddon;
  private dataSubject: Subject<string> = new Subject<string>();
  private keySubject = new Subject<{ key: string; domEvent: KeyboardEvent }>();

  private keyInputSubjectSubscription?: Subscription = undefined;
  private keyEventSubjectSubscription?: Subscription = undefined;
  private allLogsSubjectSubscription?: Subscription = undefined;
  private dataSourceSubscription?: Subscription = undefined;
  private resizableObservers: ResizeObserver[] = [];
  private dataSource?: Observable<string> = undefined;
  private readonly paddingSize = 5;
  stylesForResizeBox: Partial<CSSStyleDeclaration> = { display: 'block' };

  /**
   * @deprecated use (data)='' instead.
   * An emitter emits printable characters pushed from xterm's onData() when a user typed on the terminal.
   */
  @Output('keyInput')
  keyInputEmitter = new EventEmitter<string>();

  /**
   * @deprecated use (key)='' instead.
   * An emitter emits key and keybaord event pushed from xterm's onKey() when a user typed on the terminal.
   */
  @Output('keyEvent')
  keyEventEmitter = new EventEmitter<{
    key: string;
    domEvent: KeyboardEvent;
  }>();

  /**
   * An emitter emits printable characters pushed from xterm's onData() when a user typed on the terminal.
   */
  @Output('data')
  dataEmitter = this.keyInputEmitter;

  /**
   * An emitter emits key and keybaord event pushed from xterm's onKey() when a user typed on the terminal.
   */
  @Output('key')
  keyEmitter = this.keyEventEmitter;

  /**
   * A datsource is an observable where NgTerminal reads charactors.
   */
  @Input('dataSource')
  set _dataSource(dataSource: Observable<string> | undefined) {
    if (!dataSource) return;
    if (this.dataSourceSubscription != undefined)
      this.dataSourceSubscription.unsubscribe();
    this.dataSource = dataSource;
    this.dataSourceSubscription = this.dataSource.subscribe((data) =>
      this.write(data)
    );
  }

  /**
   * Change the row count of a terminal immediately.
   */
  @Input('rows')
  _rowsInput?: number;

  /**
   * Change the column count of a terminal immediately.
   */
  @Input('cols')
  _colsInput?: number;

  /**
   * Set the minimum width to limit dragging.
   */
  @Input('minWidth')
  _minWidthInput?: number;

  /**
   * Set the minimum height to limit dragging.
   */
  @Input('minHeight')
  _minHeightInput?: number;

  /**
   * Toggle draggable.
   */
  @Input('draggable')
  set draggable(draggable: boolean) {
    this._draggable = draggable;
  }

  /**
   * An wrapper of {@link ITerminalOptions} for Xterm.
   */
  @Input('xtermOptions')
  _xtermOptions: ITerminalOptions & { theme?: { border?: string } } = {};

  @ViewChild('terminal', { static: true })
  terminalOuter!: ElementRef<HTMLDivElement>;

  @ViewChild('resizeBox', { static: true })
  resizeBox!: ElementRef<HTMLDivElement>;

  @ViewChild('detectBox', { static: true })
  detectBox!: ElementRef<HTMLDivElement>;

  get draggable() {
    return this._draggable;
  }

  lastDraggedPosition?: { width: string; height: string } = undefined;

  _draggable: boolean = false;

  _stylesInput: any = {};

  setMinWidth(width: number): void {
    this._minWidthInput = width;
  }

  setMinHeight(height: number): void {
    this._minHeightInput = height;
  }

  setDraggable(draggable: boolean): void {
    this._draggable = draggable;
    this.lastDraggedPosition = undefined; // Reset position values
  }

  setXtermOptions(
    options: ITerminalOptions & { theme?: { border?: string } }
  ): void {
    this._xtermOptions = options;
    this.linearRender.pushAndHandle({ time: new Date(), type: 'none' });
  }

  setRows(rows: number): void {
    if (this._rowsInput != rows) {
      this._rowsInput = rows;
      this.linearRender.pushAndHandle({
        time: new Date(),
        type: 'rowChanged',
      });
    }
  }

  setCols(cols: number): void {
    if (this._colsInput != cols) {
      this._colsInput = cols;
      this.linearRender.pushAndHandle({
        time: new Date(),
        type: 'columnChanged',
      });
    }
  }

  setStyle(styleObject: any): void {
    if (
      JSON.stringify(this._stylesInput ?? {}) !=
      JSON.stringify(styleObject ?? {})
    ) {
      this._stylesInput = styleObject;
      this.linearRender.pushAndHandle({
        time: new Date(),
        type: 'none',
      });
    }
  }

  handleToCheckLazyContainer?: ReturnType<typeof setInterval> = undefined;

  constructor(
    private renderer: Renderer2, //Render is being used for fast rendering without markForCheck().
    private hostRef: ElementRef<HTMLElement>
  ) {
    this.linearRender = new LinearRenderService(hostRef);
  }

  private setup() {
    if (this.xterm) {
      this.xterm.onData((input) => {
        this.dataSubject.next(input);
      });
      this.xterm.onKey((e) => {
        this.keySubject.next(e);
      });
    }
    this.keyInputSubjectSubscription = this.dataSubject.subscribe((data) => {
      this.keyInputEmitter.emit(data);
    });
    this.keyEventSubjectSubscription = this.keySubject.subscribe((e) => {
      this.keyEventEmitter.emit(e);
    });
    this.setupResizeObservers();
    // if (ob3) this.resizableObservers.push(ob3);
    this.allLogsSubjectSubscription =
      this.linearRender.renderObservable.subscribe((change) => {
        if (change) this.coordinateOuterAndTerminal(change);
        else this.coordinateOuterAndTerminal(change);
        this.linearRender.handleNextOne();
      });
    this.linearRender.handleNextOne();
  }

  /**
   * set dimensions
   */
  private setOuterDimensions(
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    this.linearRender.pushAndHandle({
      time: new Date(),
      type: 'dragged',
      dragged: { draggedWidth: `${width}px`, draggedHeight: `${height}px` },
    });
  }

  private applyStylesToResizeBox() {
    Object.keys(this.stylesForResizeBox)
      .map((key) => {
        return { key, value: (this.stylesForResizeBox as StringToString)[key] };
      })
      .forEach(({ key, value }) => {
        if (this.resizeBox) {
          if (value)
            this.renderer.setStyle(this.resizeBox.nativeElement, key, value);
          else {
            this.renderer.removeStyle(this.resizeBox.nativeElement, key);
          }
        }
      });
    this.stylesForResizeBox = this.stylesForResizeBox; //invalidate
  }

  ngOnInit() {}

  /**
   * It creates new terminal in #terminal.
   */
  ngAfterViewInit() {
    this.fitAddon = new FitAddon();
    this.xterm = new Terminal({
      allowProposedApi: true,
    });
    if (!(this.terminalOuter.nativeElement as HTMLElement).isConnected) {
      this.handleToCheckLazyContainer = setInterval(() => {
        if ((this.terminalOuter.nativeElement as HTMLElement).isConnected) {
          try {
            console.debug("The container's been connected.");
            this.xterm!.open(this.terminalOuter.nativeElement);
            this.xterm!.loadAddon(this.fitAddon!!);
            this.setup();
            this.linearRender.pushAndHandle({ time: new Date(), type: 'none' });
          } finally {
            if (this.handleToCheckLazyContainer)
              clearInterval(this.handleToCheckLazyContainer);
          }
        }
      }, 500);
    } else {
      this.xterm.open(this.terminalOuter.nativeElement);
      this.xterm.loadAddon(this.fitAddon);
      this.setup();
      this.linearRender.pushAndHandle({ time: new Date(), type: 'none' });
    }
  }

  ngOnChanges(changes?: SimpleChanges) {
    console.group('onChanges');
    console.debug('prop: ', changes);
    console.groupEnd();
    if (changes?.['_rowsInput']) {
      if (
        changes?.['_rowsInput']?.previousValue !=
        changes?.['_rowsInput']?.currentValue
      ) {
        this.linearRender.pushAndHandle({
          time: new Date(),
          type: 'rowChanged',
        });
      }
    }
    if (changes?.['_colsInput']) {
      if (
        changes?.['_colsInput']?.previousValue !=
        changes?.['_colsInput']?.currentValue
      ) {
        this.linearRender.pushAndHandle({
          time: new Date(),
          type: 'columnChanged',
        });
      }
    }
    if (changes?.['draggable'])
      this.linearRender.pushAndHandle({ time: new Date(), type: 'none' });
  }

  resizeHandleStyleRule?: CSSStyleRule;
  resizeHandleActiveStyleRule?: CSSStyleRule;

  /**
   * It serves a callback function to adjust the dimensions of the xterm-screen, xterm-view, and resize box
   * after making any changes to the outer box, rows, or columns, or when the resize box is being dragged.
   *
   * There several factors that affect dimensions, as I mentioned earlier.
   * Regardless of whether the draggable feature is on, if new row or column value is input, this value will be applied.
   * - Draggable = New specified Row/Column value > Full (Default)
   * @param change This argument represents a single change that occured.
   * @returns
   */
  private coordinateOuterAndTerminal(change: PropertyChangeSet) {
    console.debug(`changeList: ${JSON.stringify(change)}`);
    if (!this.xterm) return;
    const isHostElementVisible =
      this.hostRef.nativeElement?.offsetParent !== null;
    if (!isHostElementVisible) {
      // Do nothing if the host element is invisible.
      console.debug('`display` of host element was set to `none`');
      return;
    }
    this.doUpdateXtermStyles();
    this.doAdjustDimensionOfResizeBox(change);
    this.doAdjustSizeOfXtermScreen(change);
    this.doUpdateViewportAndResizeBoxWithPixcelUnit();
  }

  /**
   * apply options to the xterm terminal
   * @returns
   */
  private doUpdateXtermStyles() {
    if (!this.xterm) return;
    this.xterm.options = { ...this._xtermOptions };
    // apply the theme to the background of the handle
    if (this._xtermOptions.theme?.background) {
      if (!this.resizeHandleStyleRule)
        this.resizeHandleStyleRule = this.findCssStyleRule('.resize-handle[');
      if (this.resizeHandleStyleRule)
        this.resizeHandleStyleRule.style.backgroundColor =
          this._xtermOptions.theme.background;
    }
    if (this._xtermOptions.theme?.border) {
      if (!this.resizeHandleActiveStyleRule)
        this.resizeHandleActiveStyleRule =
          this.findCssStyleRule('.handle-active');
      if (this.resizeHandleActiveStyleRule)
        this.resizeHandleActiveStyleRule.style.backgroundColor =
          this._xtermOptions.theme.border;
    }
  }

  /**
   * If the resize handles are moved, the resize box adjusts to the new dimensions;
   * otherwise, it defaults to a maximized size.
   * @param change
   */
  private doAdjustDimensionOfResizeBox(change: PropertyChangeSet) {
    this.stylesForResizeBox = {
      ...this.stylesForResizeBox,
      ...this._stylesInput,
      width: this.stylesForResizeBox.width,
      height: this.stylesForResizeBox.height,
    };

    // Reset styles of the resize element
    if (change.type === 'dragged') {
      const minWidth = this._minWidthInput ?? 24;
      const minHeight = this._minHeightInput ?? 24;
      const width =
        parseInt(change.dragged.draggedWidth) > minWidth
          ? change.dragged.draggedWidth
          : `${minWidth}px`;
      const height =
        parseInt(change.dragged.draggedHeight) > minHeight
          ? change.dragged.draggedHeight
          : `${minHeight}px`;
      this.stylesForResizeBox.width = width;
      this.stylesForResizeBox.height = height;
      this.lastDraggedPosition = {
        width,
        height,
      };
      this.applyStylesToResizeBox();
    } else if (!(this.draggable && this.lastDraggedPosition)) {
      // When `_colsInput` and `draggable` is not enabled,
      // it fits the size to the host element.
      const currentHostWidth = getComputedStyle(
        this.hostRef.nativeElement
      ).width;
      const detectBoxWidth = getComputedStyle(
        this.detectBox.nativeElement
      ).width;
      let smallParent = false;
      if (parseFloat(detectBoxWidth) < parseFloat(currentHostWidth)) {
        // the width of the parent is smaller than that of resize-box element
        smallParent = true;
      }
      if (smallParent) {
        // It's been written to solve https://github.com/qwefgh90/ng-terminal/issues/79
        // If the width of the flex-box (that is the parent of the host element) is smaller than that of child element, the host element is adjusted to the width of child element
        // host element: 1000px, resize-box(child): 985px -> host element: 985px, resize-box(child): 970px -> ... -> stop

        // This code check if the parent element (that is the parent of `<ng-terminal>), is smaller than `.resize-box`
        // and ensures that the width of the `<ng-terminal>` adjusts to match that of the parent element rather than the child elements, in the subsequent events.
        this.stylesForResizeBox.width = `${parseFloat(detectBoxWidth)}px`;
        this.applyStylesToResizeBox();
      } else {
        // but if the dimension of host element is resized, update width and height
        // If `_rowsInput` is specified, NgTerminal keep the current height; otherwise, the height is set to 100%
        if (!this._rowsInput) this.stylesForResizeBox.height = '100%';
        if (!this._colsInput) this.stylesForResizeBox.width = '100%';
        this.applyStylesToResizeBox();
      }
    }
  }

  /**
   * This function uses fitAddon() to adjust the dimension of xterm-screen to character unit
   * If the draggable value is true or there are no fixed values for the row or column,
   * it fits the xterm terminal boxes into the resize box;
   * otherwise, it resizes the xterm terminal with specified row and column values.
   */
  private doAdjustSizeOfXtermScreen(change: PropertyChangeSet) {
    if (!this.xterm) return;
    if (
      (change.type == 'rowChanged' && this._rowsInput) ||
      (change.type == 'columnChanged' && this._colsInput)
    ) {
      this.xterm.resize(
        this._colsInput ?? this.xterm.cols,
        this._rowsInput ?? this.xterm.rows
      );
    }
    else {
      if (this.xterm.element) {
        // The fitAddon.fit() operation doesn't recognize the padding values of terminalOuter.
        // It seems to be using the padding values of xterm element instead.
        // Therefore, we establish a brief time frame to adjust the padding values before and after executing fitAddon.fit().
        // If this line is removed, when dragging resize-box vertically, the width is decreased.
        this.xterm.element.style.paddingLeft = `${this.paddingSize}px`;
        this.printDimension('Before fitAddon.fit() of Xterm');
        this.fitAddon?.fit();
        this.printDimension('After fitAddon.fit() of Xterm');
        this.xterm.element.style.paddingLeft = `${0}px`;
      }
    }
  }

  /**
   * This functions sets width of the resize box, xterm-viewport and xterm-screen with specific pixel values.
   */
  private doUpdateViewportAndResizeBoxWithPixcelUnit() {
    if (this.xterm?.element) {
      let xtermScreen =
        this.xterm.element.getElementsByClassName('xterm-screen')[0];
      let xtermViewport =
        this.xterm.element.getElementsByClassName('xterm-viewport')[0];
      const screenWidth = xtermScreen.clientWidth;
      const screenHeight = xtermScreen.clientHeight;
      const core = (this.underlying as any)._core;
      const scrollBarWidth: number = core.viewport.scrollBarWidth as number;
      const hostWidth = parseInt(
        getComputedStyle(this.hostRef.nativeElement).width
      );

      // It fixes a bug where the viewport's width isn't updated by fitAddon.fit()
      this.renderer.setStyle(
        xtermViewport,
        'width',
        `${screenWidth + scrollBarWidth}px`
      );

      // It adjusts the dimension of the resize box to the xterm-screen element.
      const calulatedBoxWidth =
        screenWidth + scrollBarWidth + this.paddingSize * 2;
      const componentElement = this.hostRef.nativeElement as HTMLElement;
      const componentWith = parseInt(getComputedStyle(componentElement).width);
      const restrictedWidth =
        calulatedBoxWidth > componentWith ? componentWith : calulatedBoxWidth;

      this.stylesForResizeBox = {
        ...this.stylesForResizeBox,
        width: `${restrictedWidth}px`,
        height: `${screenHeight + this.paddingSize * 2}px`,
      };
      this.applyStylesToResizeBox();
      this.printDimension(
        'After update the dimensions for all boxes with pixel values'
      );
    }
  }

  private printDimension(title: string) {
    if (isDevMode() && this.xterm?.element) {
      let resizeBox = this.resizeBox.nativeElement as HTMLDivElement;
      let xtermScreen =
        this.xterm.element.getElementsByClassName('xterm-screen')[0];
      let xtermViewport =
        this.xterm.element.getElementsByClassName('xterm-viewport')[0];
      const screenWidth = xtermScreen.clientWidth;
      const screenHeight = xtermScreen.clientHeight;

      console.group(`${title}`);
      console.debug(`width(resizeBox): ${getComputedStyle(resizeBox).width},
width(viewport): ${getComputedStyle(xtermViewport).width},
width(screen): ${screenWidth}
scrollBarWidth: ${this.scrollBarWidth}`);
      console.debug(`height(resizeBox): ${getComputedStyle(resizeBox).height},
height(viewport) ${getComputedStyle(xtermViewport).height},
height(screen): ${screenHeight}`);
      console.groupEnd();
    }
  }

  /**
   * If pushAndHandle() were used, there could be an issue
   * because it can adjust the size of elements during a loop of ResizeObserver.
   */
  private setupResizeObservers() {
    this.resizableObservers = [];
    let ob1 = this.observeXtermViewportDimension();
    let ob2 = this.observeHostDimension();
    if (ob1) this.resizableObservers.push(ob1);
    if (ob2) this.resizableObservers.push(ob2);
  }

  private observeXtermViewportDimension() {
    let xtermViewport = this.terminalOuter.nativeElement.querySelector(
      '.xterm-viewport'
    ) as HTMLDivElement | undefined;
    if (xtermViewport) {
      const resizeObserver = new ResizeObserver((entries) => {
        const outerDivWidth = (
          this.terminalOuter.nativeElement as HTMLDivElement | undefined
        )?.clientWidth;
        const outerDivHeight = (
          this.terminalOuter.nativeElement as HTMLDivElement | undefined
        )?.clientHeight;
        for (let entry of entries) {
          if (entry.contentBoxSize.length > 0) {
            let width: number = entry.target.clientWidth;
            let height: number = entry.target.clientHeight;
            if (
              (outerDivWidth && width > outerDivWidth) ||
              (outerDivHeight && height > outerDivHeight)
            ) {
              console.debug(
                'Changes on a xterm viewport element will be handled.'
              );
              this.linearRender.pushAndHandle(
                {
                  time: new Date(),
                  type: 'xtermViewportExceedingOuterDiv',
                  xtermViewportExceedingOuterDiv: {
                    width: `${width}`,
                    height: `${height}`,
                    outerDivWidth: `${outerDivWidth}`,
                    outerDivHeight: `${outerDivHeight}`,
                  },
                },
                true
              );
            }
          }
        }
      });
      resizeObserver.observe(xtermViewport);
      return resizeObserver;
    } else {
      console.error(
        'Invalid state is detected. xterm element should exist below .terminal-outer.'
      );
    }
    return undefined;
  }

  lastDetectedWidth = 0;
  private observeHostDimension() {
    let hostElement = this.hostRef.nativeElement;
    let detectBox = this.detectBox.nativeElement;
    if (hostElement && detectBox) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === hostElement) {
            if (entry.contentBoxSize.length > 0) {
              let width = getComputedStyle(entry.target).width;
              let height = getComputedStyle(entry.target).height;
              if (parseInt(width) >= 0 && parseInt(height) >= 0) {
                console.debug('Changes on a host element will be handled.');
                this.linearRender.pushAndHandle(
                  {
                    time: new Date(),
                    type: 'hostResized',
                    hostResized: { width: `${width}`, height: `${height}` },
                  },
                  true
                );
              }
            }
          }
          if (entry.target === detectBox) {
            if (entry.contentBoxSize.length > 0) {
              let width = getComputedStyle(entry.target).width;
              if (
                parseInt(width) >= 0 &&
                parseInt(width) <= this.lastDetectedWidth
              ) {
                console.debug(
                  'Changes on a detect-box element will be handled.'
                );
                this.linearRender.pushAndHandle(
                  {
                    time: new Date(),
                    type: 'detectBoxResized',
                    detectBoxResized: { width: `${width}` },
                  },
                  true
                );
              }
              this.lastDetectedWidth = parseInt(width);
            }
          }
        }
      });
      resizeObserver.observe(hostElement);
      resizeObserver.observe(detectBox);
      return resizeObserver;
    } else {
      console.error(
        'Invalid state is detected. xterm element should exist below .terminal-outer.'
      );
    }
    return undefined;
  }
  /**
   * clean all resources
   */
  ngOnDestroy(): void {
    this.resizableObservers.forEach((ob) => ob.disconnect());
    if (this.keyInputSubjectSubscription)
      this.keyInputSubjectSubscription.unsubscribe();
    if (this.dataSourceSubscription) this.dataSourceSubscription.unsubscribe();
    if (this.keyEventSubjectSubscription)
      this.keyEventSubjectSubscription.unsubscribe();
    if (this.allLogsSubjectSubscription)
      this.allLogsSubjectSubscription.unsubscribe();
    if (this.handleToCheckLazyContainer)
      clearInterval(this.handleToCheckLazyContainer);
    if (this.xterm) this.xterm.dispose();
    console.debug('All resources has been cleaned up.');
  }

  write(chars: string) {
    this.xterm?.write(chars);
  }

  get keyInput(): Observable<string> {
    return this.dataSubject;
  }

  onData(): Observable<string> {
    return this.dataSubject;
  }

  get keyEventInput(): Observable<{ key: string; domEvent: KeyboardEvent }> {
    return this.keySubject;
  }

  onKey(): Observable<{ key: string; domEvent: KeyboardEvent }> {
    return this.keySubject;
  }

  get underlying(): Terminal | undefined {
    return this.xterm;
  }

  get isDraggableOnEdgeActivated() {
    // return this.displayOption.activateDraggableOnEdge != undefined && this.displayOption.fixedGrid == undefined;
    return this._draggable;
  }

  private get scrollBarWidth() {
    const core = (this.underlying as any)._core;
    return core.viewport.scrollBarWidth as number;
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
      if (this._draggable) {
        return true;
      } else return false;
    };
  }

  private findCssStyleRule(containingSelector: string) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      let sheet = document.styleSheets.item(i);
      if (sheet) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
          let rule = sheet.cssRules.item(i) as CSSStyleRule;
          if ('selectorText' in rule)
            if (rule.selectorText.includes(containingSelector)) return rule;
        }
      }
    }
    return undefined;
  }
}

interface StringToString {
  [index: string]: string;
}
