import type { FormEvent } from 'react';

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  priceLabel: string;
  oldPrice: string;
  badge: string;
  image: string;
  gallery: string[];
  description: string;
  stock?: number;
  delivery?: string;
  reviewsEnabled?: boolean;
  manualReviewsEnabled?: boolean;
  rating?: number;
  reviewCount?: number;
  showRelated?: boolean;
  showPolicies?: boolean;
  details?: ProductDetailBlock[];
  specs?: Array<[string, string]>;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  isVisible?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductDetailBlock = {
  id: string;
  title: string;
  text: string;
  richTextHtml?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  reverse: boolean;
  textAlign?: 'right' | 'center' | 'left';
  textSize?: 'sm' | 'base' | 'lg';
  headingSize?: 'h2' | 'h3';
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textColor?: string;
  backgroundColor?: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceLabel: string;
  stock: number;
  enabled: boolean;
  image?: string;
  optionValues?: Record<string, string>;
};

export type ProductVariantOption = {
  id: string;
  type: string;
  label: string;
  values: Array<{
    id: string;
    label: string;
    color?: string;
  }>;
};

export type Category = {
  id: string;
  title: string;
  count: string;
  image: string;
};

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  priceLabel: string;
  quantity: number;
  image: string;
  variant?: string;
};

export type OrderDraft = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  source: string;
  items: CartItem[];
};

export type StoredOrder = OrderDraft & {
  id: string;
  createdAt: string;
  status: 'new' | 'whatsapp' | 'confirmed' | 'delivery' | 'done';
  total: number;
};

export type StoreSettings = {
  storeName: string;
  whatsappNumber: string;
  phone: string;
  city: string;
  deliveryText: string;
  address: string;
};

export const defaultSettings: StoreSettings = {
  storeName: 'TanjaMall',
  whatsappNumber: '212708012888',
  phone: '06 00 00 00 00',
  city: 'طنجة',
  deliveryText: '24 إلى 48 ساعة',
  address: 'طنجة',
};

export const categories: Category[] = [
  {
    id: 'home-kitchen',
    title: 'المنزل والمطبخ',
    count: '120 منتجا',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'beauty-care',
    title: 'العناية والجمال',
    count: '85 منتجا',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'electronics',
    title: 'الإلكترونيات',
    count: '70 منتجا',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'travel',
    title: 'السفر والحقائب',
    count: '45 منتجا',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'fashion',
    title: 'الأزياء والإكسسوارات',
    count: '150 منتجا',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'offers',
    title: 'عروض محدودة',
    count: '40 عرضا',
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80',
  },
];

