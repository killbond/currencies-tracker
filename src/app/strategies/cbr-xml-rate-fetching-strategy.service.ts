import { Injectable } from '@angular/core';
import { RateFetchingStrategy } from "../interfaces/rate-fetching-strategy";
import { Observable } from "rxjs";
import { Rate } from "../interfaces/rate";
import { switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import xml2js from 'xml2js';

@Injectable({
  providedIn: 'root',
})
export class CbrXmlRateFetchingStrategyService implements RateFetchingStrategy {

  constructor(
    private http: HttpClient,
  ) {
  }

  fetchRates(): Observable<Rate[]> {
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'text/xml')

    return this.http.get('https://www.cbr-xml-daily.ru/daily_utf8.xml', {headers, responseType: 'text'})
      .pipe(switchMap(this.parse))
  }

  private parse(data: string) {
    return new Observable<Rate[]>(subscriber => {
      xml2js.parseString(data, function (err, result: any) {
        if (err) {
          subscriber.error(err)
          subscriber.complete()
          return
        }

        if (!result || !result.hasOwnProperty('ValCurs')) {
          subscriber.error('Wrong response from CBR xml source!')
          subscriber.complete()
          return
        }

        let rates = Object.values(result['ValCurs']['Valute'])
          .map((item: { CharCode: string, Value: number }) => ({
              code: item.CharCode[0],
              value: parseFloat(item.Value[0].replace(',', '.'))
            })
          )

        subscriber.next(rates)
        subscriber.complete()
      })
    })
  }
}
