import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription, combineLatest, ObjectUnsubscribedError } from 'rxjs';
// import { compareDisplayOption as equalsDisplayOption, DisplayOption } from './display-option';
import { ResizeEvent } from 'angular-resizable-element';
import { deprecate } from 'util';

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
  private requestRenderFromAPI = new Subject<{ rowColChange: boolean }>();
  private afterViewInitSubject = new Subject<void>();

  private keyInputSubjectSubscription: Subscription;
  private keyEventSubjectSubscription: Subscription;
  private requestRenderSubscription: Subscription;
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  // private displayOption: DisplayOption = {};
  private dataSource: Observable<string>;
  private dataSourceSubscription: Subscription;
  preOuterStyle: Partial<CSSStyleDeclaration> = { 'display': 'block' };
  outerStyle: Partial<CSSStyleDeclaration> = {};

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
  _rows?: number;
  @Input('cols')
  _cols?: number;
  @Input('minWidth')
  _minWidth?: number;
  @Input('minHeight')
  _minHeight?: number;
  @Input('draggable')
  _draggable?: boolean = true;

  setDraggable(draggable: boolean): void {
    this._draggable = draggable;
    this.ref.markForCheck();
  }

  setRows(rows: number): void {
    this._rows = rows;
    this.requestRenderFromAPI.next({ rowColChange: true });
  }

  setCols(cols: number): void {
    this._cols = cols;
    this.requestRenderFromAPI.next({ rowColChange: true });
  }

  @Input('style')
  set _style(opt: any) {
    this.setStyle(opt);
    console.debug("style");
    this.requestRenderFromAPI.next({ rowColChange: false });
  }

  @Output('keyInput')
  keyInputEmitter = new EventEmitter<string>();

  @Output('keyEvent')
  keyEventEmitter = new EventEmitter<{ key: string; domEvent: KeyboardEvent; }>();

  @ViewChild('terminal', { static: true })
  terminalDiv: ElementRef;

  constructor(private renderer: Renderer2, private ref: ChangeDetectorRef) {
    this.requestRenderSubscription = combineLatest(this.requestRenderFromAPI, this.afterViewInitSubject).subscribe(([{ rowColChange }]) => {
      if (rowColChange)
        this.coordinateOuterAndTerminal(true);
      else
        this.coordinateOuterAndTerminal(false);
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
  }

  /**
   * set dimensions
   */
  private setOuterDimensions(left: number, top: number, width: number, height: number) {
    this.preOuterStyle['left'] = left ? `${left}px` : undefined;
    this.preOuterStyle['top'] = top ? `${top}px` : undefined;
    this.preOuterStyle['width'] = width ? `${width}px` : undefined;
    this.preOuterStyle['height'] = height ? `${height}px` : undefined;
    this.requestRenderFromAPI.next({ rowColChange: false });
  }

  /**
   * remove dimensions
   */
  private removeOuterDimensions() {
    this.requestRenderFromAPI.next({ rowColChange: false });
  }

  private getDimensionsAheadOfRendering(): { width: number, height: number } | undefined {
    const proposedDimensions = this.fitAddon.proposeDimensions();
    const core = (this.underlying as any)._core;
    try {
      const actualWidth: number | undefined = core._renderService.dimensions.actualCellWidth as number | undefined;
      const actualHeight: number | undefined = core._renderService.dimensions.actualCellHeight as number | undefined;
      const scrollWidth: number = core.viewport.scrollBarWidth as number;
      if (actualWidth && actualHeight) {
        const width = actualWidth * proposedDimensions.cols + scrollWidth;
        const height = actualHeight * proposedDimensions.rows;
        return { width, height }
      }
    } catch (err) {
      console.debug(err);
    }
    return undefined;
  }

  /**
   * Render is being used for fast rendering without markForCheck().
   */
  private applyOuterStyleToElement() {
    Object.keys(this.outerStyle).map(key => {
      return { key, value: this.outerStyle[key] }
    }).forEach(({ key, value }) => {
      if (value)
        this.renderer.setStyle(this.terminalDiv.nativeElement, key, value);
      else {
        this.renderer.removeStyle(this.terminalDiv.nativeElement, key);
      }
    });
    this.preOuterStyle = this.outerStyle; //invalidate
  }

  setStyle(styleObject: any) {
    if (JSON.stringify(this.preOuterStyle) != JSON.stringify(styleObject)) {
      this.preOuterStyle = { ...this.preOuterStyle, ...styleObject };
      this.requestRenderFromAPI.next({ rowColChange: false });
    }
  }

  ngOnInit() {
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngAfterViewInit() {
    this.fitAddon = new FitAddon();
    this.term = new Terminal();
    this.term.open(this.terminalDiv.nativeElement);
    this.term.loadAddon(this.fitAddon);
    this.observableSetup();
    console.debug('ngAfterViewInit');
    this.afterViewInitSubject.next();
    // this.ngOnChanges();
  }

  ngOnChanges(changes?: SimpleChanges) {
    console.group('ngOnChanges');
    for (const propName in changes) {
      console.debug('prop: ' + propName);
    }
    console.groupEnd();
    if (changes?._rows || changes?._cols)
      this.requestRenderFromAPI.next({ rowColChange: true });
    else if (changes?._draggable && (changes._draggable.previousValue == true) && (changes._draggable.currentValue == false)) {
      this.requestRenderFromAPI.next({ rowColChange: true });
    } else
      this.requestRenderFromAPI.next({ rowColChange: false });
  }
  /**
   * It must be called after having initialized the terminal.
   * @param rowColChange 
   * @returns 
   */
  private coordinateOuterAndTerminal(rowColChange: boolean) {
    if (!rowColChange) {
      this.outerStyle = { ...this.preOuterStyle };
      this.applyOuterStyleToElement();
    }
    // apply border width
    if (this._draggable)
      this.renderer.addClass(this.terminalDiv.nativeElement, 'draggable');
    else
      this.renderer.removeClass(this.terminalDiv.nativeElement, 'draggable');

    if (rowColChange) {
      this.term.resize(this._cols ?? this.term.cols, this._rows ?? this.term.rows); //asynchrous operation
    } else {
      this.fitAddon.fit(); //asynchrous operation
    }
    console.debug('finished fit()');

    setTimeout(() => {
      let dim = this.getDimensionsAheadOfRendering();
      if (dim) {
        this.outerStyle = { ...this.outerStyle, left: undefined, right: undefined, width: `${dim.width}px`, height: `${dim.height}px` };
        let xtermScreen = this.term.element.getElementsByClassName('xterm-screen')[0];
        let xtermViewport = this.term.element.getElementsByClassName('xterm-viewport')[0];
        // let scrollArea = this.term.element.getElementsByClassName('xterm-scroll-area')[0];
        // let terminal = this.term.element;
        const terminalWidth = xtermScreen.clientWidth;
        const terminalHeight = xtermScreen.clientHeight;
        const borderWidth = this.terminalDiv.nativeElement ? parseFloat(getComputedStyle(this.terminalDiv.nativeElement).borderWidth) : 0;
        const core = (this.underlying as any)._core;
        const scrollWidth: number = core.viewport.scrollBarWidth as number;
        // const scrollWidth = terminal.clientWidth - scrollArea.clientWidth;
        // this.setOuterDimensions(undefined, undefined, terminalWidth + scrollWidth, undefined);
        // It fixes that the viewport's width doesn't changes after calling fit()
        this.renderer.setStyle(xtermViewport, 'width', `${terminalWidth + scrollWidth}px`);
        this.outerStyle = {
          ...this.outerStyle, left: undefined, right: undefined, width: `${terminalWidth + scrollWidth + borderWidth * 2}px`
          , height: `${terminalHeight + borderWidth * 2}px`
        };
        this.applyOuterStyleToElement();
      }else{
        console.warn("NgTerminal can't fit to the outer div. Check whether the outer div is accessable.");
      }
    }, 50);
    this.ref.markForCheck();
  }
  /**
   * clean all resources
   */
  ngOnDestroy(): void {
    if (this.keyInputSubjectSubscription)
      this.keyInputSubjectSubscription.unsubscribe();
    if (this.dataSourceSubscription)
      this.dataSourceSubscription.unsubscribe();
    if (this.keyEventSubjectSubscription)
      this.keyEventSubjectSubscription.unsubscribe();
    if (this.requestRenderSubscription)
      this.requestRenderSubscription.unsubscribe();
    if (this.term)
      this.term.dispose();
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
    return this._draggable;
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
      if (this._draggable) {
        let left = re.rectangle.left, top = re.rectangle.top, width = re.rectangle.width, height = re.rectangle.height;
        if ((width < (this._minWidth ?? 100)) || (height < (this._minHeight ?? 50))) {
          return false;
        } else return true;
      }
    }
  }
}
