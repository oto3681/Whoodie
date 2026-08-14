import { 
  Product, 
  CustomerReview, 
  Order, 
  WordPressSettings, 
  CustomerInquiry, 
  WhatsAppChatThread, 
  BotRule, 
  AdminNotification,
  ZohoQuotation,
  ZohoSettings
} from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Roll-up banner (large base @8500 and light base @6500)
  {
    id: 'prod-rollup-banner',
    name: 'Roll-Up Banner Printing (Light & Large Heavy Base)',
    category: 'Banners & Stickers',
    price: 6500,
    priceDisplay: 'KSh 6,500 (Light) / KSh 8,500 (Large)',
    originalPrice: 9000,
    rating: 4.9,
    reviewCount: 310,
    image: '/assets/images/rollup_banner_8500_1785222380932.jpg',
    description: 'High resolution retractable roll-up display banner printed on anti-curl media. Choose between light aluminum base (KSh 6,500) or large heavy-duty base (KSh 8,500). Includes padded carrying case.',
    features: [
      'Light Base Version @ KSh 6,500',
      'Large Heavy Duty Base @ KSh 8,500',
      'Anti-Curl Waterproof Satin PVC',
      'Padded Canvas Carrying Bag Included'
    ],
    stockCount: 120,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      finishes: ['Light Base (@ KSh 6,500)', 'Large Heavy Base (@ KSh 8,500)'],
      minQuantity: 1,
    }
  },

  // 2. Tear-drop banner (Ask for quote through the inquiry whatsapp number)
  {
    id: 'prod-teardrop-banner',
    name: 'Tear-Drop Banner Branding & Flag Hardware',
    category: 'Banners & Stickers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 145,
    image: '/assets/images/teardrop_banner_white_1785246922568.jpg',
    description: 'Outdoor windproof teardrop promotional flag banners with double-sided sublimated printing, flexible carbon fibre poles, and spike/cross bases.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Wind Resistant Double-Sided Fabric',
      'Choice of Cross Base or Ground Spike',
      'Available in 2.8m, 3.4m, 4.5m Heights'
    ],
    stockCount: 200,
    customizationOptions: {
      sizes: ['2.8 Meters', '3.4 Meters', '4.5 Meters'],
      finishes: ['Single Sided Print', 'Double Sided Blockout Fabric'],
      minQuantity: 1,
    }
  },

  // 3. Round neck T-shirt printing @550
  {
    id: 'prod-roundneck-tshirt',
    name: 'Custom Branded Round Neck T-Shirt @ KSh 550',
    category: 'Printed T-Shirts',
    price: 550,
    originalPrice: 750,
    rating: 4.9,
    reviewCount: 228,
    image: '/assets/images/roundneck_tshirt_white_1785246799771.jpg',
    description: '100% premium combed cotton round neck t-shirts printed with vibrant screen printing, DTG full-color print, or heat transfer logo.',
    features: [
      '100% Combed Cotton 180GSM',
      'KSh 550 per piece',
      'Full Color Chest / Back Printing',
      'XS to 3XL Sizes Available'
    ],
    stockCount: 500,
    isFlashDeal: true,
    customizationOptions: {
      sizes: ['Small', 'Medium', 'Large', 'XL', '2XL', '3XL'],
      finishes: ['Screen Printing', 'DTG Print', 'Embroidery Logo'],
      minQuantity: 1,
    }
  },

  // 4. Polo neck T-shirt printing @850
  {
    id: 'prod-poloneck-tshirt',
    name: 'Corporate Executive Polo Shirts @ KSh 850',
    category: 'Printed T-Shirts',
    price: 850,
    originalPrice: 1200,
    rating: 4.8,
    reviewCount: 164,
    image: '/assets/images/executive_polo_white_1785246660138.jpg',
    description: 'Heavy duty pique cotton corporate polo shirts tailored for company staff uniforms, exhibitions, and promotional events.',
    features: [
      'Heavyweight Pique Cotton Fabric',
      'KSh 850 per piece',
      'Chest Logo Embroidery / Screen Print',
      'Wrinkle & Shrink Resistant'
    ],
    stockCount: 350,
    customizationOptions: {
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      finishes: ['Chest Embroidery', 'Screen Print Logo'],
      minQuantity: 1,
    }
  },

  // 5. Funeral program printing&design (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-funeral-program',
    name: 'Funeral Program Printing & Design',
    category: 'Eulogies & Memorials',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 320,
    image: '/assets/images/funeral_program_express_1786096486661.jpg',
    description: 'Respectful, beautifully formatted eulogy booklets, funeral order-of-service programs, and memorial tributes with fast printing & countrywide delivery.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Fast Turnaround & Quality Print',
      '300GSM Gloss Cover + 150GSM Inner',
      '4, 8, 12 or 16 Page Booklet Layouts'
    ],
    stockCount: 999,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['4 Pages (A4 Folded)', '8 Pages Full Booklet', '12 Pages Extended Tribute', '16 Pages Deluxe Booklet'],
      finishes: ['High Gloss Laminated Cover', 'Gold Foil Stamping Cover'],
      minQuantity: 1,
    }
  },

  // 6. Flyers (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-flyers',
    name: 'Flyers Printing & Graphic Design',
    category: 'Flyers & Posters',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 195,
    image: '/assets/images/flyers_printing_a5_1786096505695.jpg',
    description: 'Full color single or double-sided A5, A6, and DL promotional marketing flyers on 150GSM - 300GSM art paper with glossy or matte lamination.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Full Color Offset / Digital Print',
      'A5, A6, DL or Custom Dimensions',
      'Express Same-Day Printing Available'
    ],
    stockCount: 999,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['A5 Size (148x210mm)', 'A6 Size (105x148mm)', 'DL Size (99x210mm)'],
      finishes: ['Single-Sided Print', 'Double-Sided Full Color'],
      minQuantity: 100,
    }
  },

  // 7. Stickers (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-stickers',
    name: 'Custom Product Stickers & Labels',
    category: 'Banners & Stickers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 280,
    image: '/assets/images/stickers_labels_vinyl_1786096514817.jpg',
    description: '100% waterproof vinyl die-cut stickers, jar labels, packaging seals, and clear transparent product labels tailored to any shape or size.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      '100% Waterproof & Scratch Resistant',
      'High Gloss, Matte or Holographic Finish',
      'Custom Die-Cut Any Shape'
    ],
    stockCount: 800,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['5cm x 5cm', '7cm x 7cm', '10cm x 10cm', 'Custom Dimension'],
      finishes: ['Gloss Vinyl', 'Matte Waterproof', 'Transparent / Clear', 'Holographic'],
      minQuantity: 50,
    }
  },

  // 7b. Vinyl Cutting (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-vinyl-cutting',
    name: 'Precision Vinyl Cutting & Decal Plotting',
    category: 'Banners & Stickers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 195,
    image: '/assets/images/vinyl_cutting_plotter_1785478250327.jpg',
    description: 'Computer-controlled high precision vinyl cutting plotter services for custom decals, vehicle graphics, wall art, window frostings, and heat transfer apparel vinyl.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Computerized High-Precision Plotter Cutting',
      'Vehicle Decals & Window Graphics',
      'Heat Transfer Vinyl (HTV) & Wall Stickers'
    ],
    stockCount: 500,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['Small (Up to 30cm)', 'Medium (Up to 60cm)', 'Large (Up to 120cm)', 'Custom Roll Length'],
      finishes: ['Plotter Cut Matte Vinyl', 'Gloss Cut-Out Vinyl', 'Reflective Safety Vinyl', 'Heat Transfer Apparel Vinyl'],
      minQuantity: 1,
    }
  },

  // 8. Wedding cards (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-wedding-cards',
    name: 'Wedding Invitation Cards & Stationeries',
    category: 'Flyers & Posters',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 110,
    image: '/assets/images/wedding_invitation_cards_1786096524464.jpg',
    description: 'Bespoke luxury wedding invitation cards featuring metallic gold foil stamping, laser-cut lace sleeves, textured cardstock, and wax seal stamps.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Gold / Silver Foil Stamping',
      'Laser-Cut Sleeves & Envelopes',
      'Custom Monograms & Wax Seals'
    ],
    stockCount: 400,
    customizationOptions: {
      finishes: ['Gold Foil + Textured Card', 'Laser Cut Sleeve', 'Wax Seal Stamp Envelope'],
      minQuantity: 30,
    }
  },

  // 8b. Executive Business Cards (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-business-cards',
    name: 'Executive Business Cards & Premium Stationeries',
    category: 'Flyers & Posters',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 240,
    image: '/assets/images/executive_business_cards_1785478450280.jpg',
    description: 'High-impact premium executive business cards printed on thick cardstock with options for gold/silver metallic foil stamping, velvet matte lamination, spot UV, and 3D raised print finish.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Heavy 350gsm - 600gsm Luxury Cardstock',
      'Velvet Soft-Touch & Spot UV Finishes',
      'Metallic Foil Stamping & Embossing'
    ],
    stockCount: 1000,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['Standard (3.5" x 2.0")', 'European (85mm x 55mm)', 'Square (2.5" x 2.5")', 'Custom Die-Cut'],
      finishes: ['350gsm Velvet Matte Lamination', 'Gloss Lamination + Gold Foil', 'Spot UV + Embossed 3D Finish', '600gsm Cotton Luxe Cardstock'],
      minQuantity: 100,
    }
  },

  // 9. Water bottle branding (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-waterbottle-branding',
    name: 'Water Bottle Branding & Flask Printing',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 92,
    image: '/assets/images/water_bottle_branding_1786096534054.jpg',
    description: 'Personalized corporate stainless steel vacuum thermal flasks, sports aluminum water bottles, and promotional bottled water labels.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Laser Engraving / UV Printing',
      'BPA-Free Stainless Steel & Aluminum',
      'Ideal for Corporate Gifts & Fitness'
    ],
    stockCount: 300,
    customizationOptions: {
      finishes: ['Laser Engraved Logo', 'Full Color UV Print', 'Wrap Sticker Label'],
      minQuantity: 10,
    }
  },

  // 10. Normal Mug branding @350
  {
    id: 'prod-normal-mug',
    name: 'Normal Mug Branding @ KSh 350',
    category: 'Branding & Signage',
    price: 350,
    originalPrice: 500,
    rating: 4.9,
    reviewCount: 245,
    image: '/assets/images/normal_white_mug_1786096548095.jpg',
    description: 'High quality 11oz white ceramic coffee mug custom sublimation printed with your photo, corporate logo, or customized message.',
    features: [
      '11oz Premium White Ceramic',
      'KSh 350 per mug',
      'Dishwasher & Microwave Safe Print',
      'Full Wrap Color Sublimation'
    ],
    stockCount: 600,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      finishes: ['Full Wrap Sublimation', 'Single Side Logo', 'Two Sided Print'],
      minQuantity: 1,
    }
  },

  // 11. Magic Mug branding @650
  {
    id: 'prod-magic-mug',
    name: 'Magic Mug Branding @ KSh 650',
    category: 'Branding & Signage',
    price: 650,
    originalPrice: 900,
    rating: 5.0,
    reviewCount: 188,
    image: '/assets/images/magic_mug_color_change_1786096556926.jpg',
    description: 'Heat-sensitive color changing ceramic magic mug. Appears pitch black when cold, and magically reveals your custom photo or logo when hot liquid is poured inside!',
    features: [
      'Heat-Sensitive Color Reveal',
      'KSh 650 per mug',
      'High-Gloss Magic Finish',
      'Unforgettable Gift Item'
    ],
    stockCount: 250,
    isFlashDeal: true,
    customizationOptions: {
      finishes: ['Black Magic Reveal', 'Blue Magic Reveal', 'Red Magic Reveal'],
      minQuantity: 1,
    }
  },

  // 12. Advertisement (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-advertisement',
    name: 'Advertisement & Outdoor Billboard Graphics',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 75,
    image: '/assets/images/billboard_outdoor_ad_1786096565693.jpg',
    description: 'Large format outdoor billboard skins, highway lightboxes, promotional ad boards, building wraps, and commercial campaign media.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      '510GSM Weatherproof Flex / Mesh',
      'UV Fade-Resistant Solvent Inks',
      'Professional Installation & Mounting'
    ],
    stockCount: 50,
    customizationOptions: {
      finishes: ['Flex Billboard Skin', 'Mesh Banner Building Wrap', 'Backlit Lightbox Film'],
      minQuantity: 1,
    }
  },

  // 13. Light weight reflectors @350
  {
    id: 'prod-lightweight-reflectors',
    name: 'Light Weight Reflectors @ KSh 350',
    category: 'Reflectors & Aprons',
    price: 350,
    originalPrice: 500,
    rating: 4.8,
    reviewCount: 310,
    image: '/assets/images/lightweight_reflectors_vest_1785247161011.jpg',
    description: 'Lightweight high-visibility safety reflector jacket featuring 2-inch high reflectivity tape strips and custom screen printed company logo.',
    features: [
      'KSh 350 per piece',
      'High Visibility Reflective Strips',
      'Breathable Lightweight Polyester',
      'Front & Back Screen Printing'
    ],
    stockCount: 700,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['M', 'L', 'XL', '2XL', '3XL'],
      finishes: ['Light Weight (@ KSh 350)', 'Heavy Weight (Ask for Quote)'],
      minQuantity: 1,
    }
  },

  // 13b. Custom Branded Apron (Ask for quote through inquiry number - bulk production)
  {
    id: 'prod-custom-apron-bulk',
    name: 'Custom Branded Apron (Bulk Production)',
    category: 'Reflectors & Aprons',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp Inquiry',
    rating: 4.9,
    reviewCount: 215,
    image: '/assets/images/apron_bulk_production_1786094965199.jpg',
    description: 'Custom branded kitchen, chef, and service aprons with dual front pockets and adjustable neck straps. Ask for quote through the inquiry number for bulk production. High precision screen printing, DTF, or embroidery.',
    features: [
      'Ask for quote through inquiry number (Bulk Production)',
      'Heavy-Duty Washable Cotton Twill Blend',
      'Dual Front Storage Pockets & Adjustable Strap',
      'High Precision Screen Print / Embroidery Logo Branding'
    ],
    stockCount: 600,
    isFlashDeal: true,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['Standard Adult (One Size Fits All)', 'Extra Wide Commercial'],
      finishes: ['Screen Printed Logo', 'High-Density Embroidery', 'DTF Full Color Print'],
      minQuantity: 10,
    }
  },

  // 14. Calendars (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-calendars',
    name: 'Corporate Desktop & Wall Calendars',
    category: 'Flyers & Posters',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 160,
    image: '/assets/images/calendars_desktop_wall_1786096575716.jpg',
    description: 'Custom 12-month wire-o bound desktop tent calendars, shipping calendars, and A2 / A3 corporate wall calendars tailored with your branding.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      '12-Month Custom Page Layouts',
      'Spiral / Wire-O Binding with Stand',
      'Gloss / Matte UV Varnish'
    ],
    stockCount: 500,
    customizationOptions: {
      sizes: ['Desktop Tent Calendar', 'A3 Wall Calendar', 'A2 Large Wall Calendar'],
      minQuantity: 20,
    }
  },

  // 15. Signs (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-signs',
    name: 'Signs & 3D Illuminated LED Storefront Signage',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 130,
    image: '/assets/images/signs_3d_led_storefront_1786096587846.jpg',
    description: 'Laser-cut 3D acrylic channel letter signs, backlit LED office reception signs, metallic door plaques, and outdoor directional signboards.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Laser Cut 3D Acrylic & Brushed Metal',
      'Energy-Efficient Front/Backlit LEDs',
      'Site Measurement & On-Site Installation'
    ],
    stockCount: 40,
    customizationOptions: {
      finishes: ['Backlit LED Halo Effect', '3D Front-Lit Acrylic', 'Non-Illuminated Metallic'],
      minQuantity: 1,
    }
  },

  // 16. Diaries (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-diaries',
    name: 'Executive Branded Leatherette Diaries',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 175,
    image: '/assets/images/diaries_executive_leather_1786096597781.jpg',
    description: 'Premium faux leather annual executive diaries debossed or metallic foil-stamped with company logo, year, and personalized staff names.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Foil Stamping & Blind Debossing',
      'A5 / B5 Hardcover Leatherette',
      'Ribbon Bookmark & Magnetic Clasp'
    ],
    stockCount: 300,
    customizationOptions: {
      sizes: ['A5 Executive Diary', 'B5 Large Planner'],
      finishes: ['Gold Foil Stamping', 'Silver Foil', 'Blind Debossed Logo'],
      minQuantity: 10,
    }
  },

  // 17. Note Books (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-notebooks',
    name: 'Custom Branded Hardcover Notebooks',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 140,
    image: '/assets/images/notebooks_hardcover_custom_1786096607523.jpg',
    description: 'Customized case-bound hardcover or wire spiral notebooks with elastic band closures, pen holders, and custom inner page printing.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Custom Full-Color Hardcover Cover',
      'Ruled / Grid / Blank Lined Pages',
      'Pen Loop & Elastic Band Closure'
    ],
    stockCount: 450,
    customizationOptions: {
      sizes: ['A5 Hardcover', 'A4 Conference Notebook', 'Pocket Notebook'],
      minQuantity: 20,
    }
  },

  // 18. Brochures (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-brochures',
    name: 'Corporate Brochures & Company Profiles',
    category: 'Flyers & Posters',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 210,
    image: '/assets/images/brochures_company_profile_1786096616550.jpg',
    description: 'Multi-page corporate company profile booklets, bifold & trifold glossy brochures with spot UV varnish, foil accents, and saddle stitching.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      '250GSM Cover + 150GSM Inner Art Paper',
      'Trifold, Bifold or Multi-Page Booklets',
      'Spot UV & Soft-Touch Matte Finish'
    ],
    stockCount: 500,
    expressDeliveryAvailable: true,
    customizationOptions: {
      sizes: ['A4 Trifold Brochure', 'A4 Bifold Brochure', '8-Page Company Profile Booklet'],
      minQuantity: 25,
    }
  },

  // 19. Hoodies @2500
  {
    id: 'prod-hoodies',
    name: 'Custom Heavyweight Hoodies @ KSh 2,500',
    category: 'Hoodies',
    price: 2500,
    originalPrice: 3200,
    rating: 5.0,
    reviewCount: 380,
    image: '/assets/images/hoodies_heavyweight_custom_1786096627969.jpg',
    description: 'Cozy 320GSM fleece cotton pullover hoodies with double-layer hood and kangaroo pockets. Custom screen printed, embroidered, or 3D puff print.',
    features: [
      '320 GSM Plush Fleece Cotton',
      'KSh 2,500 per hoodie',
      'Chest, Back or Sleeve Printing',
      'S to 3XL Sizes Available'
    ],
    stockCount: 200,
    isFlashDeal: true,
    customizationOptions: {
      sizes: ['Small', 'Medium', 'Large', 'XL', '2XL', '3XL'],
      finishes: ['Screen Print', '3D Puff Print', 'Embroidery Crest'],
      minQuantity: 1,
    }
  },

  // 20. Shopping bags branding (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-shopping-bags',
    name: 'Shopping Bags & Kraft Carrier Bag Branding',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 165,
    image: '/assets/images/shopping_bags_kraft_1786096636995.jpg',
    description: 'Eco-friendly non-woven tote bags, custom printed luxury glossy paper shopping bags with rope handles, and branded brown kraft gift bags.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Eco-Friendly Non-Woven / Kraft Paper',
      'Screen Printed Corporate Logo',
      'Available in Small, Medium, Large'
    ],
    stockCount: 999,
    customizationOptions: {
      sizes: ['Small Gift Bag', 'Medium Shopping Bag', 'Large Grocery Tote'],
      finishes: ['Non-Woven Fabric', 'Kraft Paper Bag', 'Gloss Laminated Paper'],
      minQuantity: 50,
    }
  },

  // 21. Umbrella branding (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-umbrella-branding',
    name: 'Umbrella Branding (Golf & Folding Umbrellas)',
    category: 'Branding & Signage',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 115,
    image: '/assets/images/umbrella_golf_branded_1786096647251.jpg',
    description: 'Heavy duty windproof double-canopy golf umbrellas, automatic folding rain umbrellas, and outdoor parasols screen printed on alternate panels.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      'Windproof Fiberglass Frame & Double Canopy',
      'Screen Printed Logo on Panels',
      'Rubberized Ergonomic Grip Handle'
    ],
    stockCount: 180,
    customizationOptions: {
      sizes: ['30-Inch Golf Umbrella', '21-Inch Folding Umbrella', 'Outdoor Parasol'],
      finishes: ['Print 2 Panels', 'Print 4 Panels', 'Full Canopy Custom Color'],
      minQuantity: 10,
    }
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    customerName: 'Kiprono M. (Apex Logistics)',
    productCategory: 'Reflectors & Aprons',
    productName: 'High-Visibility Executive Safety Vest',
    rating: 5,
    comment: 'Ordered 150 safety vests with our company logo printed on the back. Delivered promptly to our depot in Industrial Area Nairobi! Excellent quality reflective bands.',
    date: 'July 24, 2026',
    verifiedBuyer: true,
    likes: 24,
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-02',
    customerName: 'Grace Wambui',
    productCategory: 'Eulogies & Memorials',
    productName: 'Funeral Program Booklets',
    rating: 5,
    comment: 'Woodynat Designers Limited came to our rescue during a very emotional time. They designed and printed 300 eulogy booklets and delivered them straight to Nakuru before sunrise. May God bless your team.',
    date: 'July 20, 2026',
    verifiedBuyer: true,
    likes: 42,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-03',
    customerName: 'David Ochieng (Vibe Events)',
    productCategory: 'Banners & Stickers',
    productName: 'Retractable Roll-Up Banner (85cm x 200cm)',
    rating: 5,
    comment: 'The roll-up banners were extremely sharp and color accurate! The aluminum stand is strong and easy to transport in the padded case. 10/10 service!',
    date: 'July 18, 2026',
    verifiedBuyer: true,
    likes: 18,
    photoUrl: 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-04',
    customerName: 'Amina Hassan (Organic Beauty)',
    productCategory: 'Banners & Stickers',
    productName: 'Custom Waterproof Vinyl Product Die-Cut Stickers',
    rating: 5,
    comment: 'These stickers are truly waterproof! We stick them on glass cosmetic jars that get washed, and the print doesn’t peel off or bleed. Order completed via M-Pesa smoothly.',
    date: 'July 15, 2026',
    verifiedBuyer: true,
    likes: 15
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'PX-98241',
    userId: 'user-01',
    customerName: 'Kiprono M.',
    customerPhone: '+254712345678',
    customerEmail: 'kiprono@apexlogistics.co.ke',
    deliveryCity: 'Nairobi',
    deliveryAddress: 'Industrial Area, Road A, Gate 4',
    deliveryType: 'Express Home Delivery',
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Reflector
        quantity: 50,
        customization: {
          quantity: 50,
          selectedSize: 'XL',
          selectedFinish: 'Full Color Logo Print',
          instructions: 'Apex Logistics logo on chest and back in white & yellow'
        },
        calculatedPrice: 42500
      }
    ],
    subtotal: 42500,
    shippingFee: 500,
    totalAmount: 43000,
    paymentMethod: 'M-Pesa',
    paymentReference: 'QGH8923KL9',
    paymentStatus: 'Paid',
    orderStatus: 'Printing & Production',
    createdAt: '2026-07-26 09:30 AM',
    estimatedDelivery: '2026-07-27 02:00 PM',
    trackingHistory: [
      {
        status: 'Order Received',
        timestamp: 'July 26, 09:30 AM',
        completed: true,
        description: 'Order confirmed and payment received via M-Pesa.'
      },
      {
        status: 'Design Proof Approved',
        timestamp: 'July 26, 10:45 AM',
        completed: true,
        description: 'Artwork vector file verified by senior print operator.'
      },
      {
        status: 'Printing & Production',
        timestamp: 'July 26, 01:15 PM',
        completed: true,
        description: 'Screen printing on 50 safety vests currently in progress.'
      },
      {
        status: 'Quality Check',
        timestamp: 'Estimated July 26, 05:00 PM',
        completed: false,
        description: 'Quality inspection & reflective strip heat testing.'
      },
      {
        status: 'Out for Delivery',
        timestamp: 'Estimated July 27, 09:00 AM',
        completed: false,
        description: 'Assigned to courier rider for express delivery.'
      },
      {
        status: 'Delivered',
        timestamp: 'Estimated July 27, 02:00 PM',
        completed: false,
        description: 'Handed over to recipient.'
      }
    ]
  },
  {
    id: 'PX-98102',
    userId: 'user-02',
    customerName: 'Sarah Kamau',
    customerPhone: '+254722987654',
    customerEmail: 'sarah.k@gmail.com',
    deliveryCity: 'Nairobi',
    deliveryAddress: 'CBD Pick-up Station (Moi Avenue)',
    deliveryType: 'Pickup Station',
    items: [
      {
        product: INITIAL_PRODUCTS[5], // Rollup Banner
        quantity: 2,
        customization: {
          quantity: 2,
          selectedFinish: 'Standard Matte PVC',
          instructions: 'Roll-up banners for Tech Summit'
        },
        calculatedPrice: 9600
      }
    ],
    subtotal: 9600,
    shippingFee: 0,
    totalAmount: 9600,
    paymentMethod: 'M-Pesa',
    paymentReference: 'QGF7722MN1',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdAt: '2026-07-24 02:15 PM',
    estimatedDelivery: '2026-07-25 11:00 AM',
    trackingHistory: [
      { status: 'Order Received', timestamp: 'July 24, 02:15 PM', completed: true, description: 'Order submitted' },
      { status: 'Design Proof Approved', timestamp: 'July 24, 03:00 PM', completed: true, description: 'Design approved' },
      { status: 'Printing & Production', timestamp: 'July 24, 05:00 PM', completed: true, description: 'Printed' },
      { status: 'Quality Check', timestamp: 'July 24, 07:00 PM', completed: true, description: 'Quality checked' },
      { status: 'Out for Delivery', timestamp: 'July 25, 08:30 AM', completed: true, description: 'In transit' },
      { status: 'Delivered', timestamp: 'July 25, 11:00 AM', completed: true, description: 'Collected at station' }
    ]
  }
];

