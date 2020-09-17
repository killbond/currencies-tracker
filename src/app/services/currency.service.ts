import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { RateFetchingStrategy } from "../interfaces/rate-fetching-strategy";
import { CbrJsonRateFetchingStrategyService } from "../strategies/cbr-json-rate-fetching-strategy.service";
import { CbrXmlRateFetchingStrategyService } from "../strategies/cbr-xml-rate-fetching-strategy.service";
import { from, Observable, of } from "rxjs";
import { Rate } from "../interfaces/rate";
import { catchError, concatMap, filter, finalize, takeWhile } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private readonly strategies: RateFetchingStrategy[]

  private lastSuccessfulStrategy: RateFetchingStrategy

  constructor(
    private http: HttpClient
  ) {
    this.strategies = [
      new CbrJsonRateFetchingStrategyService(this.http),
      new CbrXmlRateFetchingStrategyService(this.http),
    ]
  }

  getCurrencies(): Observable<Rate[]> {
    if (this.lastSuccessfulStrategy) {
      return this.lastSuccessfulStrategy.fetchRates()
        .pipe(catchError(e => {
          this.lastSuccessfulStrategy = null
          return of(e)
        }))
    }

    return from(this.strategies)
      .pipe(
        concatMap((strategy: RateFetchingStrategy) => strategy.fetchRates()
          .pipe(
            catchError(e => of(e)),
            finalize(() => this.lastSuccessfulStrategy = strategy)
          )
        ),
        takeWhile((response: Rate[] | Error) => response instanceof Error, true),
        filter((response: Rate[]) => response instanceof Array),
      )
  }
}
