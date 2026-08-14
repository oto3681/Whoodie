import { BulkSmsTemplate, BulkEmailTemplate, CustomerContact, BulkCampaign } from '../types';

export const INITIAL_SMS_TEMPLATES: BulkSmsTemplate[] = [
  {
    id: 'sms-flash-deal',
    title: '🔥 Flash Sale: 15% OFF T-Shirts & Hoodies',
    category: 'Promotion',
    body: `Habari {{customer_name}}! Woodynat Designers has a 15% FLASH SALE on custom T-Shirts (@KSh 550) & Heavyweight Fleece Hoodies (@KSh 1,800). Order today via WhatsApp: 0797939199. Paybill: 247247 Acc: 0797939199. Gatkim Complex CBD.`
  },
  {
    id: 'sms-memorial-urgent',
    title: '🕊️ Urgent 24h Memorial & Funeral Programs',
    category: 'Memorial',
    body: `Dear {{customer_name}}, need urgent funeral / memorial booklets? Woodynat Designers offers compassionate 24-hr design & print with countrywide courier. WhatsApp photos/text to 0797939199 for instant draft. Call: 0797939199.`
  },
  {
    id: 'sms-corporate-catalog',
    title: '🏢 Corporate Banners, Reflectors & Apparel 2026',
    category: 'Corporate',
    body: `Hello {{customer_name}} ({{company_name}}), upgrade your brand! Roll-Up Banners from KSh 6,500, Safety Reflectors from KSh 450, 3D Acrylic Signs & Polos. Visit us at Gatkim Complex 4th Flr CBD or WhatsApp: 0797939199 for a formal quote.`
  },
  {
    id: 'sms-paybill-reminder',
    title: '💳 M-Pesa Paybill Payment & Account Info',
    category: 'Payment',
    body: `Hi {{customer_name}}, to confirm your print job with Woodynat Designers Ltd: Lipa na M-Pesa > Paybill > Bus No: 247247 > Acc No: 0797939199. Send confirmation SMS/WhatsApp to 0797939199 for receipting & immediate production.`
  },
  {
    id: 'sms-shop-visit',
    title: '📍 Nairobi CBD Showroom Invitation & Sample Review',
    category: 'Location',
    body: `Habari {{customer_name}}, visit Woodynat Designers to inspect print samples & fabric swatches: Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD. Open Mon-Sat 7:30AM-6:30PM. Hotline: 0797939199.`
  },
  {
    id: 'sms-order-ready',
    title: '📦 Order Production Complete & Ready for Pick-up',
    category: 'Transactional',
    body: `Great news {{customer_name}}! Your print order is ready at Woodynat Designers (Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi). Courier dispatch also available. Inquiries: 0797939199.`
  }
];

