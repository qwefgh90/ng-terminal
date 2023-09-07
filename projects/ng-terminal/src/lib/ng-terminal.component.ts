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
} from '@angular/core';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription } from 'rxjs';
import { ResizeEvent } from 'angular-resizable-element';
import { ResizeObserver } from '@juggle/resize-observer';
import { LinearRenderService } from './linear-render.service';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgTerminalComponent
  implements OnInit, OnChanges, AfterViewInit, NgTerminal, OnDestroy
{
  private linearRender: LinearRenderService;
  private term?: Terminal;
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
  stylesForDiv: Partial<CSSStyleDeclaration> = { display: 'block' };

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
      this.write(data),
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
    this._draggableInput = draggable;
  }

  /**
   * An wrapper of {@link ITerminalOptions} for Xterm.
   */
  @Input('xtermOptions')
  _xtermOptions: ITerminalOptions & { theme?: { border?: string } } = {};

  @ViewChild('terminal', { static: true })
  terminalOuter!: ElementRef;

  @ViewChild('resizeBox', { static: true })
  resizeBox!: ElementRef;

  get draggable() {
    return this._draggableInput;
  }

  lastDraggedPosition?: { width: string; height: string } = undefined;

  _draggableInput: boolean = false;

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
    this.ref.markForCheck();
  }

  setXtermOptions(
    options: ITerminalOptions & { theme?: { border?: string } },
  ): void {
    this._xtermOptions = options;
    this.linearRender.pushAndHandle({});
  }

  setRows(rows: number): void {
    if (this._rowsInput != rows) {
      this._rowsInput = rows;
      this.linearRender.pushAndHandle({ rowChanged: true });
    }
  }

  setCols(cols: number): void {
    if (this._colsInput != cols) {
      this._colsInput = cols;
      this.linearRender.pushAndHandle({ columnChanged: true });
    }
  }

  setStyle(styleObject: any): void {
    if (
      JSON.stringify(this._stylesInput ?? {}) !=
      JSON.stringify(styleObject ?? {})
    ) {
      this._stylesInput = styleObject;
      this.linearRender.pushAndHandle({});
    }
  }

  handleToCheckLazyContainer?: ReturnType<typeof setInterval> = undefined;

  constructor(
    private renderer: Renderer2,
    private ref: ChangeDetectorRef,
    private hostRef: ElementRef,
  ) {
    this.linearRender = new LinearRenderService(hostRef);
  }

  private observableSetup() {
    if (this.term) {
      this.term.onData((input) => {
        this.dataSubject.next(input);
      });
      this.term.onKey((e) => {
        this.keySubject.next(e);
      });
    }
    this.keyInputSubjectSubscription = this.dataSubject.subscribe((data) => {
      this.keyInputEmitter.emit(data);
    });
    this.keyEventSubjectSubscription = this.keySubject.subscribe((e) => {
      this.keyEventEmitter.emit(e);
    });
    this.resizableObservers = [];
    let ob1 = this.observeTerminalDimension();
    let ob2 = this.observeHostDimension();
    if (ob1) this.resizableObservers.push(ob1);
    if (ob2) this.resizableObservers.push(ob2);
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
    height: number,
  ) {
    this.linearRender.pushAndHandle({
      rowChanged: false,
      columnChanged: false,
      dragged: { draggedWidth: `${width}px`, draggedHeight: `${height}px` },
    });
  }

  /**
   * Render is being used for fast rendering without markForCheck().
   */
  private applyStyleToDiv() {
    Object.keys(this.stylesForDiv)
      .map((key) => {
        return { key, value: (this.stylesForDiv as StringToString)[key] };
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
    this.stylesForDiv = this.stylesForDiv; //invalidate
  }

  ngOnInit() {}

  /**
   * It creates new terminal in #terminal.
   */
  ngAfterViewInit() {
    this.fitAddon = new FitAddon();
    this.term = new Terminal({
      allowProposedApi: true,
    });
    if (!(this.terminalOuter.nativeElement as HTMLElement).isConnected) {
      this.handleToCheckLazyContainer = setInterval(() => {
        if ((this.terminalOuter.nativeElement as HTMLElement).isConnected) {
          try {
            console.debug("The container's been connected.");
            this.term!.open(this.terminalOuter.nativeElement);
            this.term!.loadAddon(this.fitAddon!!);
            this.observableSetup();
            this.linearRender.pushAndHandle({});
          } finally {
            if (this.handleToCheckLazyContainer)
              clearInterval(this.handleToCheckLazyContainer);
          }
        }
      }, 500);
    } else {
      this.term.open(this.terminalOuter.nativeElement);
      this.term.loadAddon(this.fitAddon);
      this.observableSetup();
      this.linearRender.pushAndHandle({});
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
        this.linearRender.pushAndHandle({ rowChanged: true });
      }
    }
    if (changes?.['_colsInput']) {
      if (
        changes?.['_colsInput']?.previousValue !=
        changes?.['_colsInput']?.currentValue
      ) {
        this.linearRender.pushAndHandle({ columnChanged: true });
      }
    }
    // this.requestRenderFromAPI.next({});
  }

  resizeHandleStyleRule?: CSSStyleRule;
  resizeHandleActiveStyleRule?: CSSStyleRule;

  /**
   * It must be called after having initialized the terminal.
   * xterm fit
   * @param rowColChange
   * @returns
   */
  private coordinateOuterAndTerminal(changeList: {
    rowChanged: boolean;
    columnChanged: boolean;
    dragged?: { draggedWidth: string; draggedHeight: string };
    hostResized?: { width: string; height: string };
    whenTerminalDimensionIsOverOuterDiv?: { width: string; height: string };
  }) {
    console.debug(`changeList: ${JSON.stringify(changeList)}`);
    if (!this.term) return;
    // apply options to the xterm terminal
    this.term.options = { ...this._xtermOptions };
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

    // apply a style input while keeping width and height default
    this.stylesForDiv = {
      ...this.stylesForDiv,
      ...this._stylesInput,
      width: this.stylesForDiv.width,
      height: this.stylesForDiv.height,
    };
    // but if the div is dragged, update width, height
    if (changeList.dragged) {
      this.stylesForDiv.width = changeList.dragged.draggedWidth;
      this.stylesForDiv.height = changeList.dragged.draggedHeight;
      this.lastDraggedPosition = {
        width: changeList.dragged.draggedWidth,
        height: changeList.dragged.draggedHeight,
      };
    } else if (
      !this._rowsInput &&
      !this._colsInput &&
      !(this.draggable && this.lastDraggedPosition)
    ) {
      // but if the dimension of host element is resized, update width and height
      this.stylesForDiv.width = '100%';
      this.stylesForDiv.height = '100%';
    }
    this.applyStyleToDiv();

    // resize with new cols and rows if they changed.
    if (changeList.rowChanged || changeList.columnChanged) {
      this.term.resize(
        this._colsInput ?? this.term.cols,
        this._rowsInput ?? this.term.rows,
      );
    } else {
      // fit() operation doesn't see padding values of terminalOuter.
      // But it uses padding values of terminal element.
      // So we force to set padding values when calling fit() operation for a while.
      if (this.term.element) {
        this.term.element.style.paddingLeft = `${this.paddingSize}px`;
        this.term.element.style.paddingRight = `${this.paddingSize}px`;
        this.fitAddon?.fit();
        this.term.element.style.padding = '0px';
      }
    }

    // coordinate difference between terminal and outer
    if (this.term.element) {
      let xtermScreen =
        this.term.element.getElementsByClassName('xterm-screen')[0];
      let xtermViewport =
        this.term.element.getElementsByClassName('xterm-viewport')[0];
      const terminalWidth = xtermScreen.clientWidth;
      const terminalHeight = xtermScreen.clientHeight;
      const core = (this.underlying as any)._core;
      const scrollWidth: number = core.viewport.scrollBarWidth as number;

      // It fixes that the viewport's width doesn't changes after calling fit()
      this.renderer.setStyle(
        xtermViewport,
        'width',
        `${terminalWidth + scrollWidth}px`,
      );
      console.debug(
        terminalWidth + scrollWidth + this.paddingSize * 2,
        terminalWidth,
        scrollWidth,
        this.paddingSize * 2,
      ); // + borderWidth * 2
      console.debug(terminalHeight + this.paddingSize * 2, terminalHeight);
      this.stylesForDiv = {
        ...this.stylesForDiv,
        width: `${terminalWidth + scrollWidth + this.paddingSize * 2}px`,
        height: `${terminalHeight + this.paddingSize * 2}px`,
      };
      this.applyStyleToDiv();
      this.ref.markForCheck();
    }
  }

  observeTerminalDimension() {
    let viewport: HTMLDivElement | undefined =
      this.terminalOuter.nativeElement.querySelector('.xterm-viewport');
    if (viewport) {
      const resizeObserver = new ResizeObserver((entries) => {
        const divWidth = parseFloat(
          getComputedStyle(this.terminalOuter.nativeElement).width,
        );
        const divHeight = parseFloat(
          getComputedStyle(this.terminalOuter.nativeElement).height,
        );
        let width: number = 0;
        let height: number = 0;
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
          this.linearRender.pushAndHandle({
            whenTerminalDimensionIsOverOuterDiv: {
              width: `${width}px`,
              height: `${height}px`,
            },
          });
        }
      });
      resizeObserver.observe(viewport);
      return resizeObserver;
    } else {
      console.error(
        'Invalid state is detected. xterm element should exist below .terminal-outer.',
      );
    }
    return undefined;
  }

  observeHostDimension() {
    let hostElement: HTMLDivElement | undefined = this.hostRef.nativeElement;
    if (hostElement) {
      const resizeObserver = new ResizeObserver((entries) => {
        let width: number = 0;
        let height: number = 0;
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
        this.linearRender.pushAndHandle({
          hostResized: { width: `${width}px`, height: `${height}px` },
        });
      });
      resizeObserver.observe(hostElement);
      return resizeObserver;
    } else {
      console.error(
        'Invalid state is detected. xterm element should exist below .terminal-outer.',
      );
    }
    return undefined;
  }
  /**
   * clean all resources
   */
  ngOnDestroy(): void {
    if (this.keyInputSubjectSubscription)
      this.keyInputSubjectSubscription.unsubscribe();
    if (this.dataSourceSubscription) this.dataSourceSubscription.unsubscribe();
    if (this.keyEventSubjectSubscription)
      this.keyEventSubjectSubscription.unsubscribe();
    if (this.allLogsSubjectSubscription)
      this.allLogsSubjectSubscription.unsubscribe();
    if (this.handleToCheckLazyContainer)
      clearInterval(this.handleToCheckLazyContainer);
    if (this.term) this.term.dispose();
    this.resizableObservers.forEach((ob) => ob.disconnect());
  }

  write(chars: string) {
    this.term?.write(chars);
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
      if (this._draggableInput) {
        let left = re.rectangle.left,
          top = re.rectangle.top,
          width = re.rectangle.width,
          height = re.rectangle.height;
        if (
          width &&
          height &&
          (width < (this._minWidthInput ?? 100) ||
            height < (this._minHeightInput ?? 50))
        ) {
          return false;
        } else return true;
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
