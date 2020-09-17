import { Injectable } from '@angular/core';
import { RateFetchingStrategy } from "../interfaces/rate-fetching-strategy";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { Rate } from "../interfaces/rate";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CbrJsonRateFetchingStrategyService implements RateFetchingStrategy {

  constructor(private http: HttpClient) {
  }

  fetchRates(): Observable<Rate[]> {
    return this.http.get('https://www.cbr-xml-daily.ru/daily_json.js')
      .pipe(switchMap(this.parse))
  }

  private parse(data: HttpResponse<any>): Observable<Rate[]> {
    if (!data.hasOwnProperty('Valute')) {
      throwError('Wrong response from CBR json source!')
    }

    return of(
      Object.values(data['Valute'])
        .map((item: { CharCode: string, Value: number }) => ({
            code: item.CharCode,
            value: item.Value
          })
        )
    )
  }
}
