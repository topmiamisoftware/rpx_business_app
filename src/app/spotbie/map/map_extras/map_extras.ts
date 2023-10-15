export const MAP_STYLES = [
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [
      {
        visibility: 'on',
      },
      {
        color: '#fdfdfd',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#f5efef',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#b04949',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'geometry.fill',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.government',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
      {
        saturation: '3',
      },
      {
        lightness: '22',
      },
    ],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ffffff',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        gamma: 7.18,
      },
      {
        color: '#ffffff',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'on',
      },
      {
        saturation: '-35',
      },
      {
        lightness: '-95',
      },
      {
        gamma: '0.00',
      },
      {
        weight: '0.01',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'all',
    stylers: [
      {
        color: '#ffb900',
      },
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.fill',
    stylers: [
      {
        visibility: 'off',
      },
      {
        saturation: '-15',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        gamma: 0.48,
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit.station.rail',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
      {
        color: '#ff0000',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [
      {
        color: '#4d4946',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        visibility: 'on',
      },
      {
        color: '#a8bbd5',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        hue: '#ff0000',
      },
    ],
  },
];

export const FOOD_CATEGORIES = [
  'Asian Fusion',
  'Bagels',
  'Bakery',
  'Bar',
  'Barbeque',
  'Breakfast',
  'British',
  'Brunch',
  'Buffets',
  'Burgers',
  'Cajun/Creole',
  'Caribbean',
  'Coffee/Espresso',
  'Country Food',
  'Cuban',
  'Deli',
  'Doughnuts',
  'Family Fare',
  'Fast Food',
  'Fine Dining',
  'Food Trucks',
  'French',
  'German',
  'Gluten-free',
  'Greek',
  'Happy Hour',
  'Hot Dogs',
  'Ice Cream',
  'Indian',
  'Irish',
  'Italian',
  'Japanese',
  'Latin American',
  'Live Entertainment',
  'Mediterranean',
  'Mexican',
  'Nouvelle',
  'Pancakes/Waffles',
  'Pizza',
  'Polish',
  'Sandwiches',
  'Seafood',
  'Soul Food',
  'Soup & Salad',
  'Southern',
  'Spanish',
  'Sports Bar',
  'Steaks',
  'Sushi',
  'Tapas',
  'Thai',
  'Vegan Friendly',
  'Vegetarian',
];

export const SHOPPING_CATEGORIES = [
  'Antiques',
  'Art Galleries',
  'Arts & Crafts',
  'Auction Houses',
  'Baby Gear',
  'Battery Stores',
  'Bespoke Clothing',
  'Books, Mags, Music & Video',
  'Brewing Supplies',
  'Bridal',
  'Cannabis Dispensaries',
  'Clothing',
  'Computers',
  'Cosmetics & Beauty Supply',
  'Customized Merchandise',
  'Department Stores',
  'Discount Stores',
  'Drones',
  'Drugstores',
  'Duty-Free Shops',
  'Electronics',
  'Eyeware & Opticians',
  'Farming Equipment',
  'Fashion',
  'Fireworks',
  'Fitness/Exercise Equipment',
  'Flea Markets',
  'Flowers & Gifts',
  'Gemstones & Minerals',
  'Gold Buyers',
  'Groceries',
  'Guns & Ammo',
  'Head Shops',
  'High Fidelity Audio Equipment',
  'Hobby Shops',
  'Home & Garden',
  'Horse Equipment Shops',
  'Jewelry',
  'Knitting Supplies',
  'Livestock Feed & Supply',
  'Luggage',
  'Medical Supplies',
  'Military Surplus',
  'Mobile Phone Accessories',
  'Mobile Phones',
  'Motorcycle Gear',
  'Musical Instruments & Teachers',
  'Office Equipment',
  'Outlet Stores',
  'Packing Supplies',
  'Pawn Shops',
  'Perfume',
  'Photography Stores & Services',
  'Pool & Billiards',
  'Pop-up Shops',
  'Props',
  'Public Markets',
  'Religious Items',
  'Safe Stores',
  'Safety Equipment',
  'Shopping Centers',
  'Souvenir Shops',
  'Spiritual Shops',
  'Sporting Goods',
  'Tabletop Games',
  'Teacher Supplies',
  'Thrift Stores',
  'Tobacco Shops',
  'Toy Stores',
  'Trophy Shops',
  'Uniforms',
  'Used Bookstore',
  'Vape Shops',
  'Vitamins & Supplements',
  'Watches',
  'Wholesale Stores',
  'Wigs',
];

export const EVENT_CATEGORIES = [
  'Film',
  'Arts & Theatre',
  'Music',
  'Sports',
  'Miscellaneous',
  'Nonticket',
];

export const BANNED_YELP_IDS = [
  'a4LjewExxqm72UJC1-Ct_Q',
  'C_AO6re_izyQrv9FTt0CcQ',
  'Z3EPvIqhUIaDHSgrVBNEAg',
];
