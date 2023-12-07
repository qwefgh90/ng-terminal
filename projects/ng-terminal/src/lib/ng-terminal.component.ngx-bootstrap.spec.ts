import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';

import { NgTerminalComponent } from './ng-terminal.component';
import { GlobalStyleComponent } from './global-style/global-style.component';
import { ResizableModule } from 'angular-resizable-element';
import { ViewChild, Component, OnInit, SimpleChange } from '@angular/core';
import { NgTerminal } from './ng-terminal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabsModule } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-ngx-tab',
  template: `
    <div style="height: 200px;">
      <tabset>
        <tab heading="Basic title" id="tab1">Basic content</tab>
        <tab heading="Basic Title 1">Basic content 1</tab>
        <tab heading="Basic Title 2">
          <div style="width:200px; height:200px">
            <ng-terminal></ng-terminal>
          </div>
        </tab>
      </tabset>
    </div>
  `,
})
class AppNgxTabComponent {
  // @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup;
  @ViewChild(NgTerminalComponent, { static: false }) terminal!: NgTerminal;
}

describe('NgTerminalComponent with NgxBootstrap', () => {
  let appComponent: AppNgxTabComponent;
  let ngxTabFixture: ComponentFixture<AppNgxTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        NgTerminalComponent,
        AppNgxTabComponent,
        GlobalStyleComponent,
      ],
      imports: [TabsModule.forRoot(), ResizableModule, BrowserAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    ngxTabFixture = TestBed.createComponent(AppNgxTabComponent);
    appComponent = ngxTabFixture.componentInstance;
  });

  it(`create elements that belong to each tab and connect them to DOM`, fakeAsync(() => {
    ngxTabFixture.detectChanges();
    tick(1000);

    let ngxTabEl = ngxTabFixture.nativeElement as HTMLElement;
    let xtermScreen = ngxTabEl.querySelector('.xterm-screen');
    let xtermViewport = ngxTabEl.querySelector('.xterm-viewport');
    expect(xtermScreen).toBeDefined();
    expect(xtermViewport).toBeDefined();

    // only it is accessed through a component instance
    expect(appComponent.terminal.underlying).toBeDefined();
    expect(appComponent.terminal.underlying?.element).toBeDefined();
  }));

  it(`grow the size of the terminal when the tab is activated`, (done: DoneFn) => {
    ngxTabFixture.detectChanges();
    setTimeout(() => {
      let ngxTabEl = ngxTabFixture.nativeElement as HTMLElement;
      let anchors = ngxTabEl.querySelectorAll('a');
      let xtermScreen = ngxTabEl.querySelector('.xterm-screen');
      let xtermViewport = ngxTabEl.querySelector('.xterm-viewport');
      expect(xtermScreen?.clientWidth).toBe(0);
      expect(xtermScreen?.clientHeight).toBe(0);

      expect(anchors.length).toBe(3);
      anchors[2].click();
      ngxTabFixture.detectChanges();
      setTimeout(() => {
        // only it is accessed through a component instance
      expect(xtermScreen?.clientWidth).toBeGreaterThan(0);
      expect(xtermScreen?.clientHeight).toBeGreaterThan(0);
        done();
      }, 100);
    }, 100);
  });
});
