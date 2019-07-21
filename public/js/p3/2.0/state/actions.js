/*
 * action types
 */

export const FETCH_DATA = 'FETCH_DATA'
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * other constants
 */


/*
 * action creators
 */

export function fetchData(data) {
  return { type: FETCH_DATA, data }
}
}