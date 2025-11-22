

import { CategoryEnum, Product } from './types';

// MAPS INTEGRATION REMOVED - No API Key required
export const STORE_LOCATION = {
  lat: 30.0444, 
  lng: 31.2357
};

export const CATEGORY_IMAGES: Record<string, string> = {
  [CategoryEnum.GIFTS]: '/products/gift_velvet_box_red.jpg',
  [CategoryEnum.KITCHEN_TOOLS]: '/products/kit_bamboo_boards.jpg',
  [CategoryEnum.BIRTHDAY_PARTY]: '/products/bday_banner_gold.jpg',
  [CategoryEnum.BALLOONS_HELIUM]: '/products/bal_number_1_silver.jpg',
  [CategoryEnum.CUPS_PLATES]: '/products/cup_paper_goldrim.jpg',
  [CategoryEnum.BAGS_PACKAGING]: '/products/bag_kraft_small.jpg',
  [CategoryEnum.CAFE_SUPPLIES]: '/products/cafe_cup_ripple.jpg',
  [CategoryEnum.KIDS_TOYS]: '/products/kid_cube_keychain.jpg',
  [CategoryEnum.HALLOWEEN]: '/products/hal_pumpkin_bucket.jpg',
  [CategoryEnum.PACKAGING_MATERIALS]: '/products/pack_honeycomb.jpg',
};

