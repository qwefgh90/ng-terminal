import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { NgTerminalModule } from 'ng-terminal';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ExampleComponent } from './example.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { TabsModule } from 'ngx-bootstrap/tabs';
@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    BrowserModule,
    NgTerminalModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCardModule,
    NgxJsonViewerModule,
    MatFormFieldModule,
    MatTabsModule,
    TabsModule.forRoot()
  ],
  providers: [],
  bootstrap: [ExampleComponent]
})
export class AppModule { }
