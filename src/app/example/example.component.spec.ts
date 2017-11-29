import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleComponent } from './example.component';
import { NgTerminalComponent } from '../ng-terminal/ng-terminal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ExampleComponent', () => {
    let component: ExampleComponent;
    let fixture: ComponentFixture<ExampleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExampleComponent, NgTerminalComponent],
            imports: [BrowserAnimationsModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExampleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