export const MOCK_PRODUCTS: Product[] = [
  // 1. GIFTS
  {
    id: 'GIFT-001',
    name: 'Velvet Jewelry Box (Red)',
    nameAr: 'صندوق مجوهرات مخملي (أحمر)',
    description: 'Premium red velvet jewelry box with soft interior lining. Ideal for rings and earrings.',
    descriptionAr: 'صندوق مجوهرات مخملي أحمر فاخر ببطانة داخلية ناعمة. مثالي للخواتم والأقراط.',
    category: CategoryEnum.GIFTS,
    price: 150,
    stock: 45,
    image: '/products/gift_velvet_box_red.jpg',
    imagePath: 'gift_velvet_box_red.jpg',
    isCustomizable: false,
    rating: 4.8
  },
  {
    id: 'GIFT-002',
    name: 'Ceramic Mug "Good Vibes"',
    nameAr: 'كوب سيراميك "طاقة إيجابية"',
    description: "White ceramic coffee mug with 'Good Vibes' gold typography. Microwave safe.",
    descriptionAr: 'كوب قهوة سيراميك أبيض بعبارة "Good Vibes" ذهبية. آمن للاستخدام في الميكروويف.',
    category: CategoryEnum.GIFTS,
    price: 120,
    stock: 80,
    image: '/products/gift_mug_good_vibes.jpg',
    imagePath: 'gift_mug_good_vibes.jpg',
    isCustomizable: false,
    rating: 4.7
  },
  {
    id: 'GIFT-003',
    name: 'Aromatic Reed Diffuser (Jasmine)',
    nameAr: 'فواحة أعواد عطرية (ياسمين)',
    description: 'Glass diffuser bottle with natural reeds and jasmine essential oil. Long-lasting scent.',
    descriptionAr: 'زجاجة فواحة مع أعواد طبيعية وزيت الياسمين العطري. رائحة تدوم طويلاً.',
    category: CategoryEnum.GIFTS,
    price: 250,
    stock: 30,
    image: '/products/gift_diffuser_jasmine.jpg',
    imagePath: 'gift_diffuser_jasmine.jpg',
    isCustomizable: false,
    rating: 4.9
  },

  // 2. KITCHEN TOOLS
  {
    id: 'KIT-001',
    name: 'Bamboo Cutting Board Set',
    nameAr: 'طقم ألواح تقطيع خيزران',
    description: 'Set of 3 bamboo cutting boards in various sizes. Durable and eco-friendly.',
    descriptionAr: 'طقم مكون من 3 ألواح تقطيع خيزران بأحجام مختلفة. متينة وصديقة للبيئة.',
    category: CategoryEnum.KITCHEN_TOOLS,
    price: 450,
    stock: 25,
    image: '/products/kit_bamboo_boards.jpg',
    imagePath: 'kit_bamboo_boards.jpg',
    isCustomizable: false,
    rating: 4.6
  },
  {
    id: 'KIT-002',
    name: 'Silicone Baking Mat',
    nameAr: 'حصيرة خبز سيليكون',
    description: 'Non-stick silicone baking mat for oven use. Reusable and easy to clean.',
    descriptionAr: 'حصيرة خبز سيليكون غير لاصقة للاستخدام في الفرن. قابلة لإعادة الاستخدام وسهلة التنظيف.',
    category: CategoryEnum.KITCHEN_TOOLS,
    price: 180,
    stock: 60,
    image: '/products/kit_silicone_mat.jpg',
    imagePath: 'kit_silicone_mat.jpg',
    isCustomizable: false,
    rating: 4.5
  },

  // 3. BIRTHDAY & PARTY
  {
    id: 'BDAY-001',
    name: 'Happy Birthday Gold Banner',
    nameAr: 'لافتة "عيد ميلاد سعيد" ذهبية',
    description: 'Metallic gold cardboard letters strung on a ribbon. 2 meters length.',
    descriptionAr: 'حروف كرتونية ذهبية لامعة معلقة على شريط. طول 2 متر.',
    category: CategoryEnum.BIRTHDAY_PARTY,
    price: 85,
    stock: 150,
    image: '/products/bday_banner_gold.jpg',
    imagePath: 'bday_banner_gold.jpg',
    isCustomizable: false,
    rating: 4.8
  },
  {
    id: 'BDAY-002',
    name: 'Colorful Party Blowouts (12pk)',
    nameAr: 'صفارات حفلات ملونة (12 قطعة)',
    description: 'Pack of 12 colorful paper blowouts for parties. Safe for kids.',
    descriptionAr: 'عبوة من 12 صفارة ورقية ملونة للحفلات. آمنة للأطفال.',
    category: CategoryEnum.BIRTHDAY_PARTY,
    price: 50,
    stock: 300,
    image: '/products/bday_blowouts.jpg',
    imagePath: 'bday_blowouts.jpg',
    isCustomizable: false,
    rating: 4.4
  },
  {
    id: 'BDAY-003',
    name: 'LED Party Glasses (Neon)',
    nameAr: 'نظارات حفلات مضيئة (نيون)',
    description: 'Plastic glasses with neon LED lights. Battery included. Assorted colors.',
    descriptionAr: 'نظارات بلاستيكية مع أضواء نيون LED. البطارية مشمولة. ألوان متنوعة.',
    category: CategoryEnum.BIRTHDAY_PARTY,
    price: 95,
    stock: 100,
    image: '/products/bday_led_glasses.jpg',
    imagePath: 'bday_led_glasses.jpg',
    isCustomizable: false,
    rating: 4.7
  },

  // 4. BALLOONS & HELIUM
  {
    id: 'BAL-001',
    name: 'Rose Gold Confetti Balloons (10pk)',
    nameAr: 'بالونات قصاصات روز جولد (10 قطعة)',
    description: 'Clear latex balloons filled with rose gold foil confetti. 12 inches.',
    descriptionAr: 'بالونات لاتكس شفافة مملوءة بقصاصات ورق فويل روز جولد. 12 بوصة.',
    category: CategoryEnum.BALLOONS_HELIUM,
    price: 75,
    stock: 200,
    image: '/products/bal_confetti_rosegold.jpg',
    imagePath: 'bal_confetti_rosegold.jpg',
    isCustomizable: false,
    rating: 4.6
  },
  {
    id: 'BAL-002',
    name: 'Disposable Helium Tank',
    nameAr: 'أسطوانة هيليوم محمولة',
    description: 'Portable helium tank fills up to 30 standard balloons. Easy nozzle.',
    descriptionAr: 'أسطوانة هيليوم محمولة تملأ ما يصل إلى 30 بالونة قياسية. فوهة سهلة الاستخدام.',
    category: CategoryEnum.BALLOONS_HELIUM,
    price: 1200,
    stock: 15,
    image: '/products/bal_helium_tank.jpg',
    imagePath: 'bal_helium_tank.jpg',
    isCustomizable: false,
    rating: 4.9
  },
  {
    id: 'BAL-003',
    name: 'Number Foil Balloon "1" (Silver)',
    nameAr: 'بالون قصدير رقم "1" (فضي)',
    description: 'Large silver number 1 foil balloon. 32 inches tall. Self-sealing.',
    descriptionAr: 'بالون قصدير فضي كبير رقم 1. ارتفاع 32 بوصة. ذاتي الإغلاق.',
    category: CategoryEnum.BALLOONS_HELIUM,
    price: 60,
    stock: 120,
    image: '/products/bal_number_1_silver.jpg',
    imagePath: 'bal_number_1_silver.jpg',
    isCustomizable: false,
    rating: 4.8
  },

  // 5. CUPS & PLATES
  {
    id: 'CUP-001',
    name: 'Gold Rimmed Paper Cups (20pk)',
    nameAr: 'أكواب ورقية بحافة ذهبية (20 قطعة)',
    description: 'White paper cups with elegant gold foil rim. 250ml capacity.',
    descriptionAr: 'أكواب ورقية بيضاء بحافة ذهبية أنيقة. سعة 250 مل.',
    category: CategoryEnum.CUPS_PLATES,
    price: 90,
    stock: 250,
    image: '/products/cup_paper_goldrim.jpg',
    imagePath: 'cup_paper_goldrim.jpg',
    isCustomizable: false,
    rating: 4.5
  },
  {
    id: 'CUP-002',
    name: 'Marble Design Paper Plates (Large)',
    nameAr: 'أطباق ورقية بتصميم رخامي (كبيرة)',
    description: 'Pack of 10 heavy-duty paper plates with grey marble print. 9 inches.',
    descriptionAr: 'عبوة من 10 أطباق ورقية قوية التحمل بطبعة رخامية رمادية. 9 بوصات.',
    category: CategoryEnum.CUPS_PLATES,
    price: 110,
    stock: 180,
    image: '/products/cup_plate_marble.jpg',
    imagePath: 'cup_plate_marble.jpg',
    isCustomizable: false,
    rating: 4.6
  },
  {
    id: 'CUP-003',
    name: 'Eco-Friendly Wooden Cutlery Set',
    nameAr: 'طقم أدوات مائدة خشبية',
    description: 'Biodegradable wooden forks, spoons, and knives. Pack of 24.',
    descriptionAr: 'شوك وملاعق وسكاكين خشبية قابلة للتحلل. عبوة من 24 قطعة.',
    category: CategoryEnum.CUPS_PLATES,
    price: 70,
    stock: 300,
    image: '/products/cup_wood_cutlery.jpg',
    imagePath: 'cup_wood_cutlery.jpg',
    isCustomizable: false,
    rating: 4.7
  },

  // 6. BAGS & PACKAGING
  {
    id: 'BAG-001',
    name: 'Kraft Gift Bags (Small)',
    nameAr: 'أكياس هدايا كرافت (صغيرة)',
    description: 'Brown kraft paper bags with twisted handles. Pack of 50.',
    descriptionAr: 'أكياس ورق كرافت بني مع مقابض ملتوية. عبوة من 50 قطعة.',
    category: CategoryEnum.BAGS_PACKAGING,
    price: 200,
    stock: 100,
    image: '/products/bag_kraft_small.jpg',
    imagePath: 'bag_kraft_small.jpg',
    isCustomizable: false,
    rating: 4.5
  },
  {
    id: 'BAG-002',
    name: 'White Organza Pouches (50pk)',
    nameAr: 'أكياس أورجانزا بيضاء (50 قطعة)',
    description: 'Sheer white organza bags with drawstring. 10x15cm. Perfect for favors.',
    descriptionAr: 'أكياس أورجانزا بيضاء شفافة مع رباط. 10x15 سم. مثالية للتوزيعات.',
    category: CategoryEnum.BAGS_PACKAGING,
    price: 150,
    stock: 500,
    image: '/products/bag_organza_white.jpg',
    imagePath: 'bag_organza_white.jpg',
    isCustomizable: false,
    rating: 4.8
  },
  {
    id: 'BAG-003',
    name: 'Holographic Ziplock Bags',
    nameAr: 'أكياس بسحاب هولوغرافيك',
    description: 'Resealable holographic pouches. Smell-proof and water-resistant. 20pk.',
    descriptionAr: 'أكياس هولوغرافيك قابلة لإعادة الغلق. مانعة للرائحة ومقاومة للماء. 20 قطعة.',
    category: CategoryEnum.BAGS_PACKAGING,
    price: 85,
    stock: 200,
    image: '/products/bag_holo_zip.jpg',
    imagePath: 'bag_holo_zip.jpg',
    isCustomizable: false,
    rating: 4.9
  },

  // 7. CAFE SUPPLIES
  {
    id: 'CAFE-001',
    name: 'Double Wall Coffee Cups (12oz)',
    nameAr: 'أكواب قهوة مزدوجة الجدار (12 أونصة)',
    description: 'Insulated paper cups for hot drinks. Black ripple design. 50pk.',
    descriptionAr: 'أكواب ورقية معزولة للمشروبات الساخنة. تصميم مموج أسود. 50 قطعة.',
    category: CategoryEnum.CAFE_SUPPLIES,
    price: 250,
    stock: 80,
    image: '/products/cafe_cup_ripple.jpg',
    imagePath: 'cafe_cup_ripple.jpg',
    isCustomizable: false,
    rating: 4.7
  },
  {
    id: 'CAFE-002',
    name: 'Black Plastic Straws (500pk)',
    nameAr: 'شفاطات بلاستيكية سوداء (500 قطعة)',
    description: 'Standard black drinking straws. Individually wrapped. 500 pieces.',
    descriptionAr: 'شفاطات شرب سوداء قياسية. مغلفة بشكل فردي. 500 قطعة.',
    category: CategoryEnum.CAFE_SUPPLIES,
    price: 120,
    stock: 150,
    image: '/products/cafe_straws_black.jpg',
    imagePath: 'cafe_straws_black.jpg',
    isCustomizable: false,
    rating: 4.4
  },

  // 8. KIDS TOYS
  {
    id: 'KID-001',
    name: "Mini Rubik's Cube Keychains",
    nameAr: 'ميداليات مكعب روبيك صغير',
    description: 'Pack of 12 mini puzzle cubes on keychains. Great party favors.',
    descriptionAr: 'عبوة من 12 مكعب ألغاز صغير في ميداليات. رائعة كهدايا للحفلات.',
    category: CategoryEnum.KIDS_TOYS,
    price: 180,
    stock: 60,
    image: '/products/kid_cube_keychain.jpg',
    imagePath: 'kid_cube_keychain.jpg',
    isCustomizable: false,
    rating: 4.6
  },
  {
    id: 'KID-002',
    name: 'Bouncy Balls Mix (20pk)',
    nameAr: 'كرات نطاطة متنوعة (20 قطعة)',
    description: 'High-bounce rubber balls in assorted neon colors. 27mm.',
    descriptionAr: 'كرات مطاطية عالية الارتداد بألوان نيون متنوعة. 27 مم.',
    category: CategoryEnum.KIDS_TOYS,
    price: 60,
    stock: 400,
    image: '/products/kid_bouncy_balls.jpg',
    imagePath: 'kid_bouncy_balls.jpg',
    isCustomizable: false,
    rating: 4.5
  },

  // 9. HALLOWEEN
  {
    id: 'HAL-001',
    name: 'Plastic Pumpkin Bucket',
    nameAr: 'دلو يقطين بلاستيكي',
    description: 'Classic orange pumpkin pail with black handle for trick-or-treating.',
    descriptionAr: 'دلو يقطين برتقالي كلاسيكي بمقبض أسود لجمع الحلوى.',
    category: CategoryEnum.HALLOWEEN,
    price: 45,
    stock: 120,
    image: '/products/hal_pumpkin_bucket.jpg',
    imagePath: 'hal_pumpkin_bucket.jpg',
    isCustomizable: false,
    rating: 4.7
  },
  {
    id: 'HAL-002',
    name: 'Spooky Spider Web Decoration',
    nameAr: 'زينة شبكة عنكبوت مرعبة',
    description: 'Stretchy white spider web with 2 plastic spiders included.',
    descriptionAr: 'شبكة عنكبوت بيضاء قابلة للتمدد مع 2 عنكبوت بلاستيكي.',
    category: CategoryEnum.HALLOWEEN,
    price: 35,
    stock: 200,
    image: '/products/hal_spider_web.jpg',
    imagePath: 'hal_spider_web.jpg',
    isCustomizable: false,
    rating: 4.3
  },

  // 10. PACKAGING MATERIALS
  {
    id: 'PACK-001',
    name: 'Honeycomb Packing Paper Roll',
    nameAr: 'لفة ورق تغليف خلية النحل',
    description: 'Eco-friendly protective wrapping paper. 30cm x 50m roll.',
    descriptionAr: 'ورق تغليف واقي صديق للبيئة. لفة 30 سم × 50 م.',
    category: CategoryEnum.PACKAGING_MATERIALS,
    price: 220,
    stock: 40,
    image: '/products/pack_honeycomb.jpg',
    imagePath: 'pack_honeycomb.jpg',
    isCustomizable: false,
    rating: 4.8
  },
  {
    id: 'PACK-002',
    name: 'Corrugated Shipping Box (Medium)',
    nameAr: 'صندوق شحن مضلع (متوسط)',
    description: 'Brown cardboard shipping boxes. 30x20x10cm. Pack of 10.',
    descriptionAr: 'صناديق شحن كرتون بني. 30x20x10 سم. عبوة من 10 قطع.',
    category: CategoryEnum.PACKAGING_MATERIALS,
    price: 140,
    stock: 90,
    image: '/products/pack_box_medium.jpg',
    imagePath: 'pack_box_medium.jpg',
    isCustomizable: false,
    rating: 4.6
  },
];
