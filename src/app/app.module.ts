import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from "@angular/common/http";
import { TrackByPropertyPipe } from "./pipes/track-by-property.pipe";
import { CbrJsonRateFetchingStrategyService } from "./strategies/cbr-json-rate-fetching-strategy.service";
import { CbrXmlRateFetchingStrategyService } from "./strategies/cbr-xml-rate-fetching-strategy.service";

@NgModule({
  declarations: [
    AppComponent,
    TrackByPropertyPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    { provide: 'RateFetchingStrategy', useClass: CbrJsonRateFetchingStrategyService, multi: true },
    { provide: 'RateFetchingStrategy', useClass: CbrXmlRateFetchingStrategyService, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
