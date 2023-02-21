/**
 * An autoincrementing number.
 *
 * With at least 53 bits (Number.MAX_SAFE_INTEGER, while the theoretical float is 64 bits but has extra decimal considerations) of
 * precision, this should not run out during the time the tab is open. This value should not be persisted, and it shall be reset
 * when the application is restarted. If it managed to become a problem, then we can always return strings to use as unique instances instead.
 *
 * This was originally created for the depth-first-search. The naive approach is to declare a visited boolean, clear it before the search,
 * and set it during the search. This is not very efficient or cache-friendly as it goes through memory twice. Furthermore, a number and
 * a boolean should take about the same amount of space in a dynamically-typed language like JavaScript. The new solution is to declare an
 * id to identify the search call instance, generate an autoincremented, and now the old false is !== and the true is ===. Now we eliminate
 * the first pass i.e. clearing the flags. This technique also generalizes to other places.
 */
let counter = 0;

/**
 * Generates an autoincremented value. The type must not be relied on, only the fact that values from different calls to this function are different,
 * and that .toString() exists and is different iff the value is different.
 */
export default function generateAutoincremented() {
  return counter++;
}
