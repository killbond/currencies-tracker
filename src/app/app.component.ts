import { Component, OnInit } from '@angular/core';
import { CurrencyService } from "./services/currency.service";
import { finalize, map, switchMap } from "rxjs/operators";
import { Observable, Subscription, timer } from "rxjs";
import { Rate } from "./interfaces/rate";

const displayedCurrencies = ['EUR', 'USD']

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  loading = false;

  rates: Rate[] = []

  private polling$: Subscription

  constructor(private currencyService: CurrencyService) {
  }

  ngOnInit(): void {
    this.polling$ = timer(500, 10000)
      .pipe(
        switchMap(() => this.fetchRates()),
        map((rates: Rate[]) => rates.filter((rate: Rate) => displayedCurrencies.includes(rate.code))),
      )
      .subscribe(this.onFetchingRates.bind(this))
  }

  fetchRates(): Observable<Rate[]> {
    this.loading = true
    return this.currencyService.getCurrencies()
      .pipe(finalize(() => this.loading = false))
  }

  onFetchingRates(rates: Rate[]) {
    this.rates = rates
  }
}
