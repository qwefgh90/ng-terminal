import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTerminalComponent } from './ng-terminal.component';
import { GlobalStyleComponent } from './global-style/global-style.component';

describe('NgTerminalComponent', () => {
  let component: NgTerminalComponent;
  let fixture: ComponentFixture<NgTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgTerminalComponent, GlobalStyleComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
