import { Inject, Injectable } from '@angular/core';
import { RateFetchingStrategy } from "../interfaces/rate-fetching-strategy";
import { Observable, onErrorResumeNext, throwError } from "rxjs";
import { Rate } from "../interfaces/rate";
import { catchError, take, tap } from "rxjs/operators";

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
    return this.lastSuccessfulStrategy ?
      this.repeatLastSuccessfulStrategy() :
      this.findRobustStrategy()
  }

  private repeatLastSuccessfulStrategy(): Observable<Rate[]> {
    return this.lastSuccessfulStrategy.fetchRates()
      .pipe(catchError(e => {
        this.lastSuccessfulStrategy = null
        return throwError(e)
      }))
  }

  private findRobustStrategy(): Observable<Rate[]> {
    return onErrorResumeNext(...this.strategies.map((strategy: RateFetchingStrategy) =>
      strategy.fetchRates().pipe(tap(() => this.lastSuccessfulStrategy = strategy)))
    ).pipe(take(1)) as Observable<Rate[]>
  }
}

