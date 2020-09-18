import { Inject, Injectable } from '@angular/core';
import { RateFetchingStrategy } from "../interfaces/rate-fetching-strategy";
import { from, Observable, of } from "rxjs";
import { Rate } from "../interfaces/rate";
import { catchError, concatMap, filter, finalize, takeWhile } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {

  private lastSuccessfulStrategy: RateFetchingStrategy

  constructor(
    @Inject('RateFetchingStrategy') private strategies: RateFetchingStrategy[]
  ) {
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
