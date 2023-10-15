export function setYelpRatingImage(rating: number) {

    let rating_image

    if (rating == 0) {
      rating_image = 'regular_0.png'
    } else if (rating == 1) {
      rating_image = 'regular_1.png'
    } else if (rating == 1.5) {
      rating_image = 'regular_1_half.png'
    } else if (rating == 2) {
      rating_image = 'regular_2.png'
    } else if (rating == 2.5) {
      rating_image = 'regular_2_half.png'
    } else if (rating == 3) {
      rating_image = 'regular_3.png'
    } else if (rating == 3.5) {
      rating_image = 'regular_3_half.png'
    } else if (rating == 4) {
      rating_image = 'regular_4.png'
    } else if (rating == 4.5) {
      rating_image = 'regular_4_half.png'
    } else {
      rating_image = 'regular_5.png'
    }

    return `assets/images/yelp/yelp_stars/${rating_image}`

}

export function metersToMiles(m) {
    const miles: number = 0.00062137 * m
    const miles_fixed = miles.toPrecision(2)
    return miles_fixed
}