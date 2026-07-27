import { Product, CustomerReview, Order, WordPressSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Roll-up banner (large base @8500 and light base @6500)
  {
    id: 'prod-rollup-banner',
    name: 'Roll-Up Banner Printing (Light & Large Heavy Base)',
    category: 'Banners & Displays',
    price: 6500,
    priceDisplay: 'KSh 6,500 (Light) / KSh 8,500 (Large)',
    originalPrice: 9000,
    rating: 4.9,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80',
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
    category: 'Banners & Displays',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 145,
    image: '/assets/images/teardrop_banner_1785135656612.jpg',
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
    image: '/assets/images/crewneck_tshirt_printed_1785136447498.jpg',
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
    image: '/assets/images/polo_tshirt_printed_1785135850854.jpg',
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
    name: 'Funeral Program Printing & Design (24-Hour Express)',
    category: 'Eulogies & Memorials',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 320,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    description: 'Respectful, beautifully formatted eulogy booklets, funeral order-of-service programs, and memorial tributes with 24-hour express printing & countrywide delivery.',
    features: [
      'Ask for quote through WhatsApp inquiry',
      '24-Hour Express Turnaround',
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
    category: 'Brochures & Flyers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800&auto=format&fit=crop&q=80',
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
    category: 'Product Stickers & Labels',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 280,
    image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&auto=format&fit=crop&q=80',
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

  // 8. Wedding cards (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-wedding-cards',
    name: 'Wedding Invitation Cards & Stationeries',
    category: 'Brochures & Flyers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 5.0,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
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
    category: 'Reflectors & Safety',
    price: 350,
    originalPrice: 500,
    rating: 4.8,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80',
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
      finishes: ['Black Logo Print', 'Full Color Screen Print'],
      minQuantity: 1,
    }
  },

  // 14. Calendars (Ask for quote through the whatsapp inquiry number)
  {
    id: 'prod-calendars',
    name: 'Corporate Desktop & Wall Calendars',
    category: 'Brochures & Flyers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.8,
    reviewCount: 160,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop&q=80',
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
    category: 'Brochures & Flyers',
    price: 0,
    isQuoteOnly: true,
    priceDisplay: 'Ask for Quote via WhatsApp',
    rating: 4.9,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
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
    category: 'Hoodies & Sweatshirts',
    price: 2500,
    originalPrice: 3200,
    rating: 5.0,
    reviewCount: 380,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
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
  },

  // 22. Corporate Documentary & Video Production Package
  {
    id: 'prod-documentary-01',
    name: 'Corporate Documentary & Event Video Production Package',
    category: 'Documentaries & Video',
    price: 65000,
    originalPrice: 85000,
    rating: 5.0,
    reviewCount: 38,
    image: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800&auto=format&fit=crop&q=80',
    description: 'Full-service video production: professional 4K camera filming, drone aerial footage, studio audio recording, color grading, and voiceover.',
    features: ['4K Cinema Camera Filming', 'Drone Aerial Footage', 'Professional Voiceover & Audio', 'Motion Graphics & Titles'],
    stockCount: 15,
    customizationOptions: {
      finishes: ['3-Minute Promo Documentary', '10-Minute Full Corporate Story', 'Event Aftermovie + Highlights'],
      minQuantity: 1,
    }
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    customerName: 'Kiprono M. (Apex Logistics)',
    productCategory: 'Reflectors & Safety',
    productName: 'High-Visibility Executive Safety Vest',
    rating: 5,
    comment: 'Ordered 150 safety vests with our company logo printed on the back. Delivered in 24 hours to our depot in Industrial Area Nairobi! Excellent quality reflective bands.',
    date: 'July 24, 2026',
    verifiedBuyer: true,
    likes: 24,
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-02',
    customerName: 'Grace Wambui',
    productCategory: 'Eulogies & Memorials',
    productName: 'Express Funeral Program Booklets (24-Hour Delivery)',
    rating: 5,
    comment: 'Woodynat Designers Limited came to our rescue during a very emotional time. They designed and printed 300 eulogy booklets overnight and delivered them straight to Nakuru before sunrise. May God bless your team.',
    date: 'July 20, 2026',
    verifiedBuyer: true,
    likes: 42,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-03',
    customerName: 'David Ochieng (Vibe Events)',
    productCategory: 'Banners & Displays',
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
    productCategory: 'Product Stickers & Labels',
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
  tagline: 'Creativity at its best with high print precision that speaks',
  whatsappNumber: '0797939199',
  supportPhone: '0797939199',
  companyEmail: 'woodynatdesigners12@gmail.com',
  paybillNumber: '247247',
  paybillAccount: '0797939199',
  companyAddress: 'Ronald Ngala street, Gatkim complex building, 4th floor, Wing B, Room 4B1',
  companyCity: 'Nairobi',
  topBannerText: '⚡ MEGA FLASH SALE: Up to 30% OFF Custom Hoodies, T-Shirts & Banners! | M-PESA Paybill: 247247 Acc: 0797939199',
  facebookUrl: 'https://facebook.com/woodynatdesigners',
  instagramUrl: 'https://instagram.com/woodynatdesigners',
  tiktokUrl: 'https://tiktok.com/@woodynatdesigners',
  primaryColor: '#f68b1e',
  wpWooSyncEnabled: true,
  wpRestEndpoint: 'https://woodynatdesigners.co.ke/wp-json/wc/v3',
  heroHeadline: 'Woodynat Designers Limited — Premium Printing & Custom Apparel',
  heroSubheadline: 'Custom T-Shirts, Hoodies, Banners, Signage & Express 24h Funeral Program Booklets. Visit us at Gatkim Complex, Nairobi or order online via Paybill 247247 (Acc: 0797939199)!'
};
