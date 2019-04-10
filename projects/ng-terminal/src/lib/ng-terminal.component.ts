import { Component, OnInit, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { NgTerminalService } from './ng-terminal.service';
import { NgTerminalApi } from './ng-terminal-api';
import { Subject } from 'rxjs';
import { DisplayOption } from './display-option';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css']
})
export class NgTerminalComponent implements OnInit, AfterViewChecked, NgTerminalApi {
  private term: Terminal
  private userInputSubject: Subject<string> = new Subject<string>();
  private h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  private displayOption: DisplayOption = {activateDraggableOnEdge: undefined};
  style: object = {};// height: (this.h / 2) + 'px' };
  
  get isDraggableOnEdgeActivated() {
    return this.displayOption.activateDraggableOnEdge != undefined
  }

  constructor() {  }

  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    if(this.displayOption.fixedSize == undefined)
      fit.fit(this.term);
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngOnInit() {
    Terminal.applyAddon(fit);  // Apply the `fit` addon   
    this.term = new Terminal();
    this.term.open(document.getElementById('terminal'));
    this.term.on('data', (input) => {
      this.userInputSubject.next(input);
    })
  }

  write(chars: string) {
    this.term.write(chars);
  }
  userInput(): import("rxjs").Observable<string> {
    return this.userInputSubject;
  }
  underlying(): Terminal {
    return this.term;
  }
  setDisplayOption(opt: import("./display-option").DisplayOption){
    if(opt.fixedSize != undefined){
      this.term.resize(opt.fixedSize.cols, opt.fixedSize.rows);
      this.style['display'] = 'inline-block';
    }else
      this.style['display'] = 'block';
    this.displayOption = opt;
  }
  
  /**
   * After user coordinate a size of terminal, it's called.
   * @param left 
   * @param top 
   * @param width 
   * @param height 
   */
  onResizeEnd(left: number, top: number, width: number, height: number): void {
      this.style['left'] = `${left}px`;
      this.style['top'] = `${top}px`;
      this.style['width'] = `${width}px`;
      this.style['height'] = `${height}px`;
  }

  /**
   * Before onResizeEnd is called, it valiates a size to change.
   * @param re dimension to be submitted from resizable stuff
   */
  validatorFactory(): (re: ResizeEvent) => boolean {
    const comp = this;
    return (re: ResizeEvent) =>{ 
      const displayOption = comp.displayOption;
      if(displayOption.activateDraggableOnEdge != undefined){
        let left = re.rectangle.left, top = re.rectangle.top, width = re.rectangle.width, height = re.rectangle.height;
        if ((width < displayOption.activateDraggableOnEdge.minWidth) || (height < displayOption.activateDraggableOnEdge.minHeight)) {
          return false;
        } else return true;
      }
    }
  }
}