export const INITIAL_EMAIL_TEMPLATES: BulkEmailTemplate[] = [
  {
    id: 'email-catalog-2026',
    title: '📑 New 2026 Commercial Printing & Branding Catalogue',
    category: 'Catalogue',
    subject: '✨ Exclusive: 2026 Corporate Print & Apparel Price Guide | Woodynat Designers',
    preheader: 'Discover new bulk pricing for custom T-Shirts, Hoodies, Roll-Up Banners, Signage & Safety Wear.',
    headline: 'Elevate Your Organization’s Brand with Premium Print Solutions',
    heroImage: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1000&auto=format&fit=crop&q=80',
    badgeText: 'NEW 2026 EDITION',
    bodyParagraphs: [
      'Dear {{customer_name}}, we are thrilled to unveil the updated 2026 Corporate Printing & Branding Catalogue from Woodynat Designers Limited.',
      'Whether you are gearing up for annual company AGMs, employee uniforms, marketing exhibitions, or high-visibility corporate activations, we provide end-to-end design, rapid turnaround, and certified quality.'
    ],
    bulletPoints: [
      'Custom 100% Combed Cotton T-Shirts from KSh 550 / pc',
      'Heavyweight 280GSM Brushed Fleece Hoodies from KSh 1,800 / pc',
      'Heavy Duty Roll-Up Banners (85x200cm) with Carry Case @ KSh 6,500',
      'Reflective Safety Vests & Industrial Aprons with Screen/DTF Print',
      '3D Acrylic Cut-Out Signs & Teardrop Promotional Flags',
      'Express Same-Day Countrywide Courier Dispatch'
    ],
    ctaButtonText: 'Download Official PDF Catalogue',
    ctaButtonUrl: 'https://woodynatdesigners.co.ke/catalogue',
    secondaryCtaText: 'Chat with Senior Designer (WhatsApp 0797939199)',
    secondaryCtaUrl: 'https://wa.me/254797939199?text=Hello%20Woodynat%2C%20I%20would%20like%20a%20quotation%20for%20our%20company%20branding',
    footerNote: 'Woodynat Designers Limited • Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD • Official Paybill: 247247 / Acc: 0797939199'
  },
  {
    id: 'email-memorial-service',
    title: '🕊️ Express 24-Hour Memorial & Eulogy Booklets Assistance',
    category: 'Memorial',
    subject: '🕊️ Compassionate 24-Hour Funeral & Memorial Program Services',
    preheader: 'Urgent, dignified typesetting and high-gloss memorial booklet printing with countrywide delivery.',
    headline: 'Honoring Your Loved Ones with Dignified, Express Memorial Print Services',
    heroImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80',
    badgeText: '24-HOUR EXPRESS DESK',
    bodyParagraphs: [
      'Dear {{customer_name}}, during times of bereavement, timely and respectful assistance is paramount. Woodynat Designers provides a dedicated 24-hour express production unit specifically for funeral eulogies, memorial service booklets, and portrait tributes.',
      'Our senior typesetting team will clean up family portraits, format life tributes, and produce high-resolution glossy booklets within hours for seamless family pickup or delivery.'
    ],
    bulletPoints: [
      '4-Page Full Glossy A5 Folded Folders: From KSh 50 / pc',
      '8-Page to 16-Page High Gloss Stapled Booklets: From KSh 90 / pc',
      'Photo Retouching, Obituary Typesetting & Proof Approval via WhatsApp',
      'Same-day express courier to Nakuru, Kisumu, Eldoret, Nyeri, Mombasa & countrywide',
      'Direct 24/7 WhatsApp emergency line: 0797939199'
    ],
    ctaButtonText: 'Submit Photos & Tribute for Free Proof',
    ctaButtonUrl: 'https://wa.me/254797939199?text=Hello%20Woodynat%2C%20we%20need%20urgent%20memorial%20programs',
    secondaryCtaText: 'Call Hotline: 0797939199',
    secondaryCtaUrl: 'tel:+254797939199',
    footerNote: 'Woodynat Designers Limited • Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD • Paybill: 247247 | Account: 0797939199'
  },
  {
    id: 'email-corporate-b2b',
    title: '💼 Corporate Staff Uniforms, Safety Wear & Event Signage',
    category: 'Corporate',
    subject: '👔 Institutional Uniforms & Event Branding Proposals for {{company_name}}',
    preheader: 'Tailored branding proposals, credit terms, and volumetric discounts for corporate clients.',
    headline: 'Turnkey Branding & High-Visibility Apparel for Your Corporate Team',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    badgeText: 'CORPORATE TENDERS & B2B',
    bodyParagraphs: [
      'Hello {{customer_name}} and the {{company_name}} team,',
      'Woodynat Designers Limited is a certified corporate branding and printing provider headquartered in Nairobi CBD. We specialize in contract garment manufacturing, corporate uniform embroidery, and large-format exhibition displays for NGOs, financial institutions, logistics firms, and schools.'
    ],
    bulletPoints: [
      'Executive Pique Polo Shirts with precision chest embroidery',
      'Heavyweight Cotton Fleece Hoodies with custom inside neck label options',
      'Industrial Safety Reflective Vests with EN471 compliant reflective bands',
      'Outdoor Advertising: Teardrop Flags, Gazebo Tents, Telescopic Banners',
      'Standardized Corporate Color Matching & Fast Sample Prototyping',
      'Tax Invoicing & Flexible Payment Terms Available for Registered Firms'
    ],
    ctaButtonText: 'Request Formal Corporate Quotation',
    ctaButtonUrl: 'https://woodynatdesigners.co.ke/quote',
    secondaryCtaText: 'Schedule CBD Showroom Meeting',
    secondaryCtaUrl: 'https://wa.me/254797939199?text=Hello%20Woodynat%2C%20we%20would%20like%20to%20schedule%20a%20corporate%20sample%20meeting',
    footerNote: 'Woodynat Designers Limited • Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD • ETR Tax Registered • Official WhatsApp: 0797939199'
  },
  {
    id: 'email-paybill-guide',
    title: '💳 Official M-Pesa Paybill & Order Settlement Guide',
    category: 'Payment',
    subject: '🧾 Payment Instructions & Official Paybill 247247 Guide | Woodynat Designers',
    preheader: 'Secure your print job with instant M-Pesa Paybill settlement and automatic production queueing.',
    headline: 'Fast & Secure Order Settlement via M-Pesa Paybill',
    heroImage: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=1000&auto=format&fit=crop&q=80',
    badgeText: 'VERIFIED SAFARICOM PAYBILL',
    bodyParagraphs: [
      'Dear {{customer_name}}, thank you for partnering with Woodynat Designers Limited. To ensure your custom print jobs are scheduled immediately on our production presses, please find our official payment credentials below.'
    ],
    bulletPoints: [
      '1. Open M-Pesa on your phone and select Lipa na M-Pesa',
      '2. Select Paybill',
      '3. Enter Business Number: 247247',
      '4. Enter Account Number: 0797939199',
      '5. Enter Amount and your M-Pesa PIN to complete transaction',
      '6. Forward your confirmation SMS to WhatsApp 0797939199 for automated job ticketing'
    ],
    ctaButtonText: 'Confirm Payment on WhatsApp (0797939199)',
    ctaButtonUrl: 'https://wa.me/254797939199?text=Hi%20Woodynat%2C%20I%20have%20sent%20payment%20via%20Paybill%20247247',
    secondaryCtaText: 'Call Production Desk (0797939199)',
    secondaryCtaUrl: 'tel:+254797939199',
    footerNote: 'Woodynat Designers Limited • Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi, Kenya'
  }
];

