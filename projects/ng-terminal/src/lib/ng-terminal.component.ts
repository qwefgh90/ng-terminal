import { Component, OnInit, AfterViewChecked, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { NgTerminal } from './ng-terminal';
import { Subject, Observable, Subscription } from 'rxjs';
import { DisplayOption } from './display-option';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css']
})
export class NgTerminalComponent implements OnInit, AfterViewChecked, NgTerminal, OnDestroy {
  private term: Terminal
  private keyInputSubject: Subject<string> = new Subject<string>();
  private keyInputSubjectSubscription: Subscription;
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  private displayOption: DisplayOption = {};
  private dataSource: Observable<string>;
  private dataSourceSubscription: Subscription;
  terminalStyle: object = {};// height: (this.h / 2) + 'px' };
  
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

  constructor() { }

  private observableSetup(){
    this.term.on('data', (input) => {
      this.keyInputSubject.next(input);
    });
    this.keyInputSubjectSubscription = this.keyInputSubjectSubscription = this.keyInputSubject.subscribe((data) => {
      this.keyInputEmitter.emit(data);
    })
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

  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    if(this.displayOption.fixedGrid == null)
      fit.fit(this.term);
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngOnInit() {
    Terminal.applyAddon(fit);  // Apply the `fit` addon   
    this.term = new Terminal();
    this.term.open(document.getElementById('terminal'));
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
  }

  write(chars: string) {
    this.term.write(chars);
  }
  
  setDisplayOption(opt: DisplayOption){
    if(opt.fixedGrid != null){
      console.debug("resizable will be ignored.")
      this.term.resize(opt.fixedGrid.cols, opt.fixedGrid.rows);
      this.setTerminalBlock(false);
      this.removeTerminalDimension()
    }else{
      this.setTerminalBlock(true);
    }
    this.displayOption = opt;
  }

  get keyInput(): Observable<string> {
    return this.keyInputSubject;
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
