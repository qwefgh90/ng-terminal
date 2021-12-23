import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription, combineLatest, ObjectUnsubscribedError } from 'rxjs';
import { compareDisplayOption as equalsDisplayOption, DisplayOption } from './display-option';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgTerminalComponent implements OnInit, AfterViewInit, AfterViewChecked, NgTerminal, OnDestroy {
  private term: Terminal;
  private fitAddon: FitAddon;
  private keyInputSubject: Subject<string> = new Subject<string>();
  private keyEventSubject = new Subject<{key: string; domEvent: KeyboardEvent;}>();
  // private termSnippetSubject = new Subject<()=>void>();
  // private afterViewInitSubject = new Subject<void>();
  
  private keyInputSubjectSubscription: Subscription;
  private keyEventSubjectSubscription: Subscription;
  private termSnippetSubscription: Subscription;
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  private displayOption: DisplayOption = {};
  private dataSource: Observable<string>;
  private dataSourceSubscription: Subscription;
  outerStyle: object = {};

  @Input('dataSource')
  set _dataSource(ds) {
    if(this.dataSourceSubscription != null){
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

  @Input('displayOption')
  set _displayOption(opt: DisplayOption){
    this.setDisplayOption(opt);
  }

  @Input('style')
  set _style(opt: any){
    this.setStyle(opt);
  }

  @Output('keyInput')
  keyInputEmitter  = new EventEmitter<string>();

  @Output('keyEvent')
  keyEventEmitter  = new EventEmitter<{key: string; domEvent: KeyboardEvent;}>();

  @ViewChild('terminal', { static: true }) 
  terminalDiv: ElementRef;

  constructor(private ref: ChangeDetectorRef) { 
    // this.termSnippetSubscription = combineLatest(this.termSnippetSubject, this.afterViewInitSubject).subscribe(([snippet]) => {
    //   snippet();
    // });
  }

  private observableSetup(){
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
    // this.afterViewInitSubject.next();
  }

  /**
   * set block or inline-block to #terminal for fitting client or outer element
   */
  private setOuterBlock(isBlock: boolean){
    if(isBlock)
      this.outerStyle['display'] = 'block';
    else
      this.outerStyle['display'] = 'inline-block';
  }

  /**
   * set dimensions
   */
  private setOuterDimensions(left: number, top: number, width: number, height: number) {
    this.outerStyle['left'] = left ? `${left}px` : undefined;
    this.outerStyle['top'] = top ? `${top}px` : undefined;
    this.outerStyle['width'] = width ? `${width}px` : undefined;
    this.outerStyle['height'] = height ? `${height}px` : undefined;
  }
  
  /**
   * remove dimensions
   */
  private removeOuterDimensions(){
    this.outerStyle['left'] = undefined;
    this.outerStyle['top'] = undefined;
    this.outerStyle['width'] = undefined;
    this.outerStyle['height'] = undefined;
  }

  private getDimensionsAheadOfRendering(): {width: number, height: number} | undefined {
    const proposedDimensions = this.fitAddon.proposeDimensions();
    const core = (this.underlying as any)._core;
    try {
      const actualWidth: number | undefined = core._renderService.dimensions.actualCellWidth as number | undefined;
      const actualHeight: number | undefined = core._renderService.dimensions.actualCellWidth as number | undefined;
      const scrollWidth: number = core.viewport.scrollBarWidth as number;
      if (actualWidth && actualHeight) {
        const width = actualWidth * proposedDimensions.cols + scrollWidth;
        const height = actualHeight * proposedDimensions.rows;
        return { width, height }
      }
    } catch (err) {
      console.debug(err);
    }
  }

  setStyle(styleObject: any){
    if(JSON.stringify(this.outerStyle) != JSON.stringify(styleObject)){
      Object.assign(this.outerStyle, styleObject);
      this.ref.markForCheck();
    }
  }

  ngOnInit(){
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
  }


  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    console.debug('ngAfterViewChecked');
    let dims = this.fitAddon.proposeDimensions();
    if(dims === undefined || isNaN(dims.rows) || dims.rows == Infinity || isNaN(dims.cols) || dims.cols == Infinity){
      this.term.resize(10, 10);
    }else if(!this.displayOption.fixedGrid){
      this.fitAddon.fit();
      let dim = this.getDimensionsAheadOfRendering();
      console.debug(dim);
      this.setOuterDimensions(undefined, undefined, dim.width+5, dim.height+5);
    }else{
      this.term.resize(this.displayOption.fixedGrid.cols, this.displayOption.fixedGrid.rows);
      let xtermScreen = this.term.element.getElementsByClassName('xterm-screen')[0];
      let scrollArea = this.term.element.getElementsByClassName('xterm-scroll-area')[0];
      let terminal = this.term.element;
      const contentWidth = xtermScreen.clientWidth;
      const scrollWidth = terminal.clientWidth - scrollArea.clientWidth;
      this.setOuterDimensions(undefined, undefined, contentWidth + scrollWidth, undefined);
    }
  }
  /**
   * clean all resources
   */
  ngOnDestroy(): void {
    if(this.keyInputSubjectSubscription)
      this.keyInputSubjectSubscription.unsubscribe();
    if(this.dataSourceSubscription)
      this.dataSourceSubscription.unsubscribe();
    if(this.keyEventSubjectSubscription)
      this.keyEventSubjectSubscription.unsubscribe();
    if(this.termSnippetSubscription)
    this.termSnippetSubscription.unsubscribe();
    if(this.term)
      this.term.dispose();
  }

  write(chars: string) {
    this.term.write(chars);
  }

  setDisplayOption(opt: DisplayOption) {
    if (opt && !equalsDisplayOption(opt, this.displayOption)) {
      if (opt.fixedGrid != null) {
        console.debug("resizable will be ignored.");
        this.setOuterBlock(false);
        this.removeOuterDimensions();
      } else {
        this.setOuterBlock(true);
      }
      this.displayOption = opt;
      this.ref.markForCheck();
    } else
      console.warn(`This option can't be applied.`);
  }

  get keyInput(): Observable<string> {
    return this.keyInputSubject;
  }

  get keyEventInput(): Observable<{key: string; domEvent: KeyboardEvent;}> {
    return this.keyEventSubject;
  }

  get underlying(): Terminal {
    return this.term;
  }

  get isDraggableOnEdgeActivated() {
    return this.displayOption.activateDraggableOnEdge != undefined && this.displayOption.fixedGrid == undefined;
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
    return (re: ResizeEvent) =>{ 
      const displayOption = comp.displayOption;
      if(displayOption.activateDraggableOnEdge){
        let left = re.rectangle.left, top = re.rectangle.top, width = re.rectangle.width, height = re.rectangle.height;
        if ((width < displayOption.activateDraggableOnEdge.minWidth) || (height < displayOption.activateDraggableOnEdge.minHeight)) {
          return false;
        } else return true;
      }
    }
  }
}
