import { Observable } from "rxjs";
import { Rate } from "./rate";

export interface RateFetchingStrategy {
  fetchRates(): Observable<Rate[]>
}
