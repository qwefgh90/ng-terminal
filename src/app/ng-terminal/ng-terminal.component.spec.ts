import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgTerminalComponent } from './ng-terminal.component';

describe('NgTerminalComponent', () => {
    let component: NgTerminalComponent;
    let fixture: ComponentFixture<NgTerminalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NgTerminalComponent],
            imports: [
                BrowserAnimationsModule
            ]

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
