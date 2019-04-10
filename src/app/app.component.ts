import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgTerminalComponent } from 'ng-terminal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{
  private title = 'ng-terminal-app';
  @ViewChild(NgTerminalComponent) child: NgTerminalComponent;
  constructor(){
    
  }
  ngOnInit(){
    
  }

  ngAfterViewInit(){
    this.child.setDisplayOption({activateDraggableOnEdge:{minWidth: 100, minHeight: 100}});
  }
}
