import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgTerminalComponent } from 'ng-terminal';
import { Subject } from 'rxjs';
import { NgTerminal } from 'ng-terminal/lib/ng-terminal';
import { FormControl } from '@angular/forms';
import { DisplayOption } from 'ng-terminal/lib/display-option';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit, AfterViewInit{
  title = 'NgTerminal Example';
  color = 'accent';

  private resizable: boolean;
  private fixed = false;

  disabled = false;
  rowsControl = new FormControl();
  colsControl = new FormControl();

  displayOption: DisplayOption = {};
  
  @ViewChild(NgTerminalComponent) child: NgTerminal;
  
  constructor(){ }

  ngOnInit(){
    this.rowsControl.setValue(20);
    this.colsControl.setValue(80);
  }

  ngAfterViewInit(){
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
    this.invalidate();
  }

  fixedChange(event: MatSlideToggleChange){
    this.fixed = event.checked;
    this.invalidate();
  }

  get displayOptionForLiveUpdate(){
    return JSON.parse(JSON.stringify(this.displayOption));
  }
}