export const INITIAL_CUSTOM_CONTACTS: CustomerContact[] = [
  {
    id: 'cnt-01',
    name: 'Jane Wambui',
    phone: '0712345678',
    email: 'jane.wambui@apexlogistics.co.ke',
    companyName: 'Apex Logistics Kenya',
    tags: ['Corporate Client', 'Order Customer', 'Banners', 'T-Shirts'],
    source: 'order',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 01, 2026',
    totalOrdersCount: 3,
    lastActiveDate: 'August 12, 2026'
  },
  {
    id: 'cnt-02',
    name: 'David Ochieng',
    phone: '0722998877',
    email: 'david.ochieng@stjude.ac.ke',
    companyName: 'St. Jude Academy Nairobi',
    tags: ['School', 'Hoodies', 'Polos', 'Inquiry Lead'],
    source: 'inquiry',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 03, 2026',
    totalOrdersCount: 1,
    lastActiveDate: 'August 13, 2026'
  },
  {
    id: 'cnt-03',
    name: 'Mary Mwangi',
    phone: '0733445566',
    email: 'mary.mwangi@mwangoenterprises.com',
    companyName: 'Family Committee & Mwango Ltd',
    tags: ['Memorial Lead', 'Urgent 24h', 'WhatsApp Contact'],
    source: 'whatsapp',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 05, 2026',
    totalOrdersCount: 2,
    lastActiveDate: 'August 13, 2026'
  },
  {
    id: 'cnt-04',
    name: 'Kevin Maina',
    phone: '0720112233',
    email: 'kevin@apexgym.co.ke',
    companyName: 'Apex Fitness & Gym Nairobi',
    tags: ['VIP Client', 'Reflectors', 'Towels', 'Order Customer'],
    source: 'order',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'July 28, 2026',
    totalOrdersCount: 4,
    lastActiveDate: 'August 12, 2026'
  },
  {
    id: 'cnt-05',
    name: 'Faith Chebet',
    phone: '0701554433',
    email: 'faith.chebet@brightspark.co.ke',
    companyName: 'Bright Spark Media Agency',
    tags: ['Signage', 'Acrylic', 'Teardrop Flags', 'Corporate Client'],
    source: 'inquiry',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 06, 2026',
    totalOrdersCount: 1,
    lastActiveDate: 'August 12, 2026'
  },
  {
    id: 'cnt-06',
    name: 'Dr. Geoffrey Mutua',
    phone: '0721889900',
    email: 'dr.mutua@knhmedicalassociation.org',
    companyName: 'Medical Practitioners Association',
    tags: ['Healthcare', 'Corporate Client', 'Polo Shirts', 'Certificates'],
    source: 'order',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'July 15, 2026',
    totalOrdersCount: 2,
    lastActiveDate: 'August 08, 2026'
  },
  {
    id: 'cnt-07',
    name: 'Sarah Ndung\'u',
    phone: '0799443322',
    email: 'sarah.ndungu@kilimaniprimary.sc.ke',
    companyName: 'Kilimani Primary School PTA',
    tags: ['School', 'Eulogies & Memorials', 'Staff Polos'],
    source: 'whatsapp',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 07, 2026',
    totalOrdersCount: 1,
    lastActiveDate: 'August 11, 2026'
  },
  {
    id: 'cnt-08',
    name: 'Emmanuel Kiprop',
    phone: '0711667788',
    email: 'emmanuel.k@riftvalleydistributors.com',
    companyName: 'Rift Valley Distributors Ltd',
    tags: ['Industrial', 'Reflectors & Aprons', 'Signage', 'Quoted'],
    source: 'inquiry',
    subscribedEmail: true,
    subscribedSms: true,
    createdAt: 'August 10, 2026',
    totalOrdersCount: 0,
    lastActiveDate: 'August 10, 2026'
  }
];

