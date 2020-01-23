import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription, combineLatest } from 'rxjs';
import { DisplayOption } from './display-option';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css']
})
export class NgTerminalComponent implements OnInit, AfterViewInit, AfterViewChecked, NgTerminal, OnDestroy {
  private term: Terminal;
  private fitAddon: FitAddon;
  private keyInputSubject: Subject<string> = new Subject<string>();
  private keyEventSubject = new Subject<{key: string; domEvent: KeyboardEvent;}>();
  private termSnippetSubject = new Subject<()=>void>();
  private afterViewInitSubject = new Subject<void>();
  
  private keyInputSubjectSubscription: Subscription;
  private keyEventSubjectSubscription: Subscription;
  private termSnippetSubscription: Subscription;
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  private displayOption: DisplayOption = {};
  private dataSource: Observable<string>;
  private dataSourceSubscription: Subscription;
  terminalStyle: object = {};

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

  @Output('keyInput')
  keyInputEmitter  = new EventEmitter<string>();

  @Output('keyEvent')
  keyEventEmitter  = new EventEmitter<{key: string; domEvent: KeyboardEvent;}>();

  @ViewChild('terminal') 
  terminalDiv: ElementRef;

  constructor() { 
    this.termSnippetSubscription = combineLatest(this.termSnippetSubject, this.afterViewInitSubject).subscribe(([snippet]) => {
      snippet();
    });
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
    this.afterViewInitSubject.next();
  }

  /**
   * set block or inline-block to #terminal for fitting client or outer element
   */
  private setTerminalBlock(isBlock: boolean){
    if(isBlock)
      this.terminalStyle['display'] = 'block';
    else
      this.terminalStyle['display'] = 'inline-block';
  }

  /**
   * set dimensions
   */
  private setTerminalDimension(left: number, top: number, width: number, height: number) {
    this.terminalStyle['left'] = `${left}px`;
    this.terminalStyle['top'] = `${top}px`;
    this.terminalStyle['width'] = `${width}px`;
    this.terminalStyle['height'] = `${height}px`;
  }
  
  /**
   * remove dimensions
   */
  private removeTerminalDimension(){
    this.terminalStyle['left'] = undefined;
    this.terminalStyle['top'] = undefined;
    this.terminalStyle['width'] = undefined;
    this.terminalStyle['height'] = undefined;
  }

  ngOnInit(){
  }

  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    if(this.displayOption.fixedGrid == null)
      this.fitAddon.fit();
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
    if (opt) {
      if (opt.fixedGrid != null) {
        console.debug("resizable will be ignored.");
        this.setTerminalBlock(true);
        this.removeTerminalDimension();
        this.termSnippetSubject.next(() => {
          this.term.resize(opt.fixedGrid.cols, opt.fixedGrid.rows);
          let xtermScreen = this.term.element.getElementsByClassName('xterm-screen')[0];
          let terminal = this.term.element;
          let scrollArea = this.term.element.getElementsByClassName('xterm-scroll-area')[0];
          const contentWidth = xtermScreen.clientWidth;
          const scrollWidth = terminal.clientWidth - scrollArea.clientWidth;
          const borderPx = 6;
          this.setTerminalDimension(undefined, undefined, contentWidth + scrollWidth + borderPx, undefined);
        });
      } else {
        this.removeTerminalDimension();
        this.setTerminalBlock(true);
      }
      this.displayOption = opt;
    } else
      console.warn(`Am empty option is not allowed`);
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
    this.setTerminalDimension(left, top, width, height);
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
