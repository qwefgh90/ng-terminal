import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleComponent } from './example.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgTerminalModule } from '../modules/ng-terminal/ng-terminal.module';

describe('ExampleComponent', () => {
    let component: ExampleComponent;
    let fixture: ComponentFixture<ExampleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExampleComponent],
            imports: [BrowserAnimationsModule, NgTerminalModule]
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