export const DEFAULT_WORDPRESS_SETTINGS: WordPressSettings = {
  siteTitle: 'Woodynat Designers Limited',
  tagline: 'Your Reliable Partner in Design and Branding',
  siteLogo: '',
  whatsappNumber: '0797939199',
  supportPhone: '0797939199',
  companyEmail: 'woodynatdesigners12@gmail.com',
  paybillNumber: '247247',
  paybillAccount: '0797939199',
  companyAddress: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
  companyCity: 'Nairobi',
  topBannerText: '⚡ MEGA FLASH SALE: Up to 30% OFF Custom Hoodies, T-Shirts & Banners! | M-PESA Paybill: 247247 Acc: 0797939199',
  facebookUrl: 'https://facebook.com/WoodynatDesignersLimited',
  instagramUrl: 'https://instagram.com/woodynatdesigners_14',
  tiktokUrl: 'https://tiktok.com/@woodynatdesigners_14',
  primaryColor: '#f68b1e',
  wpWooSyncEnabled: true,
  wpRestEndpoint: 'https://woodynatdesigners.co.ke/wp-json/wc/v3',
  heroHeadline: 'Woodynat Designers Limited — Premium Printing & Custom Apparel',
  heroSubheadline: 'Custom T-Shirts, Hoodies, Banners, Signage & Funeral Program Booklets. Visit us at Gatkim Complex, Nairobi or order online via Paybill 247247 (Acc: 0797939199)!',
  mpesaEnvironment: 'production',
  mpesaConsumerKey: '',
  mpesaConsumerSecret: '',
  mpesaPasskey: ''
};

