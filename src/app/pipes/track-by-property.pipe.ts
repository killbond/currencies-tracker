import { Pipe, PipeTransform, TrackByFunction } from "@angular/core";

interface TrackByFunctionCache {
  [propertyName: string]: <T>(index: number, item: T) => any;
}

var cache: TrackByFunctionCache = Object.create(null);

@Pipe({
  name: "trackByProperty",
  pure: true
})
export class TrackByPropertyPipe<T> implements PipeTransform {

  public transform(propertyName: string): TrackByFunction<T> {
    if (!cache[propertyName]) {
      cache[propertyName] = function trackByProperty<T>(index: number, item: T): any {
        return (item[propertyName]);
      };
    }
    return (cache[propertyName]);
  }

}