import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NgTerminalComponent } from './ng-terminal.component';
import { GlobalStyleComponent } from './global-style/global-style.component';
import { ResizableModule } from 'angular-resizable-element';
import { Subject } from 'rxjs';
import { keydown } from './test-util'
import { FunctionsUsingCSI, KindOfEraseInDisplay, KindOfEraseInLine } from './functions-using-csi';
import { ViewChild, Component, OnInit, SimpleChange } from '@angular/core';
import { NgTerminal } from './ng-terminal';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({selector: 'app-mat-tab', template: `
  <mat-tab-group #tabGroup>
    <mat-tab label="Tab1">
    </mat-tab>
    <mat-tab label="Tab2">
      <div style="width:100px; height:100px">
        <ng-terminal></ng-terminal>
      </div>
    </mat-tab>
  </mat-tab-group>`})
class AppMatTabComponent{
  @ViewChild('tabGroup', {static: false}) tabGroup: MatTabGroup;
  @ViewChild(NgTerminalComponent, {static: false}) terminal: NgTerminal;
}

describe('NgTerminalComponent with MaterialTab', () => {
  let mattabComponent: AppMatTabComponent;
  let mattabFixture: ComponentFixture<AppMatTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgTerminalComponent, AppMatTabComponent, GlobalStyleComponent ],
      imports: [ ResizableModule, MatTabsModule, BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mattabFixture = TestBed.createComponent(AppMatTabComponent);
    mattabComponent = mattabFixture.componentInstance;
  });

  it(`gets a terminal component out of DOM`, fakeAsync(() => {
    mattabFixture.detectChanges();
    tick(1000);

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let xtermViewport = mattabEl.querySelector('.xterm-viewport');
    expect(xtermScreen).toBeNull();
    expect(xtermViewport).toBeNull();

    // only it is accessed through a component instance
    let hiddenXtermScreen = mattabComponent.terminal.underlying.element.getElementsByClassName('xterm-screen')[0];
    let hiddenViewport = mattabComponent.terminal.underlying.element.getElementsByClassName('xterm-viewport')[0];
    expect(hiddenXtermScreen.isConnected).toBeFalsy();
    expect(hiddenViewport.isConnected).toBeFalsy();
    expect(hiddenXtermScreen.clientWidth).toBe(0);
    expect(hiddenViewport.clientWidth).toBe(0);
    (mattabComponent.terminal as NgTerminalComponent).ngOnDestroy();
  }));

  it(`gets a terminal component inside DOM`, fakeAsync(() => {
    mattabFixture.detectChanges();
    tick(1000);
    (mattabComponent.terminal as any)._rowsInput = 10;
    (mattabComponent.terminal as any)._colsInput = 10;
    (mattabComponent.terminal as any).ngOnChanges({
      _rowsInput: new SimpleChange(undefined, 10, true),
      _colsInput: new SimpleChange(undefined, 10, true),
      _draggableInput: new SimpleChange(undefined, undefined, true)
    });
    tick(1000);
    mattabComponent.tabGroup.selectedIndex = 1;
    mattabFixture.detectChanges();
    tick(1000);

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let xtermViewport = mattabEl.querySelector('.xterm-viewport');
    expect(xtermScreen.isConnected).toBeTruthy();
    expect(xtermViewport.isConnected).toBeTruthy();
    expect(xtermScreen.clientWidth).toBeGreaterThan(10);
    expect(xtermViewport.clientWidth).toBeGreaterThan(10);
  }));

  it(`gets a terminal component inside DOM as soon as a tab is activated`, fakeAsync(() => {
    mattabFixture.detectChanges();
    mattabComponent.tabGroup.selectedIndex = 0;
    mattabFixture.detectChanges();
    tick(1000);
    mattabFixture.detectChanges();

    let hiddenXtermScreen = mattabComponent.terminal.underlying.element.getElementsByClassName('xterm-screen')[0];
    let hiddenViewport = mattabComponent.terminal.underlying.element.getElementsByClassName('xterm-viewport')[0];
    expect(hiddenXtermScreen.isConnected).toBeFalsy();
    expect(hiddenViewport.isConnected).toBeFalsy();

    mattabComponent.tabGroup.selectedIndex = 1;
    mattabFixture.detectChanges();
    tick(1000);
    mattabFixture.detectChanges();

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let xtermViewport = mattabEl.querySelector('.xterm-viewport');
    expect(xtermScreen.isConnected).toBeTruthy();
    expect(xtermViewport.isConnected).toBeTruthy();
    expect(xtermScreen.clientWidth).toBeGreaterThan(10);
    expect(xtermViewport.clientWidth).toBeGreaterThan(10);
  }));

  it(`changes rows and cols`, fakeAsync(() => {
    mattabFixture.detectChanges();
    mattabComponent.tabGroup.selectedIndex = 1;
    mattabFixture.detectChanges();
    tick(1000);

    mattabComponent.terminal.setRows(10);
    mattabComponent.terminal.setCols(10);
    mattabFixture.detectChanges();
    tick(1000);

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let screenWidth1= xtermScreen.clientWidth;
    let screenHeight1= xtermScreen.clientHeight;

    mattabComponent.terminal.setRows(15);
    mattabComponent.terminal.setCols(15);
    mattabFixture.detectChanges();
    tick(1000);
    let screenWidth2= xtermScreen.clientWidth;
    let screenHeight2= xtermScreen.clientHeight;
    expect(screenWidth2).toBeGreaterThan(screenWidth1);
    expect(screenHeight2).toBeGreaterThan(screenHeight1);

    mattabComponent.terminal.setRows(8);
    mattabComponent.terminal.setCols(8);
    mattabFixture.detectChanges();
    tick(1000);
    let screenWidth3= xtermScreen.clientWidth;
    let screenHeight3= xtermScreen.clientHeight;
    expect(screenWidth3).toBeLessThan(screenWidth2);
    expect(screenHeight3).toBeLessThan(screenHeight2);
  }));
});