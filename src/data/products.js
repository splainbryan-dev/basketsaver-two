// src/data/products.js
// Local product database — fallback when Kroger API is unavailable.
// Also used for the pricing engine baseline.

export const PRODUCTS = [
  // Dairy & Eggs
  { id: "p001", name: "Whole Milk (1 gallon)",           category: "Dairy & Eggs",        kroger_price: 3.49, unit: "gallon",   weight_class: "core" },
  { id: "p002", name: "Large Eggs (1 dozen)",            category: "Dairy & Eggs",        kroger_price: 3.29, unit: "dozen",    weight_class: "core" },
  { id: "p003", name: "Butter (1 lb)",                   category: "Dairy & Eggs",        kroger_price: 4.99, unit: "lb",       weight_class: "core" },
  { id: "p004", name: "Shredded Cheddar Cheese (8 oz)",  category: "Dairy & Eggs",        kroger_price: 3.79, unit: "8 oz",     weight_class: "core" },
  { id: "p005", name: "Greek Yogurt (32 oz)",            category: "Dairy & Eggs",        kroger_price: 5.49, unit: "32 oz",    weight_class: "core" },
  { id: "p006", name: "American Cheese Slices (16 oz)",  category: "Dairy & Eggs",        kroger_price: 4.29, unit: "16 oz",    weight_class: "core" },
  { id: "p007", name: "2% Milk (1 gallon)",              category: "Dairy & Eggs",        kroger_price: 3.49, unit: "gallon",   weight_class: "core" },
  { id: "p008", name: "Heavy Whipping Cream (1 pint)",   category: "Dairy & Eggs",        kroger_price: 3.99, unit: "pint",     weight_class: "standard" },

  // Meat & Seafood
  { id: "p010", name: "Boneless Chicken Breast (per lb)",category: "Meat & Seafood",      kroger_price: 3.99, unit: "lb",       weight_class: "core" },
  { id: "p011", name: "80/20 Ground Beef (per lb)",      category: "Meat & Seafood",      kroger_price: 5.49, unit: "lb",       weight_class: "core" },
  { id: "p012", name: "Pork Chops Bone-In (per lb)",     category: "Meat & Seafood",      kroger_price: 3.49, unit: "lb",       weight_class: "standard" },
  { id: "p013", name: "Atlantic Salmon Fillet (per lb)", category: "Meat & Seafood",      kroger_price: 9.99, unit: "lb",       weight_class: "standard" },
  { id: "p014", name: "Chicken Thighs Bone-In (per lb)", category: "Meat & Seafood",      kroger_price: 1.99, unit: "lb",       weight_class: "core" },
  { id: "p015", name: "Bacon (16 oz)",                   category: "Meat & Seafood",      kroger_price: 6.99, unit: "16 oz",    weight_class: "standard" },
  { id: "p016", name: "Hot Dogs (16 oz)",                category: "Meat & Seafood",      kroger_price: 3.49, unit: "16 oz",    weight_class: "standard" },
  { id: "p017", name: "Italian Sausage (19 oz)",         category: "Meat & Seafood",      kroger_price: 4.99, unit: "19 oz",    weight_class: "standard" },

  // Fresh Produce
  { id: "p020", name: "Bananas (per lb)",                category: "Fresh Produce",       kroger_price: 0.59, unit: "lb",       weight_class: "core" },
  { id: "p021", name: "Gala Apples (per lb)",            category: "Fresh Produce",       kroger_price: 1.49, unit: "lb",       weight_class: "core" },
  { id: "p022", name: "Russet Potatoes (5 lb bag)",      category: "Fresh Produce",       kroger_price: 3.99, unit: "5 lb",     weight_class: "core" },
  { id: "p023", name: "Yellow Onions (3 lb bag)",        category: "Fresh Produce",       kroger_price: 2.99, unit: "3 lb",     weight_class: "core" },
  { id: "p024", name: "Romaine Lettuce (3-pack)",        category: "Fresh Produce",       kroger_price: 3.49, unit: "3-pack",   weight_class: "standard" },
  { id: "p025", name: "Baby Carrots (1 lb)",             category: "Fresh Produce",       kroger_price: 1.49, unit: "lb",       weight_class: "standard" },
  { id: "p026", name: "Broccoli (per head)",             category: "Fresh Produce",       kroger_price: 1.99, unit: "head",     weight_class: "standard" },
  { id: "p027", name: "Roma Tomatoes (per lb)",          category: "Fresh Produce",       kroger_price: 1.29, unit: "lb",       weight_class: "standard" },
  { id: "p028", name: "Strawberries (1 lb)",             category: "Fresh Produce",       kroger_price: 3.99, unit: "lb",       weight_class: "standard" },
  { id: "p029", name: "Avocado (each)",                  category: "Fresh Produce",       kroger_price: 1.29, unit: "each",     weight_class: "standard" },

  // Bakery & Bread
  { id: "p030", name: "White Sandwich Bread (20 oz)",    category: "Bakery & Bread",      kroger_price: 2.99, unit: "20 oz",    weight_class: "core" },
  { id: "p031", name: "Whole Wheat Bread (20 oz)",       category: "Bakery & Bread",      kroger_price: 3.49, unit: "20 oz",    weight_class: "core" },
  { id: "p032", name: "Hamburger Buns (8 ct)",           category: "Bakery & Bread",      kroger_price: 2.49, unit: "8 ct",     weight_class: "standard" },
  { id: "p033", name: "Hot Dog Buns (8 ct)",             category: "Bakery & Bread",      kroger_price: 2.29, unit: "8 ct",     weight_class: "standard" },
  { id: "p034", name: "Flour Tortillas (10 ct)",         category: "Bakery & Bread",      kroger_price: 3.29, unit: "10 ct",    weight_class: "standard" },

  // Pantry
  { id: "p040", name: "Long Grain White Rice (5 lb)",    category: "Pantry",              kroger_price: 4.99, unit: "5 lb",     weight_class: "core" },
  { id: "p041", name: "Spaghetti Pasta (16 oz)",         category: "Pantry",              kroger_price: 1.49, unit: "16 oz",    weight_class: "core" },
  { id: "p042", name: "Penne Pasta (16 oz)",             category: "Pantry",              kroger_price: 1.49, unit: "16 oz",    weight_class: "core" },
  { id: "p043", name: "Olive Oil (16.9 oz)",             category: "Pantry",              kroger_price: 6.99, unit: "16.9 oz",  weight_class: "standard" },
  { id: "p044", name: "Tomato Sauce (15 oz can)",        category: "Pantry",              kroger_price: 0.89, unit: "15 oz",    weight_class: "standard" },
  { id: "p045", name: "Black Beans (15 oz can)",         category: "Pantry",              kroger_price: 0.99, unit: "15 oz",    weight_class: "standard" },
  { id: "p046", name: "Chicken Broth (32 oz)",           category: "Pantry",              kroger_price: 2.49, unit: "32 oz",    weight_class: "standard" },
  { id: "p047", name: "Peanut Butter (16 oz)",           category: "Pantry",              kroger_price: 3.99, unit: "16 oz",    weight_class: "standard" },
  { id: "p048", name: "Strawberry Jam (18 oz)",          category: "Pantry",              kroger_price: 3.49, unit: "18 oz",    weight_class: "low" },
  { id: "p049", name: "Ketchup (32 oz)",                 category: "Pantry",              kroger_price: 2.99, unit: "32 oz",    weight_class: "standard" },

  // Frozen
  { id: "p050", name: "Frozen Mixed Vegetables (12 oz)", category: "Frozen",              kroger_price: 1.99, unit: "12 oz",    weight_class: "standard" },
  { id: "p051", name: "Frozen French Fries (32 oz)",     category: "Frozen",              kroger_price: 3.99, unit: "32 oz",    weight_class: "standard" },
  { id: "p052", name: "Frozen Pizza (pepperoni, 12\")",  category: "Frozen",              kroger_price: 5.99, unit: "each",     weight_class: "low" },
  { id: "p053", name: "Ice Cream (1.5 qt)",              category: "Frozen",              kroger_price: 4.99, unit: "1.5 qt",   weight_class: "low" },

  // Breakfast & Cereal
  { id: "p060", name: "Cheerios (18 oz)",                category: "Breakfast & Cereal",  kroger_price: 4.99, unit: "18 oz",    weight_class: "standard" },
  { id: "p061", name: "Quaker Oats (42 oz)",             category: "Breakfast & Cereal",  kroger_price: 4.49, unit: "42 oz",    weight_class: "standard" },
  { id: "p062", name: "Maple Syrup (12 oz)",             category: "Breakfast & Cereal",  kroger_price: 5.99, unit: "12 oz",    weight_class: "low" },
  { id: "p063", name: "Orange Juice (52 oz)",            category: "Breakfast & Cereal",  kroger_price: 4.49, unit: "52 oz",    weight_class: "standard" },

  // Snacks
  { id: "p070", name: "Lay's Potato Chips (8 oz)",       category: "Snacks",              kroger_price: 4.29, unit: "8 oz",     weight_class: "low" },
  { id: "p071", name: "Oreo Cookies (14.3 oz)",          category: "Snacks",              kroger_price: 4.49, unit: "14.3 oz",  weight_class: "low" },
  { id: "p072", name: "Saltine Crackers (16 oz)",        category: "Snacks",              kroger_price: 2.99, unit: "16 oz",    weight_class: "low" },

  // Candy
  { id: "p073", name: "M&M's (10.7 oz)",                 category: "Candy",               kroger_price: 4.49, unit: "10.7 oz",  weight_class: "low" },
  { id: "p074", name: "Snickers Bar (6-pack)",           category: "Candy",               kroger_price: 5.99, unit: "6-pack",   weight_class: "low" },

  // Beverages
  { id: "p080", name: "Bottled Water (24-pack)",         category: "Beverages",           kroger_price: 4.99, unit: "24-pack",  weight_class: "standard" },
  { id: "p081", name: "Coca-Cola (12-pack cans)",        category: "Beverages",           kroger_price: 7.99, unit: "12-pack",  weight_class: "low" },
  { id: "p082", name: "Coffee, Ground (28 oz)",          category: "Beverages",           kroger_price: 8.99, unit: "28 oz",    weight_class: "standard" },

  // Deli
  { id: "p090", name: "Deli Turkey Breast (per lb)",     category: "Deli",                kroger_price: 7.99, unit: "lb",       weight_class: "standard" },
  { id: "p091", name: "Deli Ham (per lb)",               category: "Deli",                kroger_price: 6.99, unit: "lb",       weight_class: "standard" },
  { id: "p092", name: "Provolone Cheese Sliced (per lb)",category: "Deli",                kroger_price: 8.49, unit: "lb",       weight_class: "standard" },

  // Baking
  { id: "p100", name: "All-Purpose Flour (5 lb)",        category: "Baking",              kroger_price: 3.99, unit: "5 lb",     weight_class: "standard" },
  { id: "p101", name: "Granulated Sugar (4 lb)",         category: "Baking",              kroger_price: 3.49, unit: "4 lb",     weight_class: "standard" },
  { id: "p102", name: "Baking Powder (8 oz)",            category: "Baking",              kroger_price: 2.49, unit: "8 oz",     weight_class: "low" },
  { id: "p103", name: "Vanilla Extract (2 oz)",          category: "Baking",              kroger_price: 3.99, unit: "2 oz",     weight_class: "low" },

  // Spices & Seasonings
  { id: "p110", name: "Black Pepper (3 oz)",             category: "Spices & Seasonings", kroger_price: 3.49, unit: "3 oz",     weight_class: "low" },
  { id: "p111", name: "Table Salt (26 oz)",              category: "Spices & Seasonings", kroger_price: 1.29, unit: "26 oz",    weight_class: "low" },
  { id: "p112", name: "Garlic Powder (3.12 oz)",         category: "Spices & Seasonings", kroger_price: 2.99, unit: "3.12 oz",  weight_class: "low" },
  { id: "p113", name: "Onion Powder (2.62 oz)",          category: "Spices & Seasonings", kroger_price: 2.79, unit: "2.62 oz",  weight_class: "low" },
  { id: "p114", name: "Paprika (2.5 oz)",                category: "Spices & Seasonings", kroger_price: 2.99, unit: "2.5 oz",   weight_class: "low" },
  { id: "p115", name: "Cumin Ground (2.1 oz)",           category: "Spices & Seasonings", kroger_price: 2.99, unit: "2.1 oz",   weight_class: "low" },
  { id: "p116", name: "Chili Powder (2.5 oz)",           category: "Spices & Seasonings", kroger_price: 2.79, unit: "2.5 oz",   weight_class: "low" },
  { id: "p117", name: "Italian Seasoning (0.75 oz)",     category: "Spices & Seasonings", kroger_price: 2.49, unit: "0.75 oz",  weight_class: "low" },
  { id: "p118", name: "Cinnamon Ground (2.37 oz)",       category: "Spices & Seasonings", kroger_price: 2.99, unit: "2.37 oz",  weight_class: "low" },
  { id: "p119", name: "Red Pepper Flakes (1.5 oz)",      category: "Spices & Seasonings", kroger_price: 2.49, unit: "1.5 oz",   weight_class: "low" },
  // Global Cuisine
  { id: "p120", name: "Soy Sauce (10 oz)",               category: "Global Cuisine",      kroger_price: 2.99, unit: "10 oz",    weight_class: "standard" },
  { id: "p121", name: "Coconut Milk (13.5 oz can)",       category: "Global Cuisine",      kroger_price: 1.99, unit: "13.5 oz",  weight_class: "standard" },
  { id: "p122", name: "Salsa (16 oz)",                    category: "Global Cuisine",      kroger_price: 3.49, unit: "16 oz",    weight_class: "standard" },
  { id: "p123", name: "Curry Paste (4 oz)",               category: "Global Cuisine",      kroger_price: 3.99, unit: "4 oz",     weight_class: "low" },
  { id: "p124", name: "Hummus (10 oz)",                   category: "Global Cuisine",      kroger_price: 3.99, unit: "10 oz",    weight_class: "standard" },
  { id: "p125", name: "Sriracha Hot Sauce (17 oz)",       category: "Global Cuisine",      kroger_price: 4.49, unit: "17 oz",    weight_class: "low" },
  { id: "p126", name: "Taco Shells (4.6 oz)",             category: "Global Cuisine",      kroger_price: 2.99, unit: "4.6 oz",   weight_class: "standard" },
  { id: "p127", name: "Enchilada Sauce (10 oz can)",      category: "Global Cuisine",      kroger_price: 1.99, unit: "10 oz",    weight_class: "standard" },

  // Alcohol
  { id: "p130", name: "Budweiser Beer (6-pack cans)",     category: "Alcohol",             kroger_price: 8.99, unit: "6-pack",   weight_class: "low" },
  { id: "p131", name: "Coors Light (12-pack cans)",       category: "Alcohol",             kroger_price: 14.99, unit: "12-pack", weight_class: "low" },
  { id: "p132", name: "Cabernet Sauvignon Wine (750ml)",  category: "Alcohol",             kroger_price: 12.99, unit: "750ml",   weight_class: "low" },
  { id: "p133", name: "Chardonnay Wine (750ml)",          category: "Alcohol",             kroger_price: 11.99, unit: "750ml",   weight_class: "low" },
  { id: "p134", name: "Tequila (750ml)",                  category: "Alcohol",             kroger_price: 24.99, unit: "750ml",   weight_class: "low" },
  { id: "p135", name: "Vodka (750ml)",                    category: "Alcohol",             kroger_price: 19.99, unit: "750ml",   weight_class: "low" },

];

export const CATEGORIES = [
  { value: "all",                  label: "All" },
  { value: "Dairy & Eggs",         label: "Dairy & Eggs" },
  { value: "Meat & Seafood",       label: "Meat & Seafood" },
  { value: "Fresh Produce",        label: "Fresh Produce" },
  { value: "Bakery & Bread",       label: "Bakery & Bread" },
  { value: "Pantry",               label: "Pantry" },
  { value: "Frozen",               label: "Frozen" },
  { value: "Breakfast & Cereal",   label: "Breakfast & Cereal" },
  { value: "Snacks",               label: "Snacks" },
  { value: "Candy",                label: "Candy" },
  { value: "Beverages",            label: "Beverages" },
  { value: "Deli",                 label: "Deli" },
  { value: "Baking",               label: "Baking" },
  { value: "Spices & Seasonings",  label: "Spices & Seasonings" },
  { value: "Global Cuisine",        label: "Global Cuisine" },
  { value: "Alcohol",               label: "Alcohol" },
];