export const INITIAL_CAMPAIGNS: BulkCampaign[] = [
  {
    id: 'camp-101',
    title: 'August 2026 Corporate Print Catalogue Launch',
    channel: 'email',
    targetAudience: 'corporate',
    audienceLabel: 'Corporate & Institutional Clients (148 Contacts)',
    recipientCount: 148,
    emailSubject: '✨ Exclusive: 2026 Corporate Print & Apparel Price Guide | Woodynat Designers',
    emailPreheader: 'Discover new bulk pricing for custom T-Shirts, Hoodies, Roll-Up Banners & Signage.',
    emailTemplateId: 'email-catalog-2026',
    sentAt: 'August 10, 2026 • 09:30 AM',
    status: 'completed',
    deliveredCount: 146,
    failedCount: 2,
    openRateEstimate: '68.4%',
    logs: [
      '09:30:00 - Initialized SMTP batch dispatcher with sender Woodynat <woodynatdesigners12@gmail.com>',
      '09:30:04 - Segment Corporate (148 recipients) queued for dynamic personalization',
      '09:30:18 - Dispatched 148 emails: 146 Delivered, 2 Soft-Bounced',
      '09:30:20 - Campaign concluded successfully. 42 direct link clicks to PDF catalogue recorded.'
    ]
  },
  {
    id: 'camp-102',
    title: 'Weekend Flash Promo: Custom T-Shirts & Hoodies 15% OFF',
    channel: 'sms',
    targetAudience: 'all',
    audienceLabel: 'All Registered & Order Customers (285 Contacts)',
    recipientCount: 285,
    senderId: 'WOODYNAT',
    smsBody: 'Habari {{customer_name}}! Woodynat Designers has a 15% FLASH SALE on custom T-Shirts (@KSh 550) & Heavyweight Fleece Hoodies (@KSh 1,800). Order today via WhatsApp: 0797939199. Paybill: 247247 Acc: 0797939199.',
    sentAt: 'August 08, 2026 • 11:15 AM',
    status: 'completed',
    deliveredCount: 281,
    failedCount: 4,
    openRateEstimate: '98.2%',
    logs: [
      '11:15:00 - Telco Gateway Safaricom / Airtel bulk route initiated',
      '11:15:02 - Sender ID WOODYNAT verified with Kenya Telco Registry',
      '11:15:12 - 285 SMS units sent via High-Priority Alpha Gateway',
      '11:15:15 - 281 Delivered (98.6% delivery rate), 4 Phone switched off / invalid'
    ]
  }
];