export const getProductFallbackImage = (name?: string, category?: string): string => {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('apron') || c.includes('apron')) {
    return '/assets/images/apron_bulk_production_1786094965199.jpg';
  }
  if (n.includes('reflector') || n.includes('vest') || n.includes('reflective') || c.includes('reflector')) {
    return '/assets/images/lightweight_reflectors_vest_1785247161011.jpg';
  }
  if (n.includes('t-shirt') || n.includes('tshirt') || n.includes('polo') || n.includes('shirt') || c.includes('t-shirt')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('hoodie') || c.includes('hoodie')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('banner') || n.includes('flag') || n.includes('sticker') || c.includes('banner')) {
    return 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('mug') || n.includes('bottle') || n.includes('flask') || c.includes('drinkware')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('card') || n.includes('flyer') || n.includes('brochure') || n.includes('program') || c.includes('stationery') || c.includes('flyer')) {
    return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('diary') || n.includes('notebook') || n.includes('calendar') || c.includes('gift')) {
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('sign') || n.includes('billboard') || c.includes('signage')) {
    return 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80';
};

export const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq-101',
    customerName: 'Jane Wambui',
    customerPhone: '0712345678',
    customerEmail: 'jane.wambui@safcomkenya.org',
    companyName: 'Apex Logistics Kenya',
    inquiryTopic: 'Bulk Round Neck T-Shirts & Heavy Base Roll-Up Banners',
    notes: 'Needs 150 roundneck t-shirts with double-sided screen print and 4 large base roll-up banners for company AGM in Nairobi.',
    createdAt: 'August 12, 2026',
    status: 'New',
    preferredCategory: 'Printed T-Shirts',
    requestedQuantity: 150
  },
  {
    id: 'inq-102',
    customerName: 'David Ochieng',
    customerPhone: '0722998877',
    customerEmail: 'david.ochieng@kencell.co.ke',
    companyName: 'St. Jude Academy',
    inquiryTopic: 'Custom Branded Hoodies & Executive Polo Shirts',
    notes: 'Wants rate card for 80 customized navy blue fleece hoodies and 50 executive polo shirts for teachers day.',
    createdAt: 'August 11, 2026',
    status: 'Catalogue Sent',
    preferredCategory: 'Hoodies',
    requestedQuantity: 80
  },
  {
    id: 'inq-103',
    customerName: 'Mary Mwangi',
    customerPhone: '0733445566',
    customerEmail: 'mary.mwangi@gmail.com',
    companyName: 'Family Committee',
    inquiryTopic: 'Funeral & Memorial Program Booklets (24h Express)',
    notes: 'Urgent 300 copies of 8-page glossy memorial program with photo portrait. Needs 24-hour turnaround to Nakuru.',
    createdAt: 'August 13, 2026',
    status: 'New',
    preferredCategory: 'Eulogies & Memorials',
    requestedQuantity: 300
  },
  {
    id: 'inq-104',
    customerName: 'Emmanuel Kiprono',
    customerPhone: '0799112233',
    customerEmail: 'emmanuel.k@riftvalleydistributors.com',
    companyName: 'Rift Valley Distributors',
    inquiryTopic: 'Safety Reflectors, Aprons & Acrylic Signage',
    notes: 'Warehouse team safety vest branding (60 pcs) and industrial branded aprons for packaging line.',
    createdAt: 'August 10, 2026',
    status: 'Quoted',
    preferredCategory: 'Reflectors & Aprons',
    requestedQuantity: 60
  }
];

