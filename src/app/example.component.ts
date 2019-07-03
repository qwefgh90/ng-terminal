import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgTerminalComponent } from 'ng-terminal';
import { Subject } from 'rxjs';
import { NgTerminal } from 'ng-terminal/lib/ng-terminal';
import { FormControl } from '@angular/forms';
import { DisplayOption } from 'ng-terminal/lib/display-option';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Terminal } from 'xterm';

@Component({
  selector: 'app-root',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit, AfterViewInit{
  title = 'NgTerminal Live Example';
  color = 'accent';

  public resizable: boolean;
  public fixed = true;

  disabled = false;
  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();

  displayOption: DisplayOption = {};
  displayOptionBounded: DisplayOption = {};//now it's not used
  underlying: Terminal;
  
  @ViewChild(NgTerminalComponent) child: NgTerminal;
  
  constructor(){ }

  ngOnInit(){
    this.rowsControl.setValue(10);
    this.colsControl.setValue(40);
  }

  ngAfterViewInit(){
    this.underlying = this.child.underlying;
    this.invalidate();
    this.child.keyInput.subscribe((input) => {
      this.child.write(input);
    })
    this.rowsControl.valueChanges.subscribe(()=> {this.invalidate()});
    this.colsControl.valueChanges.subscribe(()=> {this.invalidate()});
  }

  invalidate(){
    if(this.resizable)
      this.displayOption.activateDraggableOnEdge = {minWidth: 100, minHeight: 100};
    else
      this.displayOption.activateDraggableOnEdge = undefined;
    if(this.fixed)
      this.displayOption.fixedGrid = {rows: this.rowsControl.value, cols: this.colsControl.value};
    else
      this.displayOption.fixedGrid = undefined;
    this.child.setDisplayOption(this.displayOption);
  }
  
  resizableChange(event: MatSlideToggleChange){
    this.resizable = event.checked;
    if(this.resizable)
      this.fixed = false;
    this.invalidate();
  }

  fixedChange(event: MatSlideToggleChange){
    this.fixed = event.checked;
    if(this.fixed)
      this.resizable = false;
    this.invalidate();
  }

  writeSubject = new Subject<string>();
  write(){
    this.writeSubject.next(eval(`'${this.inputControl.value}'`));
  }

  keyInput: string;
  onKeyInput(event: string){
    this.keyInput = event;
  }

  get displayOptionForLiveUpdate(){
    return JSON.parse(JSON.stringify(this.displayOption));
  }
}