export const products: Product[] = [
  {
    id: 'covered-shoe-organizer-7-tier',
    slug: 'covered-shoe-organizer-7-tier',
    title: 'منظم أحذية بغطاء 7 طبقات',
    category: 'المنزل والمطبخ',
    price: 199,
    priceLabel: '199 درهم',
    oldPrice: '260 درهم',
    badge: 'توصيل مجاني',
    image: 'product-media/covered-shoe-organizer/shoe-organizer-01-hero.jpeg',
    gallery: [
      'product-media/covered-shoe-organizer/shoe-organizer-01-hero.jpeg',
      'product-media/covered-shoe-organizer/shoe-organizer-02-rooms.jpeg',
      'product-media/covered-shoe-organizer/shoe-organizer-03-dimensions.jpeg',
      'product-media/covered-shoe-organizer/shoe-organizer-04-materials.jpeg',
      'product-media/covered-shoe-organizer/shoe-organizer-05-details.jpeg',
    ],
    description: 'منظم أحذية عملي بسبع طبقات وغطاء يحافظ على الأحذية مرتبة وبعيدة عن الغبار. مناسب للمدخل، الغرفة أو الخزانة، يركب بسرعة بدون أدوات ويساعدك تستغل المساحة بشكل أفضل.',
    stock: 48,
    delivery: 'توصيل مجاني داخل طنجة خلال 24 إلى 48 ساعة',
    reviewsEnabled: true,
    manualReviewsEnabled: true,
    rating: 4.7,
    reviewCount: 93,
    showRelated: true,
    showPolicies: true,
    details: [
      {
        id: 'shoe-organizer-detail-1',
        title: '',
        text: 'مدخل مرتب بدون فوضى',
        richTextHtml: '<h2 style="text-align: right;"><font face="Cairo, Arial, sans-serif"><b>مدخل مرتب بدون فوضى</b></font></h2><p style="text-align: right;"><font face="Cairo, Arial, sans-serif">بدل أن تبقى الأحذية متفرقة قرب الباب أو داخل الغرفة، يجمعها هذا المنظم في مكان واحد واضح وسهل الوصول.</font></p><ul><li><font face="Cairo, Arial, sans-serif">7 طبقات تكفي للاستخدام اليومي للعائلة.</font></li><li><font face="Cairo, Arial, sans-serif">شكل عمودي يستغل المساحة بدل نشر الأحذية على الأرض.</font></li><li><font face="Cairo, Arial, sans-serif">مناسب للمدخل، غرفة النوم أو الخزانة.</font></li></ul>',
        mediaUrl: 'product-media/covered-shoe-organizer/shoe-organizer-01-hero.jpeg',
        mediaType: 'image',
        reverse: false,
        backgroundColor: '#f8fafc',
        textColor: '#17201b',
      },
      {
        id: 'shoe-organizer-detail-2',
        title: '',
        text: 'غطاء يحمي الأحذية',
        richTextHtml: '<h2 style="text-align: right;"><font face="Cairo, Arial, sans-serif"><b>غطاء يحمي الأحذية من الغبار</b></font></h2><p style="text-align: right;"><font face="Cairo, Arial, sans-serif">الغطاء الأمامي يساعد على إبقاء الأحذية نظيفة، ويجعل المنظم يبدو هادئا ومرتبا حتى عندما يكون ممتلئا.</font></p><ul><li><font face="Cairo, Arial, sans-serif">يحمي من الغبار والرطوبة الخفيفة داخل البيت.</font></li><li><font face="Cairo, Arial, sans-serif">يمكن فتحه وإغلاقه بسرعة حسب الحاجة.</font></li><li><font face="Cairo, Arial, sans-serif">جيوب جانبية صغيرة للمفاتيح أو الأدوات الخفيفة.</font></li></ul>',
        mediaUrl: 'product-media/covered-shoe-organizer/shoe-organizer-04-materials.jpeg',
        mediaType: 'image',
        reverse: true,
        backgroundColor: '#fff3df',
        textColor: '#3b2710',
      },
      {
        id: 'shoe-organizer-detail-3',
        title: '',
        text: 'تركيب سريع',
        richTextHtml: '<h2 style="text-align: right;"><font face="Cairo, Arial, sans-serif"><b>يركب بسهولة وبدون أدوات</b></font></h2><p style="text-align: right;"><font face="Cairo, Arial, sans-serif">الفكرة بسيطة: أنابيب خفيفة، وصلات واضحة، ورفوف يمكن ترتيبها حسب نوع الأحذية الموجودة عندك.</font></p><ul><li><font face="Cairo, Arial, sans-serif">تركيب سريع في البيت بدون حفر أو أدوات خاصة.</font></li><li><font face="Cairo, Arial, sans-serif">رفوف قابلة للإزالة لتوفير مكان للأحذية العالية.</font></li><li><font face="Cairo, Arial, sans-serif">خفيف ويمكن نقله من مكان لآخر عند الحاجة.</font></li></ul>',
        mediaUrl: 'product-media/covered-shoe-organizer/shoe-organizer-03-dimensions.jpeg',
        mediaType: 'image',
        reverse: false,
        backgroundColor: '#e8f7ef',
        textColor: '#0f3d2e',
      },
      {
        id: 'shoe-organizer-detail-4',
        title: '',
        text: 'اختيار مناسب للبيوت الصغيرة',
        richTextHtml: '<h2 style="text-align: right;"><font face="Cairo, Arial, sans-serif"><b>حل مناسب للشقق والبيوت الصغيرة</b></font></h2><p style="text-align: right;"><font face="Cairo, Arial, sans-serif">إذا كان المكان محدودا، فالمنظم العمودي يعطيك مساحة أكبر بدون أن يأخذ عرضا كبيرا من الغرفة.</font></p><ul><li><font face="Cairo, Arial, sans-serif">مفيد للعائلات، الطلبة، أو أي بيت يحتاج ترتيب سريع.</font></li><li><font face="Cairo, Arial, sans-serif">يحافظ على الأحذية واضحة بدل تكديسها في الأكياس.</font></li><li><font face="Cairo, Arial, sans-serif">الدفع عند الاستلام بعد تأكيد الطلب عبر واتساب.</font></li></ul>',
        mediaUrl: 'product-media/covered-shoe-organizer/shoe-organizer-02-rooms.jpeg',
        mediaType: 'image',
        reverse: true,
        backgroundColor: '#eef6ff',
        textColor: '#12314d',
      },
    ],
    specs: [
      ['عدد الطبقات', '7 طبقات'],
      ['السعة', 'حتى 36 زوجا حسب حجم الأحذية'],
      ['الغطاء', 'غطاء قماشي يحمي من الغبار ويحافظ على شكل مرتب'],
      ['التركيب', 'تركيب سريع بدون أدوات خاصة'],
      ['الاستخدام', 'المدخل، غرفة النوم، الخزانة أو بيت الطلبة'],
      ['الدفع', 'الدفع عند الاستلام'],
      ['التوصيل', 'توصيل مجاني داخل طنجة خلال 24 إلى 48 ساعة'],
    ],
    variantOptions: [],
    variants: [],
    isVisible: true,
    sortOrder: -10,
  },
  {
    id: 'anti-sweat-undershirt-morocco',
    slug: 'anti-sweat-undershirt-morocco',
    title: 'قميص داخلي مضاد لتسرب العرق والرائحة',
    category: 'الأزياء والإكسسوارات',
    price: 179,
    priceLabel: '179 درهم',
    oldPrice: '230 درهم',
    badge: 'توصيل مجاني',
    image: 'product-media/anti-sweat-undershirt/product-01-viba_men_white_tshirt_antitranspirant_front.webp',
    gallery: [
      'product-media/anti-sweat-undershirt/product-01-viba_men_white_tshirt_antitranspirant_front.webp',
      'product-media/anti-sweat-undershirt/product-04-viba_men_black_tshirt_antitranspirant_front.webp',
      'product-media/anti-sweat-undershirt/product-03-viba_men_white_tshirt_antitranspirant_underarm.webp',
      'product-media/anti-sweat-undershirt/product-08-product-technology.webp',
      'product-media/anti-sweat-undershirt/product-10-product-seize-_ar.webp',
      'product-media/anti-sweat-undershirt/product-13-product-seize-female.jpg',
    ],
    description: 'قميص داخلي مريح يساعدك تحافظ على مظهر أنيق طوال اليوم، ويقلل من تسرب العرق والرائحة إلى القميص الخارجي. مناسب للاستعمال اليومي في العمل، الدراسة، المناسبات والتنقل.',
    stock: 75,
    delivery: 'توصيل مجاني إلى جميع المدن المغربية',
    reviewsEnabled: true,
    manualReviewsEnabled: true,
    showRelated: true,
    showPolicies: true,
    details: [
      {
        id: 'anti-sweat-detail-1',
        title: 'حماية يومية من بقع العرق',
        text: 'صمم هذا القميص الداخلي ليستعمل تحت القميص أو التيشيرت، مع منطقة حماية خاصة تحت الإبط تساعد على تقليل تسرب العرق وظهور البقع على الملابس الخارجية.',
        mediaUrl: 'product-media/anti-sweat-undershirt/product-03-viba_men_white_tshirt_antitranspirant_underarm.webp',
        mediaType: 'image',
        reverse: false,
      },
      {
        id: 'anti-sweat-detail-2',
        title: 'قطن ناعم ومرونة مريحة',
        text: 'مصنوع من 95% قطن عالي الجودة و5% إيلاستين، ليبقى خفيفا وناعما على الجسم ومناسبا للاستعمال اليومي في العمل، الدراسة، التنقل والمناسبات.',
        mediaUrl: 'product-media/anti-sweat-undershirt/product-08-product-technology.webp',
        mediaType: 'image',
        reverse: true,
      },
      {
        id: 'anti-sweat-detail-3',
        title: 'اختيارات للرجال والنساء',
        text: 'متوفر بتصميم مناسب للرجال والنساء، وباللونين الأبيض والأسود، مع مقاسات من S حتى XXL لتسهيل اختيار المقاس المناسب قبل تأكيد الطلب.',
        mediaUrl: 'product-media/anti-sweat-undershirt/product-13-product-seize-female.jpg',
        mediaType: 'image',
        reverse: false,
      },
    ],
    specs: [
      ['الخامة', '95% قطن عالي الجودة، 5% إيلاستين'],
      ['الألوان', 'أبيض وأسود'],
      ['المقاسات', 'S, M, L, XL, XXL'],
      ['العرض', 'لباس واحد 179 درهم، 2 ب 338 درهم، 3 ب 447 درهم'],
      ['الدفع', 'الدفع عند الاستلام'],
      ['التوصيل', 'توصيل مجاني إلى جميع المدن المغربية'],
    ],
    variantOptions: [
      {
        id: 'anti-sweat-offer',
        type: 'bundle',
        label: 'العرض',
        values: [
          { id: 'anti-sweat-offer-1', label: 'لباس واحد' },
          { id: 'anti-sweat-offer-2', label: '2 ألبسة' },
          { id: 'anti-sweat-offer-3', label: '3 ألبسة' },
        ],
      },
      {
        id: 'anti-sweat-gender',
        type: 'style',
        label: 'التصميم',
        values: [
          { id: 'anti-sweat-men', label: 'للرجال' },
          { id: 'anti-sweat-women', label: 'للنساء' },
        ],
      },
      {
        id: 'anti-sweat-color',
        type: 'color',
        label: 'اللون',
        values: [
          { id: 'anti-sweat-white', label: 'أبيض', color: '#f7f5ef' },
          { id: 'anti-sweat-black', label: 'أسود', color: '#17201b' },
        ],
      },
      {
        id: 'anti-sweat-size',
        type: 'size',
        label: 'المقاس',
        values: [
          { id: 'anti-sweat-size-s', label: 'S' },
          { id: 'anti-sweat-size-m', label: 'M' },
          { id: 'anti-sweat-size-l', label: 'L' },
          { id: 'anti-sweat-size-xl', label: 'XL' },
          { id: 'anti-sweat-size-xxl', label: 'XXL' },
        ],
      },
    ],
    variants: [
      { id: 'anti-sweat-offer-1-variant', name: 'لباس واحد', sku: 'TM-ANTI-SWEAT-1', priceLabel: '179 درهم', stock: 75, enabled: true, optionValues: { العرض: 'لباس واحد' } },
      { id: 'anti-sweat-offer-2-variant', name: '2 ألبسة', sku: 'TM-ANTI-SWEAT-2', priceLabel: '338 درهم', stock: 60, enabled: true, optionValues: { العرض: '2 ألبسة' } },
      { id: 'anti-sweat-offer-3-variant', name: '3 ألبسة', sku: 'TM-ANTI-SWEAT-3', priceLabel: '447 درهم', stock: 45, enabled: true, optionValues: { العرض: '3 ألبسة' } },
      { id: 'anti-sweat-men-variant', name: 'للرجال', sku: 'TM-ANTI-SWEAT-MEN', priceLabel: '179 درهم', stock: 40, enabled: true, image: 'product-media/anti-sweat-undershirt/product-01-viba_men_white_tshirt_antitranspirant_front.webp', optionValues: { التصميم: 'للرجال' } },
      { id: 'anti-sweat-women-variant', name: 'للنساء', sku: 'TM-ANTI-SWEAT-WOMEN', priceLabel: '179 درهم', stock: 35, enabled: true, image: 'product-media/anti-sweat-undershirt/product-13-product-seize-female.jpg', optionValues: { التصميم: 'للنساء' } },
      { id: 'anti-sweat-white-variant', name: 'أبيض', sku: 'TM-ANTI-SWEAT-WHT', priceLabel: '179 درهم', stock: 38, enabled: true, image: 'product-media/anti-sweat-undershirt/product-01-viba_men_white_tshirt_antitranspirant_front.webp', optionValues: { اللون: 'أبيض' } },
      { id: 'anti-sweat-black-variant', name: 'أسود', sku: 'TM-ANTI-SWEAT-BLK', priceLabel: '179 درهم', stock: 37, enabled: true, image: 'product-media/anti-sweat-undershirt/product-04-viba_men_black_tshirt_antitranspirant_front.webp', optionValues: { اللون: 'أسود' } },
      { id: 'anti-sweat-size-s-variant', name: 'S', sku: 'TM-ANTI-SWEAT-S', priceLabel: '179 درهم', stock: 12, enabled: true, optionValues: { المقاس: 'S' } },
      { id: 'anti-sweat-size-m-variant', name: 'M', sku: 'TM-ANTI-SWEAT-M', priceLabel: '179 درهم', stock: 18, enabled: true, optionValues: { المقاس: 'M' } },
      { id: 'anti-sweat-size-l-variant', name: 'L', sku: 'TM-ANTI-SWEAT-L', priceLabel: '179 درهم', stock: 20, enabled: true, optionValues: { المقاس: 'L' } },
      { id: 'anti-sweat-size-xl-variant', name: 'XL', sku: 'TM-ANTI-SWEAT-XL', priceLabel: '179 درهم', stock: 15, enabled: true, optionValues: { المقاس: 'XL' } },
      { id: 'anti-sweat-size-xxl-variant', name: 'XXL', sku: 'TM-ANTI-SWEAT-XXL', priceLabel: '179 درهم', stock: 10, enabled: true, optionValues: { المقاس: 'XXL' } },
    ],
  },
  {
    id: 'portable-juice-blender-test',
    slug: 'portable-juice-blender-test',
    title: 'خلاط عصائر محمول USB بكأس شفاف',
    category: 'المنزل والمطبخ',
    price: 159,
    priceLabel: '159 درهم',
    oldPrice: '230 درهم',
    badge: 'اختبار صفحة الإضافة',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=82',
    gallery: [
      'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=1000&q=82',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1000&q=82',
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1000&q=82',
    ],
    description: 'خلاط خفيف لتحضير العصائر في البيت أو المكتب، يشحن عبر USB ويأتي بكأس شفاف سهل الحمل والتنظيف.',
    stock: 26,
    delivery: '24 إلى 48 ساعة',
    reviewsEnabled: true,
    manualReviewsEnabled: true,
    showRelated: true,
    showPolicies: true,
    details: [
      {
        id: 'portable-blender-detail-1',
        title: 'تحضير سريع بدون أجهزة كبيرة',
        text: 'صمم هذا الخلاط للاستعمال اليومي السريع: أضف الفواكه الطرية، الماء أو الحليب، وشغل الخلط مباشرة داخل الكأس. مناسب للعصائر الخفيفة بعد الرياضة أو في المكتب.',
        mediaUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1000&q=82',
        mediaType: 'image',
        reverse: false,
      },
      {
        id: 'portable-blender-detail-2',
        title: 'كأس محمول وسهل التنظيف',
        text: 'الكأس الشفاف يسمح برؤية المكونات أثناء الخلط، ويمكن شطفه بسرعة بعد الاستعمال. حجمه مناسب للحقيبة أو رف المطبخ بدون أخذ مساحة كبيرة.',
        mediaUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1000&q=82',
        mediaType: 'image',
        reverse: true,
      },
    ],
    specs: [
      ['الشحن', 'USB قابل لإعادة الشحن'],
      ['السعة', 'كأس عملي للاستعمال اليومي'],
      ['الاستعمال', 'عصائر خفيفة وفواكه طرية'],
      ['التوصيل', 'داخل طنجة خلال 24 إلى 48 ساعة'],
    ],
    variants: [
      { id: 'portable-blender-white', name: 'أبيض', sku: 'TM-BLENDER-WHT', priceLabel: '159 درهم', stock: 11, enabled: true },
      { id: 'portable-blender-green', name: 'أخضر', sku: 'TM-BLENDER-GRN', priceLabel: '159 درهم', stock: 9, enabled: true },
      { id: 'portable-blender-pink', name: 'وردي', sku: 'TM-BLENDER-PNK', priceLabel: '169 درهم', stock: 6, enabled: true },
    ],
  },
  {
    id: 'smart-watch',
    slug: 'smart-watch',
    title: 'ساعة ذكية مقاومة للماء ببطارية طويلة',
    category: 'الإلكترونيات',
    price: 249,
    priceLabel: '249 درهم',
    oldPrice: '360 درهم',
    badge: 'الأكثر طلبا',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'تتبع النشاط والمكالمات والتنبيهات اليومية، مناسبة للاستعمال في العمل والرياضة والتنقل داخل المدينة.',
  },
  {
    id: 'kitchen-organizer',
    slug: 'kitchen-organizer',
    title: 'منظم مطبخ متعدد الاستعمال',
    category: 'المنزل والمطبخ',
    price: 149,
    priceLabel: '149 درهم',
    oldPrice: '220 درهم',
    badge: 'تخفيض 32%',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'حل عملي لترتيب أدوات المطبخ وتوفير مساحة إضافية فوق الرفوف أو قرب الحوض.',
  },
  {
    id: 'daily-care-set',
    slug: 'daily-care-set',
    title: 'مجموعة عناية يومية للبشرة',
    category: 'العناية والجمال',
    price: 199,
    priceLabel: '199 درهم',
    oldPrice: '290 درهم',
    badge: 'وصل حديثا',
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'مجموعة يومية خفيفة للعناية بالبشرة، مناسبة للهدايا والاستعمال الشخصي.',
  },
  {
    id: 'travel-bag',
    slug: 'travel-bag',
    title: 'حقيبة سفر خفيفة متعددة الجيوب',
    category: 'السفر والحقائب',
    price: 179,
    priceLabel: '179 درهم',
    oldPrice: '260 درهم',
    badge: 'كمية محدودة',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'حقيبة خفيفة للرحلات القصيرة والتنقل اليومي، مع جيوب منظمة وسعة جيدة.',
  },
  {
    id: 'wireless-earbuds',
    slug: 'wireless-earbuds',
    title: 'سماعات بلوتوث صغيرة بعزل صوتي',
    category: 'الإلكترونيات',
    price: 169,
    priceLabel: '169 درهم',
    oldPrice: '240 درهم',
    badge: 'جاهز للتوصيل',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'سماعات صغيرة للاستعمال اليومي، مناسبة للمكالمات والتنقل والعمل.',
  },
  {
    id: 'fast-charger',
    slug: 'fast-charger',
    title: 'شاحن سريع متعدد المنافذ',
    category: 'إكسسوارات الهاتف',
    price: 99,
    priceLabel: '99 درهم',
    oldPrice: '150 درهم',
    badge: 'سعر محدود',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'شاحن عملي للمنزل والمكتب، يدعم أكثر من جهاز في الوقت نفسه.',
  },
  {
    id: 'phone-stand',
    slug: 'phone-stand',
    title: 'حامل هاتف للمكتب والسيارة',
    category: 'إكسسوارات الهاتف',
    price: 79,
    priceLabel: '79 درهم',
    oldPrice: '120 درهم',
    badge: 'عرض اليوم',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'حامل ثابت للهاتف أثناء العمل أو القيادة، مع زاوية مشاهدة مريحة.',
  },
  {
    id: 'desk-lamp',
    slug: 'desk-lamp',
    title: 'مصباح مكتبي قابل للشحن',
    category: 'المنزل والمكتب',
    price: 129,
    priceLabel: '129 درهم',
    oldPrice: '190 درهم',
    badge: 'جديد',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'مصباح أنيق بإضاءة هادئة للقراءة والعمل، مع بطارية قابلة للشحن.',
  },
  {
    id: 'storage-boxes',
    slug: 'storage-boxes',
    title: 'مجموعة علب تخزين شفافة',
    category: 'المنزل والمطبخ',
    price: 119,
    priceLabel: '119 درهم',
    oldPrice: '170 درهم',
    badge: 'منظم',
    image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'علب شفافة لترتيب المطبخ والخزائن، تسهل رؤية المحتوى بسرعة.',
  },
  {
    id: 'travel-steamer',
    slug: 'travel-steamer',
    title: 'مكواة بخار محمولة للسفر',
    category: 'السفر والمنزل',
    price: 189,
    priceLabel: '189 درهم',
    oldPrice: '270 درهم',
    badge: 'عملي',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'مكواة محمولة لإزالة التجاعيد بسرعة في السفر أو قبل الخروج.',
  },
  {
    id: 'sport-phone-belt',
    slug: 'sport-phone-belt',
    title: 'حزام رياضي خفيف للهاتف',
    category: 'رياضة وتنقل',
    price: 89,
    priceLabel: '89 درهم',
    oldPrice: '130 درهم',
    badge: 'مفيد يوميا',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'حزام خفيف لحمل الهاتف والمفاتيح أثناء المشي أو الجري.',
  },
  {
    id: 'cleaning-brush',
    slug: 'cleaning-brush',
    title: 'فرشاة تنظيف كهربائية صغيرة',
    category: 'العناية والمنزل',
    price: 139,
    priceLabel: '139 درهم',
    oldPrice: '210 درهم',
    badge: 'تخفيض',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'فرشاة صغيرة لتنظيف الزوايا والأسطح اليومية بسرعة وجهد أقل.',
  },
];