export const INITIAL_BOT_RULES: BotRule[] = [
  {
    id: 'rule-welcome',
    keyword: 'hi|hello|hey|habari|mambo|start|menu|quote',
    title: 'Main Welcome Menu & Service Catalog',
    categoryTag: 'General',
    response: `👋 Hello! Welcome to Woodynat Designers Limited (Official WhatsApp: 0797939199).
How can we assist your printing & branding project today?

Reply with a number or topic:
1️⃣ Round Neck T-Shirts & Polo Rates
2️⃣ Custom Hoodies & Fleeces
3️⃣ Roll-Up & Teardrop Banners
4️⃣ M-Pesa Paybill & Payment Info
5️⃣ Shop Location & Directions (Nairobi CBD)
6️⃣ Urgent 24h Memorial & Eulogy Booklets
7️⃣ Talk to Live Production Specialist`,
    enabled: true,
  },
  {
    id: 'rule-tshirt',
    keyword: '1|tshirt|t-shirt|t shirt|polo|round neck|shirts',
    title: 'T-Shirts & Polo Shirt Rates',
    categoryTag: 'Apparel',
    response: `👕 Woodynat T-Shirt & Polo Rate Card:
• Round Neck 100% Combed Cotton (180GSM): KSh 550 per piece (includes front print)
• Executive Pique Polo Shirts: KSh 850 per piece
• Heavy V-Neck T-Shirts: KSh 650
• Available sizes: Small to 3XL. Colors: White, Black, Navy, Red, Royal Blue, Green.
📦 Bulk discounts available for orders over 50 pieces! Would you like a formal PDF quote?`,
    enabled: true,
  },
  {
    id: 'rule-hoodie',
    keyword: '2|hoodie|hoodies|fleece|sweater|jacket',
    title: 'Custom Hoodies & Sweatshirts',
    categoryTag: 'Apparel',
    response: `🧥 Woodynat Custom Hoodies & Fleeces:
• Heavyweight Brushed Cotton Fleece Pullover (280GSM): KSh 1,800
• Zip-Up Heavy Hoodie: KSh 2,200
• Custom Class / Corporate Embroidery or Full-Color DTF Print included!
Warm, anti-shrink fabric. Turnaround 2-3 business days.`,
    enabled: true,
  },
  {
    id: 'rule-banner',
    keyword: '3|banner|banners|rollup|roll up|teardrop|flag|pull up',
    title: 'Roll-Up & Teardrop Display Banners',
    categoryTag: 'Signage & Banners',
    response: `🏁 Display & Exhibition Banners:
• Roll-Up Banner (Light Base 85x200cm): KSh 6,500
• Roll-Up Banner (Large Heavy-Duty Base): KSh 8,500
• Teardrop Promotional Flag (3.4m + Cross Base): KSh 7,500
Printed on waterproof, anti-curl satin film with padded carry bag included!`,
    enabled: true,
  },
  {
    id: 'rule-paybill',
    keyword: '4|paybill|payment|mpesa|m-pesa|account|lipa|buy goods',
    title: 'Official M-Pesa Paybill Instructions',
    categoryTag: 'Payments',
    response: `💳 Official M-Pesa Payment Details:
1. Go to Lipa na M-Pesa > Paybill
2. Business Number: 247247
3. Account Number: 0797939199
4. Business Name: Woodynat Designers Limited
Please share your M-Pesa transaction reference or screenshot once completed for immediate job scheduling!`,
    enabled: true,
  },
  {
    id: 'rule-location',
    keyword: '5|location|address|directions|shop|where|wapi|gatkim|cbd',
    title: 'Physical Shop Location & Operating Hours',
    categoryTag: 'General',
    response: `📍 Woodynat Designers Limited Location:
Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD.
⏰ Mon – Sat: 7:30 AM – 6:30 PM.
📞 Hotline / WhatsApp: 0797939199. Walk-ins and sample reviews welcome!`,
    enabled: true,
  },
  {
    id: 'rule-eulogy',
    keyword: '6|eulogy|memorial|funeral|program|programs|burial',
    title: '24-Hour Express Memorial Booklets',
    categoryTag: 'Stationery',
    response: `🕊️ Funeral & Memorial Programs (Express 24-Hour Delivery):
• 4-Page Folded Glossy (A4 folded to A5): KSh 50 - 65/pc
• 8-Page Glossy Booklet with Full-Color Portrait: KSh 90 - 120/pc
• Express same-day courier dispatch to Nakuru, Kisumu, Eldoret, Nyeri, Mombasa available.
Send photos and text via WhatsApp to 0797939199 for fast typesetting.`,
    enabled: true,
  },
  {
    id: 'rule-human',
    keyword: '7|human|agent|specialist|help|talk|person|call',
    title: 'Live Specialist Transfer',
    categoryTag: 'Support',
    response: `👨‍💼 Connecting you to a live Woodynat Senior Designer & Production Specialist. 
A team member is reviewing your chat and will respond shortly. You can also reach our direct desk at 0797939199.`,
    enabled: true,
  }
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-ord-101',
    type: 'order_placed',
    title: 'New Customer Order Placed (#PX-98241)',
    message: 'Kiprono M. placed an order for 2 items totaling KSh 12,300 via M-Pesa.',
    timestamp: 'Today, 10:24 AM',
    timeAgo: '5m ago',
    read: false,
    status: 'pending',
    referenceId: 'PX-98241',
    referenceData: {
      customerName: 'Kiprono M.',
      customerPhone: '0797939199',
      customerEmail: 'kiprono@gmail.com',
      amount: 12300,
      itemsCount: 2,
      itemsSummary: 'Roll-Up Banner Printing (Large Heavy Base x1), Custom Round Neck T-Shirt (x10)',
      deliveryCity: 'Nairobi CBD',
      deliveryType: 'Express Home Delivery',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'Paid',
      notes: 'Customer uploaded high-res vector logo. Requested 24h express turnaround.'
    }
  },
  {
    id: 'notif-inq-102',
    type: 'inquiry_submitted',
    title: 'New Commercial Quote Inquiry',
    message: 'Sarah Kimani (Apex Logistics Kenya) submitted an inquiry for 100 Printed T-Shirts & Reflectors.',
    timestamp: 'Today, 09:45 AM',
    timeAgo: '45m ago',
    read: false,
    status: 'pending',
    referenceId: 'inq-8821-450',
    referenceData: {
      customerName: 'Sarah Kimani',
      customerPhone: '0712345678',
      customerEmail: 'sarah.kimani@apexlogistics.co.ke',
      companyName: 'Apex Logistics Kenya',
      topic: 'Bulk Staff Uniforms & Heavy-Duty Safety Reflectors',
      category: 'Printed T-Shirts',
      requestedQuantity: 100,
      notes: 'Need official quote with KRA ETR compliance for upcoming staff expansion next Friday.'
    }
  },
  {
    id: 'notif-ord-103',
    type: 'order_placed',
    title: 'New Customer Order Placed (#PX-98242)',
    message: 'David Mwangi placed an order for 50 Memorial Program Booklets totaling KSh 18,500.',
    timestamp: 'Today, 08:15 AM',
    timeAgo: '2h ago',
    read: false,
    status: 'pending',
    referenceId: 'PX-98242',
    referenceData: {
      customerName: 'David Mwangi',
      customerPhone: '0722001122',
      customerEmail: 'dmwangi@gmail.com',
      amount: 18500,
      itemsCount: 1,
      itemsSummary: 'A5 Eulogy & Funeral Program Booklets (x50 copies, 12 pages gloss)',
      deliveryCity: 'Nairobi',
      deliveryType: 'Pickup Station',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'Paid',
      notes: 'Urgent memorial service on Saturday morning. Proof approval required.'
    }
  },
  {
    id: 'notif-inq-104',
    type: 'inquiry_submitted',
    title: 'New WhatsApp Quote Request',
    message: 'Faith Chebet (Bright Spark Media) requested pricing for 3D Acrylic Signage & Teardrop Flags.',
    timestamp: 'Yesterday, 04:30 PM',
    timeAgo: '1d ago',
    read: true,
    status: 'accepted',
    referenceId: 'chat-005',
    referenceData: {
      customerName: 'Faith Chebet',
      customerPhone: '0701554433',
      companyName: 'Bright Spark Media',
      topic: '3D Acrylic Signage & Teardrop Flags',
      category: 'Branding & Signage',
      notes: 'Requested sample inspection at Gatkim Complex CBD workshop.'
    },
    acceptedAt: 'Yesterday, 05:10 PM',
    acceptedBy: 'Admin',
    actionTakenNotes: 'Catalogue rate card PDF dispatched and client invited to CBD shop 4th floor Room 4B1.'
  }
];

