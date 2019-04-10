import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NgTerminalComponent } from './ng-terminal.component';
import { GlobalStyleComponent } from './global-style/global-style.component';
import { ResizableModule } from 'angular-resizable-element';

describe('NgTerminalComponent', () => {
  let component: NgTerminalComponent;
  let fixture: ComponentFixture<NgTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgTerminalComponent, GlobalStyleComponent ],
      imports: [ ResizableModule ]
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

  it('underlying()', () => {
    expect(component.underlying()).toBeDefined("underlying doesn't exist.")
  });

  it('write()', fakeAsync(() =>{
    const dummy = "dummy data"
    component.write(dummy);
    
    const term = component.underlying();
    term.selectAll();
    tick(500);
    expect(term.getSelection().trim()).toEqual(dummy);
  }));

  it('userInput()', (doneFn) => {
    let arr = ['h','i','!','\n']
    let result = [];
    component.userInput().subscribe((char) => {
      result.push(char);
      if(arr.length == result.length){
        expect(arr.join('')).toEqual(result.join(''));
        doneFn();
      }
    });

    const terminalEventConsumer = fixture.nativeElement.querySelector('#terminal').getElementsByTagName('textarea')[0];
    arr.forEach((v) => {
      terminalEventConsumer.dispatchEvent(keydown(v));
    });
  });

  it('should observe inputs and provide them to user', () => {
    
  });

  it('should decrease div size after changing to fixed mode', () => {
    const term = fixture.nativeElement.querySelector('#terminal');
    const beforeWidth = term.clientWidth;
    const beforeHeight = term.clientHeight;
    component.setDisplayOption({fixedSize:{rows: 4, cols: 4}});
    fixture.detectChanges();
    
    const afterWidth = term.clientWidth;
    const afterHeight = term.clientHeight;
    
    expect(afterWidth).toBeLessThan(beforeWidth);
    expect(afterHeight).toBeLessThan(beforeHeight);
    
  })

  it('validatorFactory()', () => {
    component.setDisplayOption({activateDraggableOnEdge:{minHeight:100, minWidth:100}});
    let res1 = component.validatorFactory()({rectangle:{left: undefined, top: undefined, bottom: undefined, right: undefined, width: 99, height: 99}, edges: undefined})
    expect(res1).toBeFalsy('it must be false because it is smaller than minimum size');
    let res2 = component.validatorFactory()({rectangle:{left: undefined, top: undefined, bottom: undefined, right: undefined, width: 100, height: 100}, edges: undefined})
    expect(res2).toBeTruthy('it must be true because it is bigger than minimum size');
    let res3 = component.validatorFactory()({rectangle:{left: undefined, top: undefined, bottom: undefined, right: undefined, width: 200, height: 200}, edges: undefined})
    expect(res3).toBeTruthy('it must be true because it is bigger than minimum size');
  });

  function keydown(char: string){
    const init = {key: char, keyCode: '68'};
    return new KeyboardEvent('keydown', init);
  }

});
