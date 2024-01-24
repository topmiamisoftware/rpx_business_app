export function setYelpRatingImage(rating: number) {
    let ratingImage;

    if (rating === 0) {
      ratingImage = 'regular_0.png';
    } else if (rating === 1) {
      ratingImage = 'regular_1.png';
    } else if (rating === 1.5) {
      ratingImage = 'regular_1_half.png';
    } else if (rating === 2) {
      ratingImage = 'regular_2.png';
    } else if (rating === 2.5) {
      ratingImage = 'regular_2_half.png';
    } else if (rating === 3) {
      ratingImage = 'regular_3.png';
    } else if (rating === 3.5) {
      ratingImage = 'regular_3_half.png';
    } else if (rating === 4) {
      ratingImage = 'regular_4.png';
    } else if (rating === 4.5) {
      ratingImage = 'regular_4_half.png';
    } else {
      ratingImage = 'regular_5.png';
    }

    return `assets/images/yelp/yelp_stars/${ratingImage}`;
}

export function metersToMiles(m) {
    const miles: number = 0.00062137 * m;
    const miles_fixed = miles.toPrecision(2);
    return miles_fixed;
}