export const INITIAL_WHATSAPP_THREADS: WhatsAppChatThread[] = [
  {
    id: 'chat-001',
    customerName: 'Jane Wambui',
    customerPhone: '0712345678',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyName: 'Apex Logistics Kenya',
    unreadCount: 1,
    lastMessage: 'Can you please send me a PDF rate card for 150 roundneck shirts and 4 large base roll-up banners?',
    lastMessageTime: '10:45 AM',
    topic: '150 T-Shirts & 4 Roll-Up Banners',
    status: 'active',
    isBotActive: true,
    messages: [
      {
        id: 'msg-01',
        sender: 'customer',
        text: 'Hi Woodynat team! We are preparing for our annual AGM in Nairobi.',
        timestamp: '10:40 AM',
        status: 'read'
      },
      {
        id: 'msg-02',
        sender: 'bot',
        text: `👋 Hello Jane! Welcome to Woodynat Designers Limited (Official WhatsApp: 0797939199). How can we assist with your company AGM?`,
        timestamp: '10:40 AM',
        status: 'read'
      },
      {
        id: 'msg-03',
        sender: 'customer',
        text: 'Can you please send me a PDF rate card for 150 roundneck shirts and 4 large base roll-up banners?',
        timestamp: '10:45 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'chat-002',
    customerName: 'David Ochieng',
    customerPhone: '0722998877',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyName: 'St. Jude Academy',
    unreadCount: 0,
    lastMessage: 'Thank you! We received the quotation. Will approve the sample design by 2 PM.',
    lastMessageTime: '09:20 AM',
    topic: '80 Branded Fleece Hoodies & 50 Polos',
    status: 'quoted',
    isBotActive: false,
    messages: [
      {
        id: 'msg-11',
        sender: 'customer',
        text: 'Hello, what are your rates for 80 customized navy blue fleece hoodies for teachers day?',
        timestamp: '08:50 AM',
        status: 'read'
      },
      {
        id: 'msg-12',
        sender: 'bot',
        text: `🧥 Woodynat Custom Hoodies: Heavyweight Brushed Cotton Fleece Pullover (280GSM) is KSh 1,800/pc. For 80 pcs, we offer a special rate of KSh 1,650/pc with school logo embroidery!`,
        timestamp: '08:50 AM',
        status: 'read'
      },
      {
        id: 'msg-13',
        sender: 'agent',
        text: 'Hi David! I have attached our formal quotation for 80 hoodies and 50 executive polo shirts. Note that delivery fee depends on the type of the product and the distance.',
        timestamp: '09:05 AM',
        status: 'read',
        attachmentType: 'quote',
        attachmentData: {
          productName: '80 Hoodies + 50 Polos Rate Card',
          amount: 174500,
          paybill: '247247',
          account: '0797939199'
        }
      },
      {
        id: 'msg-14',
        sender: 'customer',
        text: 'Thank you! We received the quotation. Will approve the sample design by 2 PM.',
        timestamp: '09:20 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-003',
    customerName: 'Mary Mwangi',
    customerPhone: '0733445566',
    customerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    companyName: 'Family Committee',
    unreadCount: 2,
    lastMessage: 'We need 300 copies of 8-page glossy memorial program. Can you deliver to Nakuru by tomorrow evening?',
    lastMessageTime: '11:15 AM',
    topic: '24h Urgent Memorial Program Booklets (300 pcs)',
    status: 'active',
    isBotActive: true,
    messages: [
      {
        id: 'msg-21',
        sender: 'customer',
        text: 'Habari Woodynat team. We have a family memorial service this weekend.',
        timestamp: '11:10 AM',
        status: 'read'
      },
      {
        id: 'msg-22',
        sender: 'customer',
        text: 'We need 300 copies of 8-page glossy memorial program. Can you deliver to Nakuru by tomorrow evening?',
        timestamp: '11:15 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'chat-004',
    customerName: 'Kevin Maina',
    customerPhone: '0720112233',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyName: 'Apex Gym Nairobi',
    unreadCount: 0,
    lastMessage: 'Payment of KSh 22,000 sent via Paybill 247247 Acc 0797939199. Ref: QHM9921K8L',
    lastMessageTime: 'Yesterday',
    topic: 'Branded Gym Towels & Reflectors',
    status: 'paid',
    isBotActive: false,
    messages: [
      {
        id: 'msg-31',
        sender: 'customer',
        text: 'Hi, please send Paybill details for our gym reflector order.',
        timestamp: 'Yesterday 3:15 PM',
        status: 'read'
      },
      {
        id: 'msg-32',
        sender: 'agent',
        text: 'Paybill: 247247, Account: 0797939199, Total: KSh 22,000.',
        timestamp: 'Yesterday 3:18 PM',
        status: 'read'
      },
      {
        id: 'msg-33',
        sender: 'customer',
        text: 'Payment of KSh 22,000 sent via Paybill 247247 Acc 0797939199. Ref: QHM9921K8L',
        timestamp: 'Yesterday 3:30 PM',
        status: 'read'
      },
      {
        id: 'msg-34',
        sender: 'agent',
        text: 'Confirmed! Order is in production at Gatkim Complex 4th floor. Ready for pick-up by 4 PM today.',
        timestamp: 'Yesterday 3:32 PM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-005',
    customerName: 'Faith Chebet',
    customerPhone: '0701554433',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    companyName: 'Bright Spark Media',
    unreadCount: 0,
    lastMessage: 'Where are you located in CBD so I can see the acrylic samples?',
    lastMessageTime: 'Aug 12',
    topic: '3D Acrylic Signage & Teardrop Flags',
    status: 'active',
    isBotActive: true,
    messages: [
      {
        id: 'msg-41',
        sender: 'customer',
        text: 'Where are you located in CBD so I can see the acrylic samples?',
        timestamp: 'Aug 12 11:30 AM',
        status: 'read'
      },
      {
        id: 'msg-42',
        sender: 'bot',
        text: `📍 Woodynat Designers Limited: Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD. Open Mon-Sat 7:30 AM to 6:30 PM.`,
        timestamp: 'Aug 12 11:30 AM',
        status: 'read'
      }
    ]
  }
];

export const DEFAULT_ZOHO_SETTINGS: ZohoSettings = {
  accountEmail: 'woodynatdesigners12@gmail.com',
  notificationEmail: 'woodynatdesigners12@gmail.com',
  senderName: 'Woodynat Designers Limited',
  organizationId: '60029188401',
  clientId: '1000.WOODYNAT_ZOHO_CLIENT_ID',
  clientSecret: 'zoho_sec_89df0123984ba712e',
  refreshToken: '1000.zoho_refresh_token_live_woodynat',
  environment: 'production',
  autoSyncToZoho: true,
  defaultQuotePrefix: 'ZOHO-QT-2026',
  defaultPaymentTerms: '50% Deposit, 50% on Delivery',
  defaultValidityDays: 14,
  defaultTaxRate: 16,
  defaultDeliveryTimeline: '24-48 Hours Express Delivery',
  defaultNotes: 'Thank you for choosing Woodynat Designers Limited for your branding and printing needs. High-resolution digital vector proofs will be provided for sign-off before mass production begins.',
  defaultTerms: '1. 50% advance deposit is required before commencement of production; remaining 50% balance payable upon dispatch or shop collection.\n2. Digital vector proof approval is mandatory for all personalized and corporate apparel/signage.\n3. Turnaround time commences after design approval & deposit confirmation.\n4. Official M-Pesa Paybill: 247247 | Account: 0797939199.',
  companyKraPin: 'P051982734Z',
  includeEtrQrCode: true
};

export const INITIAL_ZOHO_QUOTATIONS: ZohoQuotation[] = [
  {
    id: 'quote-001',
    quoteNumber: 'ZOHO-QT-2026-0041',
    referenceInquiryId: 'inq-001',
    referenceChatId: 'chat-001',
    customerName: 'Jane Wambui',
    customerPhone: '0712345678',
    customerEmail: 'jane.wambui@safariadventures.co.ke',
    companyName: 'Safari Adventures East Africa Ltd',
    customerKraPin: 'P051283940A',
    billingAddress: 'Delta Corner Tower, Westlands, Nairobi',
    deliveryLocation: 'Westlands, Nairobi',
    deliveryType: 'Express Home Delivery',
    quoteDate: '2026-08-13',
    expiryDate: '2026-08-27',
    validityDays: 14,
    paymentTerms: '50% Deposit, 50% on Delivery',
    deliveryTimeline: '24-48 Hours Express Delivery',
    currency: 'KSh',
    items: [
      {
        id: 'item-1',
        productId: 'prod-tshirt-screen',
        name: 'Custom Round Neck 100% Cotton T-Shirts',
        category: 'Printed T-Shirts',
        description: 'Navy Blue & White, 180GSM combed cotton with 2-color screen printed chest logo and back tagline.',
        quantity: 50,
        unit: 'pcs',
        unitPrice: 550,
        discountPercent: 5,
        taxPercent: 16,
        taxAmount: 4180,
        total: 26125,
        selectedSize: 'Mixed (M: 20, L: 20, XL: 10)',
        artworkNotes: 'Vector AI logo supplied. High-density plastisol screen print.'
      },
      {
        id: 'item-2',
        productId: 'prod-rollup-banner',
        name: 'Roll-Up Banner Printing (Light Aluminum Base)',
        category: 'Banners & Stickers',
        description: 'Retractable 85cm x 200cm roll-up display banner on waterproof anti-curl satin media with canvas bag.',
        quantity: 2,
        unit: 'pcs',
        unitPrice: 6500,
        discountPercent: 0,
        taxPercent: 16,
        taxAmount: 2080,
        total: 13000,
        selectedFinish: 'Light Aluminum Base',
        artworkNotes: 'High resolution 300DPI roll-up graphic artwork.'
      }
    ],
    subtotal: 40500,
    discountTotal: 1375,
    taxRate: 16,
    taxTotal: 6260,
    shippingCost: 500,
    grandTotal: 45885,
    isTaxInclusive: false,
    notes: 'Quotation prepared for corporate safari event branding. Fast 48-hour turn-around guaranteed.',
    termsAndConditions: '1. 50% advance deposit via Paybill 247247 (Acc: 0797939199) required to start pre-press.\n2. Delivery to Westlands office included in schedule.\n3. Validity: 14 calendar days.',
    paybillNumber: '247247',
    paybillAccount: '0797939199',
    status: 'Sent',
    zohoSyncStatus: 'synced',
    zohoEstimateId: 'EST-2900192',
    createdAt: '2026-08-13T10:30:00Z',
    updatedAt: '2026-08-13T10:30:00Z',
    preparedBy: 'Woodynat Commercial Sales Desk'
  },
  {
    id: 'quote-002',
    quoteNumber: 'ZOHO-QT-2026-0042',
    referenceInquiryId: 'inq-002',
    referenceChatId: 'chat-002',
    customerName: 'Peter Kamau',
    customerPhone: '0722998877',
    customerEmail: 'peter.kamau@gmail.com',
    companyName: 'Family Memorial Committee',
    billingAddress: 'Kilimani, Nairobi',
    deliveryLocation: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
    deliveryType: 'CBD Workshop Pickup',
    quoteDate: '2026-08-13',
    expiryDate: '2026-08-20',
    validityDays: 7,
    paymentTerms: 'Due on Receipt',
    deliveryTimeline: 'Same-Day 24h Express Turnaround',
    currency: 'KSh',
    items: [
      {
        id: 'item-201',
        productId: 'prod-eulogy-booklet-a5',
        name: 'Full Color A5 Memorial & Funeral Program Booklets (8 Pages)',
        category: 'Eulogies & Memorials',
        description: 'Glossy 150GSM art paper full color printing with saddle stitch staple binding and photo retouching.',
        quantity: 200,
        unit: 'books',
        unitPrice: 120,
        discountPercent: 10,
        taxPercent: 0,
        taxAmount: 0,
        total: 21600,
        selectedFinish: 'Gloss 150GSM Art Paper',
        artworkNotes: 'Family photos and eulogy text provided. Urgent 24-hour service.'
      },
      {
        id: 'item-202',
        productId: 'prod-tshirt-sublimation',
        name: 'Full Color Memorial Sublimation Polyester T-Shirts',
        category: 'Printed T-Shirts',
        description: 'White polyester breathable fabric with full color portrait photo on chest.',
        quantity: 30,
        unit: 'pcs',
        unitPrice: 450,
        discountPercent: 0,
        taxPercent: 0,
        taxAmount: 0,
        total: 13500,
        selectedSize: 'Mixed Sizes (M, L, XL)',
        artworkNotes: 'High-res memorial portrait with In Loving Memory typography.'
      }
    ],
    subtotal: 37500,
    discountTotal: 2400,
    taxRate: 0,
    taxTotal: 0,
    shippingCost: 0,
    grandTotal: 35100,
    isTaxInclusive: true,
    notes: 'Urgent 24-hour dispatch for weekend memorial service. Complimentary photo cleanup included.',
    termsAndConditions: '1. Immediate deposit confirms print queue slot.\n2. Collection at Temple Road Gatkim complex 4th floor Room 4B1.\n3. Digital proof sign-off via WhatsApp (0797939199).',
    paybillNumber: '247247',
    paybillAccount: '0797939199',
    status: 'Approved',
    zohoSyncStatus: 'synced',
    zohoEstimateId: 'EST-2900193',
    createdAt: '2026-08-13T14:15:00Z',
    updatedAt: '2026-08-13T15:00:00Z',
    preparedBy: 'Woodynat Quick-Press Desk'
  },
  {
    id: 'quote-003',
    quoteNumber: 'ZOHO-QT-2026-0043',
    customerName: 'Marcus Otieno',
    customerPhone: '0733112233',
    customerEmail: 'm.otieno@apexlogistics.co.ke',
    companyName: 'Apex Hauliers & Logistics Ltd',
    customerKraPin: 'P051892019K',
    billingAddress: 'Mombasa Road, Industrial Area, Nairobi',
    deliveryLocation: 'Industrial Area, Nairobi',
    deliveryType: 'Express Home Delivery',
    quoteDate: '2026-08-14',
    expiryDate: '2026-08-28',
    validityDays: 14,
    paymentTerms: 'Net 15',
    deliveryTimeline: '3-4 Business Days',
    currency: 'KSh',
    items: [
      {
        id: 'item-301',
        productId: 'prod-heavyweight-hoodie',
        name: 'Heavyweight Fleece Corporate Hoodies (Embroidery)',
        category: 'Hoodies',
        description: 'Black heavyweight 320GSM fleece with high-precision front chest embroidery & sleeve flag.',
        quantity: 25,
        unit: 'pcs',
        unitPrice: 1800,
        discountPercent: 8,
        taxPercent: 16,
        taxAmount: 6624,
        total: 41400,
        selectedSize: 'L (15), XL (10)',
        artworkNotes: 'Corporate logo DST embroidery file created.'
      },
      {
        id: 'item-302',
        productId: 'prod-safety-reflector-mesh',
        name: 'High-Visibility Executive Safety Reflective Vests',
        category: 'Reflectors & Aprons',
        description: 'Neon Green safety reflector vest with dual horizontal 3M Scotchlite reflective stripes and company name on back.',
        quantity: 40,
        unit: 'pcs',
        unitPrice: 450,
        discountPercent: 5,
        taxPercent: 16,
        taxAmount: 2736,
        total: 17100,
        artworkNotes: 'Back screen print: APEX LOGISTICS FLEET CREW'
      }
    ],
    subtotal: 63000,
    discountTotal: 4500,
    taxRate: 16,
    taxTotal: 9360,
    shippingCost: 800,
    grandTotal: 68660,
    isTaxInclusive: false,
    notes: 'Corporate fleet apparel quote. Special discounted volume rates applied.',
    termsAndConditions: '1. Official purchase order (LPO) accepted.\n2. Pre-production embroidery physical sample available upon request at Gatkim Complex shop.\n3. ETR tax invoice will be generated upon delivery.',
    paybillNumber: '247247',
    paybillAccount: '0797939199',
    status: 'Draft',
    zohoSyncStatus: 'local_only',
    createdAt: '2026-08-14T06:00:00Z',
    updatedAt: '2026-08-14T06:00:00Z',
    preparedBy: 'Admin Desk'
  }
];

