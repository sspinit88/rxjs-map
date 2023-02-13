import './style.css';

import {
  of,
  map,
  Observable,
  range,
  delay,
  from,
  mergeAll,
  mergeMap,
  switchAll,
  BehaviorSubject,
  switchMap,
  concatMap,
  fromEvent,
  exhaustMap,
  interval,
  take,
} from 'rxjs';

const getNewStream = (param) => {
  return of(`новые данные с ${param}`).pipe(delay(1000));
};

/// --- RxJS map, mergeMap, switchMap и concatMap ---///
///-----------------
/// --- map ---
///-----------------
/*
 * Позволяет проводить преобразование результаты запроса в новые объекты.
 */

const itmMap = range(0, 100).pipe(map((number) => Math.pow(number, 2)));
// itmMap.subscribe((map) => console.log(map));

///-----------------
/// --- MergeAll ---
///-----------------
/*
mergeAll заботится о подписке на «внутренний» Observable, чтобы не требовалось делать subscribe два раза, так как mergeAll объединяет значение «внутреннего» Observable с «внешним»
*/
from([1, 2, 3, 4])
  .pipe(
    map((param) => getNewStream(param)),
    mergeAll()
  )
  .subscribe((val) => {
    // console.log('mergeAll:',val);
  });

///-----------------
/// --- MergeMap ---
///-----------------
/*
mergeMap для обработки стримов параллельно;
Работает по аналогии со свзкой map и mergeAll
*/
from([1, 2, 3, 4])
  .pipe(mergeMap((param) => getNewStream(param)))
  .subscribe((val) => {
    // console.log('mergeMap:', val);
  });

///-----------------------------------
///--- SwitchMap (map + switchAll) ---
///-----------------------------------
/*
switchMap если нужно отменять стримы, созданные ранее;
switchMap представляет собой комбинацию switchAll и map
switchAll отменяет предыдущую подписку и подписывается на новую.

switchMap может пригодиться, если нужно скомпоновать список фильтров с потоком данных и выполняеть вызов к API при изменении фильтра.
Если предыдущие изменения фильтра все еще обрабатываются, в то время как новое изменение уже сделано (фильтр обновлен), switchMap отменит предыдущую подписку и начнет новую подписку на последнем изменении.
*/

const filters = ['brand=porsche', 'model=911', 'horsepower=389', 'color=red'];
const activeFilters$ = new BehaviorSubject('');

const applyFilters = () => {
  filters.forEach((filter, index) => {
    let newFilters = activeFilters$.value;

    if (index === 0) {
      newFilters = `?${filter}`;
    } else {
      newFilters = `${newFilters}&${filter}`;
    }

    activeFilters$.next(newFilters);
  });
};

// using switchMap
activeFilters$
  .pipe(switchMap((param) => getNewStream(param)))
  .subscribe((val) => {
    // console.log('switchMap:', val);
  });

applyFilters();

///-----------------------------------
///--- СoncatMap ---
///-----------------------------------
/*
concatMap для обработки стримов по очереди;

oncatMap подписывается на внутренний Observable. Но в отличие от (скажем) switchMap, который отписывается от текущего Observable, если появляется новый Observable, concatMap не будет подписываться на следующий Observable, пока не завершится текущий. Преимущество этого подхда в том, что порядок, в котором эмитятся Observable, поддерживается. 
*/

from([1, 2, 3, 4])
  .pipe(concatMap((param) => getNewStream(param)))
  .subscribe((val) => {
    console.log('concatMap:', val);
  });

///-----------------------------------
///--- exhaustMap ---
///-----------------------------------

/*
  exhaustMap - для игнорирования создания новых стримов, если текущий стрим ещё не был завершён;
*/

// Запускать конечный таймер для каждого клика,только если нет в настоящее время активного таймера
const clicks = fromEvent(document, 'click');
const result = clicks.pipe(exhaustMap((ev) => interval(1000).pipe(take(5))));
result.subscribe((x) => console.log(x));
