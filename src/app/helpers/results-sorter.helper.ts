export function distanceSortAsc(a, b) {
    a = parseFloat(a.distance)
    b = parseFloat(b.distance)
    return a > b ? 1: b > a ? -1: 0
  }

export function distanceSortDesc(a, b) {
    a = parseFloat(a.distance)
    b = parseFloat(b.distance)
    return a > b ? -1: b > a ? 1: 0
}

export function ratingSortAsc(a, b) {
    a = a.rating
    b = b.rating
    return a > b ? 1: b > a ? -1: 0
}

export function ratingSortDesc(a, b) {
    a = a.rating
    b = b.rating
    return a > b ? -1: b > a ? 1: 0
}

export function reviewsSortAsc(a, b) {
    a = a.review_count
    b = b.review_count
    return a > b ? 1: b > a ? -1: 0
}

export function reviewsSortDesc(a, b) {
    a = a.review_count
    b = b.review_count
    return a > b ? -1: b > a ? 1: 0
}

export function priceSortAsc(a, b) {
    a = a.price
    b = b.price

    if (a === undefined) { return -1 } else if (b === undefined) { return 1 }
    return a.length > b.length ? 1: b.length > a.length ? -1: 0
}