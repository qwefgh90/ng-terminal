import { async, ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

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
  @ViewChild('tabGroup', {static: false}) tabGroup!: MatTabGroup;
  @ViewChild(NgTerminalComponent, {static: false}) terminal!: NgTerminal;
}

describe('NgTerminalComponent with MaterialTab', () => {
  let mattabComponent: AppMatTabComponent;
  let mattabFixture: ComponentFixture<AppMatTabComponent>;

  beforeEach(waitForAsync(() => {
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

  it(`doesn't open the xterm terminal when it's out of DOM`, fakeAsync(() => {
    mattabFixture.detectChanges();
    tick(1000);

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let xtermViewport = mattabEl.querySelector('.xterm-viewport');
    expect(xtermScreen).toBeNull();
    expect(xtermViewport).toBeNull();

    // only it is accessed through a component instance
    expect(mattabComponent.terminal.underlying).toBeDefined();
    expect(mattabComponent.terminal.underlying?.element).toBeUndefined();

    (mattabComponent.terminal as NgTerminalComponent).ngOnDestroy();
  }));

  it(`open the xterm terminal as soon as a tab is activated`, fakeAsync(() => {
    mattabFixture.detectChanges();
    mattabComponent.tabGroup.selectedIndex = 0;
    mattabFixture.detectChanges();
    tick(1000);

    expect(mattabComponent.terminal?.underlying?.element).toBeUndefined();
    mattabComponent.tabGroup.selectedIndex = 1;
    mattabFixture.detectChanges();
    tick(1000);

    let mattabEl = mattabFixture.nativeElement as HTMLElement;
    let xtermScreen = mattabEl.querySelector('.xterm-screen');
    let xtermViewport = mattabEl.querySelector('.xterm-viewport');
    expect(xtermScreen?.isConnected).toBeTruthy();
    expect(xtermViewport?.isConnected).toBeTruthy();
    expect(xtermScreen?.clientWidth).toBeGreaterThan(10);
    expect(xtermViewport?.clientWidth).toBeGreaterThan(10);
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
    let screenWidth1= xtermScreen!.clientWidth;
    let screenHeight1= xtermScreen!.clientHeight;

    mattabComponent.terminal.setRows(15);
    mattabComponent.terminal.setCols(15);
    mattabFixture.detectChanges();
    tick(1000);
    let screenWidth2= xtermScreen!.clientWidth;
    let screenHeight2= xtermScreen!.clientHeight;
    expect(screenWidth2).toBeGreaterThan(screenWidth1);
    expect(screenHeight2).toBeGreaterThan(screenHeight1);

    mattabComponent.terminal.setRows(8);
    mattabComponent.terminal.setCols(8);
    mattabFixture.detectChanges();
    tick(1000);
    let screenWidth3= xtermScreen!.clientWidth;
    let screenHeight3= xtermScreen!.clientHeight;
    expect(screenWidth3).toBeLessThan(screenWidth2);
    expect(screenHeight3).toBeLessThan(screenHeight2);
  }));
});