export function productRoute(slug: string) {
  return `#/product/${slug}`;
}

export function categoryRoute(id: string) {
  return `#/category/${encodeURIComponent(id)}`;
}

export type CollectionId = 'all' | 'bestsellers' | 'offers' | 'new-arrivals';

export function collectionRoute(id: CollectionId) {
  return id === 'all' ? '#/products' : `#/collection/${id}`;
}

export function searchRoute(query: string) {
  return `#/search?q=${encodeURIComponent(query.trim())}`;
}

export function parseProductSlug(hash: string) {
  const match = hash.match(/^#\/product\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function parseCategoryId(hash: string) {
  const match = hash.match(/^#\/category\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function parseCollectionId(hash: string): CollectionId | null {
  if (hash === '#/products') return 'all';
  const match = hash.match(/^#\/collection\/([^/?#]+)/);
  if (!match) return null;
  const id = decodeURIComponent(match[1]);
  return ['bestsellers', 'offers', 'new-arrivals'].includes(id) ? id as CollectionId : null;
}

export function parseSearchQuery(hash: string) {
  const query = hash.split('?')[1] || '';
  return new URLSearchParams(query).get('q') || '';
}

export function cartItemFromProduct(product: Product, quantity = 1, variant?: string): CartItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    priceLabel: product.priceLabel,
    quantity,
    image: product.image,
    variant,
  };
}

export function orderTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function productsForCategory(productList: Product[], categoryId: string | null) {
  if (!categoryId) return productList;
  const category = categories.find(item => item.id === categoryId);
  if (!category) return productList;
  return productList.filter(product => product.category === category.title || product.category.includes(category.title.split(' ')[0]));
}

function priceNumber(label: string) {
  const match = label.replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function discountValue(product: Product) {
  return Math.max(0, priceNumber(product.oldPrice) - product.price);
}

export function collectionTitle(id: CollectionId) {
  if (id === 'bestsellers') return 'الأكثر طلبا';
  if (id === 'offers') return 'عروض مختارة';
  if (id === 'new-arrivals') return 'وصل حديثا';
  return 'كل المنتجات';
}

export function productsForCollection(productList: Product[], id: CollectionId) {
  const available = productList.filter(product => product.stock !== 0);
  if (id === 'all') return available;
  if (id === 'new-arrivals') return available;
  if (id === 'offers') {
    return available
      .filter(product => discountValue(product) > 0 || product.badge.includes('تخفيض') || product.badge.includes('عرض'))
      .sort((a, b) => discountValue(b) - discountValue(a));
  }

  return [...available].sort((a, b) => {
    const aPopular = a.badge.includes('الأكثر') ? 1 : 0;
    const bPopular = b.badge.includes('الأكثر') ? 1 : 0;
    return bPopular - aPopular || discountValue(b) - discountValue(a) || (b.stock ?? 0) - (a.stock ?? 0);
  });
}

export function searchProducts(productList: Product[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return productList;
  return productList.filter(product => `${product.title} ${product.category} ${product.badge}`.toLowerCase().includes(normalized));
}

export function buildWhatsAppOrderUrl(order: StoredOrder, settings: StoreSettings) {
  const phone = settings.whatsappNumber.replace(/[^\d]/g, '') || defaultSettings.whatsappNumber;
  const labels = {
    newOrder: '\u0637\u0644\u0628 \u062c\u062f\u064a\u062f \u0645\u0646',
    orderNumber: '\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628',
    name: '\u0627\u0644\u0627\u0633\u0645',
    phone: '\u0627\u0644\u0647\u0627\u062a\u0641',
    address: '\u0627\u0644\u0639\u0646\u0648\u0627\u0646',
    note: '\u0645\u0644\u0627\u062d\u0638\u0629',
    products: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a',
    options: '\u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631\u0627\u062a',
    quantity: '\u0627\u0644\u0643\u0645\u064a\u0629',
    total: '\u0627\u0644\u0645\u062c\u0645\u0648\u0639',
    cod: '\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
    currency: '\u062f\u0631\u0647\u0645',
  };
  const items = order.items.map((item, index) => {
    const variant = item.variant ? `\n   ${labels.options}: ${item.variant}` : '';
    return `${index + 1}. ${item.title}${variant}\n   ${labels.quantity}: ${item.quantity}\n   ${labels.total}: ${item.price * item.quantity} ${labels.currency}`;
  }).join('\n');
  const message = [
    `${labels.newOrder} ${settings.storeName}`,
    `${labels.orderNumber}: ${order.id}`,
    `${labels.name}: ${order.name}`,
    `${labels.phone}: ${order.phone}`,
    `${labels.address}: ${order.address}`,
    order.note ? `${labels.note}: ${order.note}` : '',
    '',
    labels.products,
    items,
    '',
    `${labels.total}: ${order.total} ${labels.currency}`,
    labels.cod,
  ].filter(Boolean).join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export function parseOrderForm(event: FormEvent<HTMLFormElement>, source: string, items: CartItem[]): OrderDraft | null {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const note = String(formData.get('note') || '').trim();

  if (!name || !phone || !address) {
    form.reportValidity();
    return null;
  }

  form.reset();
  return { name, phone, address, note, source, items };
}
