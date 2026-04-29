import jwt from 'jsonwebtoken';
import { Blog } from '../models/blog.model.js';
import { Product } from '../models/product.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { Booking } from '../models/booking.model.js';
import { Feedback } from '../models/feedback.model.js';
import { Therapy } from '../models/therapy.model.js';
import { TherapyPackage } from '../models/therapyPackage.model.js';
import { TherapyBooking } from '../models/therapyBooking.model.js';
import { HeroSlide } from '../models/heroSlide.model.js';
import { SitePage } from '../models/sitePage.model.js';
import { Podcast } from '../models/podcast.model.js';
import { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } from '../config/env.js';
import { isMongoConnected } from '../config/db.js';
import {
  blogs as memBlogs,
  products as memProducts,
  doctors as memDoctors,
  orders as memOrders,
  users as memUsers,
  heroSlides as memHeroSlides
} from '../data/store.js';

/* ───── Admin Login ───── */
export function adminLogin(req, res) {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, message: 'Admin login successful.' });
  }
  return res.status(401).json({ message: 'Invalid admin credentials.' });
}

/* ───── Admin Auth Middleware ───── */
export function adminRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Admin token required.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    req.admin = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid admin token.' });
  }
}

/* ═══════════════════════════════════════════════
   BLOGS CRUD
   ═══════════════════════════════════════════════ */
export async function adminGetBlogs(_req, res) {
  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Blogs are available only from cloud database.' });
  }
  const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
  return res.json({ blogs });
}

export async function adminCreateBlog(req, res) {
  const { title, excerpt, body, date, tags } = req.body;
  const image = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.image || '');
  if (!title) return res.status(400).json({ message: 'title is required.' });

  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Cannot create blog in cloud database.' });
  }
  const blog = await Blog.create({ title, excerpt, body, date, image, tags: tags ? tags.split(',').map(t => t.trim()) : [] });
  return res.status(201).json({ blog });
}

export async function adminUpdateBlog(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  if (req.file) updates.image = req.file.cloudUrl || `/uploads/${req.file.filename}`;
  if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t => t.trim());

  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Cannot update blog in cloud database.' });
  }
  const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
  if (!blog) return res.status(404).json({ message: 'Blog not found.' });
  return res.json({ blog });
}

export async function adminDeleteBlog(req, res) {
  const { id } = req.params;
  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Cannot delete blog in cloud database.' });
  }
  await Blog.findByIdAndDelete(id);
  return res.json({ message: 'Blog deleted.' });
}

/* ═══════════════════════════════════════════════
   PRODUCTS CRUD
   ═══════════════════════════════════════════════ */
export async function adminGetProducts(_req, res) {
  if (isMongoConnected()) {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ products });
  }
  return res.json({ products: memProducts });
}

export async function adminCreateProduct(req, res) {
  const { name, category, priceInr, stock, tags, description, originalPrice, discountPercent, packOffers } = req.body;
  // Primary image: req.files.image[0] (from fields upload) or fallback
  const primaryFile = req.files?.image?.[0];
  const image2File  = req.files?.image2?.[0];
  const image3File  = req.files?.image3?.[0];
  const image = primaryFile ? (primaryFile.cloudUrl || `/uploads/${primaryFile.filename}`) : (req.body.image || '');
  const images = [
    image2File ? (image2File.cloudUrl || `/uploads/${image2File.filename}`) : '',
    image3File ? (image3File.cloudUrl || `/uploads/${image3File.filename}`) : '',
  ].filter(Boolean);
  if (!name || !priceInr) return res.status(400).json({ message: 'name and priceInr are required.' });

  let parsedPackOffers = [];
  if (packOffers) {
    try { parsedPackOffers = typeof packOffers === 'string' ? JSON.parse(packOffers) : packOffers; } catch { parsedPackOffers = []; }
  }

  if (isMongoConnected()) {
    const product = await Product.create({
      name, category: category || 'general', priceInr: Number(priceInr),
      originalPrice: Number(originalPrice) || 0, discountPercent: Number(discountPercent) || 0,
      stock: Number(stock) || 0,
      tags: tags ? tags.split(',').map(t => t.trim()) : [], description, image, images, packOffers: parsedPackOffers
    });
    return res.status(201).json({ product });
  }
  const product = { id: `prod_${Date.now()}`, name, category: category || 'general', priceInr: Number(priceInr), originalPrice: Number(originalPrice) || 0, discountPercent: Number(discountPercent) || 0, stock: Number(stock) || 0, tags: tags ? tags.split(',').map(t => t.trim()) : [], description, image, images, packOffers: parsedPackOffers };
  memProducts.push(product);
  return res.status(201).json({ product });
}

export async function adminUpdateProduct(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  // Primary image from req.files.image[0]
  const primaryFile = req.files?.image?.[0];
  const image2File  = req.files?.image2?.[0];
  const image3File  = req.files?.image3?.[0];
  if (primaryFile) updates.image = primaryFile.cloudUrl || `/uploads/${primaryFile.filename}`;
  if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t => t.trim());
  if (updates.priceInr) updates.priceInr = Number(updates.priceInr);
  if (updates.stock) updates.stock = Number(updates.stock);
  if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice) || 0;
  if (updates.discountPercent !== undefined) updates.discountPercent = Number(updates.discountPercent) || 0;
  if (updates.packOffers && typeof updates.packOffers === 'string') {
    try { updates.packOffers = JSON.parse(updates.packOffers); } catch { delete updates.packOffers; }
  }
  // Build images array: prefer uploaded files, fall back to existing URL text fields
  const img2 = image2File ? (image2File.cloudUrl || `/uploads/${image2File.filename}`) : (updates.image2 || null);
  const img3 = image3File ? (image3File.cloudUrl || `/uploads/${image3File.filename}`) : (updates.image3 || null);
  const extraImages = [img2, img3].filter(Boolean);
  if (image2File || image3File) updates.images = extraImages;
  delete updates.image2; delete updates.image3;

  if (isMongoConnected()) {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ product });
  }
  const index = memProducts.findIndex(p => p.id === id || p._id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found.' });
  memProducts[index] = { ...memProducts[index], ...updates };
  return res.json({ product: memProducts[index] });
}

export async function adminDeleteProduct(req, res) {
  const { id } = req.params;
  if (isMongoConnected()) {
    await Product.findByIdAndDelete(id);
    return res.json({ message: 'Product deleted.' });
  }
  const index = memProducts.findIndex(p => p.id === id || p._id === id);
  if (index !== -1) memProducts.splice(index, 1);
  return res.json({ message: 'Product deleted.' });
}

/* ═══════════════════════════════════════════════
   DOCTORS CRUD
   ═══════════════════════════════════════════════ */
export async function adminGetDoctors(_req, res) {
  if (isMongoConnected()) {
    const doctors = await Doctor.find().sort({ createdAt: -1 }).lean();
    return res.json({ doctors });
  }
  return res.json({ doctors: memDoctors });
}

export async function adminCreateDoctor(req, res) {
  const { name, qualifications, specialization, yearsExperience, consultationFee } = req.body;
  const image = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.image || '');
  if (!name || !qualifications) return res.status(400).json({ message: 'name and qualifications are required.' });

  if (isMongoConnected()) {
    const doctor = await Doctor.create({
      name, qualifications, specialization: specialization || '',
      yearsExperience: Number(yearsExperience) || 0, consultationFee: Number(consultationFee) || 0, image
    });
    return res.status(201).json({ doctor });
  }
  const doctor = { id: `doc_${Date.now()}`, name, qualifications, specialization, yearsExperience: Number(yearsExperience) || 0, consultationFee: Number(consultationFee) || 0, image };
  memDoctors.push(doctor);
  return res.status(201).json({ doctor });
}

export async function adminUpdateDoctor(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  if (req.file) updates.image = req.file.cloudUrl || `/uploads/${req.file.filename}`;
  if (updates.yearsExperience) updates.yearsExperience = Number(updates.yearsExperience);
  if (updates.consultationFee) updates.consultationFee = Number(updates.consultationFee);

  if (isMongoConnected()) {
    const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    return res.json({ doctor });
  }
  const index = memDoctors.findIndex(d => d.id === id || d._id === id);
  if (index === -1) return res.status(404).json({ message: 'Doctor not found.' });
  memDoctors[index] = { ...memDoctors[index], ...updates };
  return res.json({ doctor: memDoctors[index] });
}

export async function adminDeleteDoctor(req, res) {
  const { id } = req.params;
  if (isMongoConnected()) {
    await Doctor.findByIdAndDelete(id);
    return res.json({ message: 'Doctor deleted.' });
  }
  const index = memDoctors.findIndex(d => d.id === id || d._id === id);
  if (index !== -1) memDoctors.splice(index, 1);
  return res.json({ message: 'Doctor deleted.' });
}

/* ═══════════════════════════════════════════════
   ORDERS (read-only for admin)
   ═══════════════════════════════════════════════ */
export async function adminGetOrders(_req, res) {
  if (isMongoConnected()) {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json({ orders });
  }
  const all = [];
  for (const [userId, userOrders] of Object.entries(memOrders)) {
    userOrders.forEach(o => all.push({ ...o, userId }));
  }
  return res.json({ orders: all });
}

/* ═══════════════════════════════════════════════
   USERS (read-only for admin)
   ═══════════════════════════════════════════════ */
export async function adminGetUsers(_req, res) {
  if (isMongoConnected()) {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json({ users });
  }
  return res.json({ users: memUsers });
}

/* ═══════════════════════════════════════════════
   BOOKINGS (read-only for admin)
   ═══════════════════════════════════════════════ */
export async function adminGetBookings(_req, res) {
  if (isMongoConnected()) {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    return res.json({ bookings });
  }
  return res.json({ bookings: [] });
}

/* ═══════════════════════════════════════════════
   FEEDBACKS (read-only for admin)
   ═══════════════════════════════════════════════ */
export async function adminGetFeedbacks(_req, res) {
  if (isMongoConnected()) {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    return res.json({ feedbacks });
  }
  return res.json({ feedbacks: [] });
}

/* ═══════════════════════════════════════════════
   HERO SLIDES CRUD
   ═══════════════════════════════════════════════ */
const SUPABASE_PRODUCTS = 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/nouryum/site/products';
const FALLBACK_PRODUCT_SLIDES = [
  { label: 'Herbal Hair Care',  image: `${SUPABASE_PRODUCTS}/product1.jpeg`, order: 1 },
  { label: 'Ayurvedic Shampoo', image: `${SUPABASE_PRODUCTS}/product2.jpeg`, order: 2 },
  { label: 'Natural Oils',      image: `${SUPABASE_PRODUCTS}/product3.jpeg`, order: 3 },
  { label: 'Root Strengthener', image: `${SUPABASE_PRODUCTS}/product4.jpeg`, order: 4 },
  { label: 'Scalp Therapy',     image: `${SUPABASE_PRODUCTS}/product5.jpeg`, order: 5 },
  { label: 'Herbal Blend',      image: `${SUPABASE_PRODUCTS}/product6.jpeg`, order: 6 },
  { label: 'Pure Botanicals',   image: `${SUPABASE_PRODUCTS}/product7.jpeg`, order: 7 },
];

export async function adminGetHeroSlides(_req, res) {
  if (isMongoConnected()) {
    // Auto-seed product slides on first visit if none exist yet
    const productCount = await HeroSlide.countDocuments({ type: 'product' });
    if (productCount === 0) {
      await HeroSlide.insertMany(
        FALLBACK_PRODUCT_SLIDES.map(s => ({ ...s, type: 'product', isActive: true, title: '', subtitle: '' }))
      );
    }
    const heroSlides = await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ heroSlides });
  }

  // Fallback: merge static hero slides + product slides
  const combined = [
    ...memHeroSlides,
    ...FALLBACK_PRODUCT_SLIDES.map((s, i) => ({ ...s, id: `ps${i + 1}`, type: 'product', isActive: true })),
  ].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return res.json({ heroSlides: combined });
}

export async function adminCreateHeroSlide(req, res) {
  const { title = '', subtitle = '', label = '', order = 0, isActive = 'true', type = 'hero' } = req.body;
  const image = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.image || '');

  if (!image) {
    return res.status(400).json({ message: 'image is required.' });
  }

  const payload = {
    title,
    subtitle,
    label,
    image,
    order: Number(order) || 0,
    isActive: String(isActive) !== 'false',
    type: ['hero', 'product'].includes(type) ? type : 'hero'
  };

  if (isMongoConnected()) {
    const heroSlide = await HeroSlide.create(payload);
    return res.status(201).json({ heroSlide });
  }

  const heroSlide = {
    id: `hs_${Date.now()}`,
    ...payload
  };
  memHeroSlides.push(heroSlide);
  return res.status(201).json({ heroSlide });
}

export async function adminUpdateHeroSlide(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  if (req.file) updates.image = req.file.cloudUrl || `/uploads/${req.file.filename}`;
  if (updates.order !== undefined) updates.order = Number(updates.order) || 0;
  if (updates.isActive !== undefined) updates.isActive = String(updates.isActive) !== 'false';
  if (updates.type && !['hero', 'product'].includes(updates.type)) delete updates.type;

  if (isMongoConnected()) {
    const heroSlide = await HeroSlide.findByIdAndUpdate(id, updates, { new: true });
    if (!heroSlide) return res.status(404).json({ message: 'Hero slide not found.' });
    return res.json({ heroSlide });
  }

  const index = memHeroSlides.findIndex((slide) => slide.id === id || slide._id === id);
  if (index === -1) return res.status(404).json({ message: 'Hero slide not found.' });
  memHeroSlides[index] = { ...memHeroSlides[index], ...updates };
  return res.json({ heroSlide: memHeroSlides[index] });
}

export async function adminDeleteHeroSlide(req, res) {
  const { id } = req.params;

  if (isMongoConnected()) {
    await HeroSlide.findByIdAndDelete(id);
    return res.json({ message: 'Hero slide deleted.' });
  }

  const index = memHeroSlides.findIndex((slide) => slide.id === id || slide._id === id);
  if (index !== -1) memHeroSlides.splice(index, 1);
  return res.json({ message: 'Hero slide deleted.' });
}

/* ═══════════════════════════════════════════════
   DASHBOARD STATS
   ═══════════════════════════════════════════════ */
export async function adminDashboard(_req, res) {
  if (isMongoConnected()) {
    const [blogCount, productCount, doctorCount, orderCount, userCount, bookingCount] = await Promise.all([
      Blog.countDocuments(), Product.countDocuments(), Doctor.countDocuments(),
      Order.countDocuments(), User.countDocuments(), Booking.countDocuments()
    ]);
    return res.json({ blogCount, productCount, doctorCount, orderCount, userCount, bookingCount });
  }
  return res.json({
    blogCount: memBlogs.length, productCount: memProducts.length, doctorCount: memDoctors.length,
    orderCount: 0, userCount: memUsers.length, bookingCount: 0
  });
}

/* ═══════════════════════════════════════════════
   UPDATE STATUSES (Orders & Bookings)
   ═══════════════════════════════════════════════ */
export async function adminUpdateOrder(req, res) {
  if (isMongoConnected()) {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status, shipmentStatus: req.body.shipmentStatus }, { new: true });
    return res.json({ order });
  }
  return res.json({ message: 'Order updated.' });
}

export async function adminUpdateBooking(req, res) {
  if (isMongoConnected()) {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    return res.json({ booking });
  }
  return res.json({ message: 'Booking updated.' });
}

/* ═══════════════════════════════════════════════
   THERAPIES CRUD
   ═══════════════════════════════════════════════ */
export async function adminGetTherapies(_req, res) {
  if (isMongoConnected()) {
    const therapies = await Therapy.find().sort({ createdAt: -1 }).lean();
    return res.json({ therapies });
  }
  return res.json({ therapies: [] });
}

export async function adminCreateTherapy(req, res) {
  if (isMongoConnected()) {
    const data = { ...req.body };
    if (data.bestFor && typeof data.bestFor === 'string') data.bestFor = data.bestFor.split(',').map(s=>s.trim());
    const therapy = await Therapy.create(data);
    return res.status(201).json({ therapy });
  }
  return res.json({ message: 'Disabled without mongo' });
}

export async function adminUpdateTherapy(req, res) {
  if (isMongoConnected()) {
    const data = { ...req.body };
    if (data.bestFor && typeof data.bestFor === 'string') data.bestFor = data.bestFor.split(',').map(s=>s.trim());
    const therapy = await Therapy.findByIdAndUpdate(req.params.id, data, { new: true });
    return res.json({ therapy });
  }
}

export async function adminDeleteTherapy(req, res) {
  if (isMongoConnected()) {
    await Therapy.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Therapy deleted.' });
  }
}

/* ═══════════════════════════════════════════════
   THERAPY PACKAGES CRUD
   ═══════════════════════════════════════════════ */
export async function adminGetTherapyPackages(_req, res) {
  if (isMongoConnected()) {
    const packages = await TherapyPackage.find().sort({ createdAt: -1 }).lean();
    return res.json({ therapyPackages: packages });
  }
  return res.json({ therapyPackages: [] });
}

export async function adminCreateTherapyPackage(req, res) {
  if (isMongoConnected()) {
    const data = { ...req.body };
    if (data.extras && typeof data.extras === 'string') data.extras = data.extras.split(',').map(s=>s.trim());
    if (typeof data.includes === 'string') {
      try { data.includes = JSON.parse(data.includes); } catch { data.includes = []; }
    }
    const pkg = await TherapyPackage.create(data);
    return res.status(201).json({ therapyPackage: pkg });
  }
}

export async function adminUpdateTherapyPackage(req, res) {
  if (isMongoConnected()) {
    const data = { ...req.body };
    if (data.extras && typeof data.extras === 'string') data.extras = data.extras.split(',').map(s=>s.trim());
    if (typeof data.includes === 'string') {
      try { data.includes = JSON.parse(data.includes); } catch { delete data.includes; }
    }
    const pkg = await TherapyPackage.findByIdAndUpdate(req.params.id, data, { new: true });
    return res.json({ therapyPackage: pkg });
  }
}

export async function adminDeleteTherapyPackage(req, res) {
  if (isMongoConnected()) {
    await TherapyPackage.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Package deleted.' });
  }
}

/* ═══════════════════════════════════════════════
   THERAPY BOOKINGS (read/update)
   ═══════════════════════════════════════════════ */
export async function adminGetTherapyBookings(_req, res) {
  if (isMongoConnected()) {
    const bookings = await TherapyBooking.find().sort({ createdAt: -1 }).lean();
    return res.json({ therapyBookings: bookings });
  }
  return res.json({ therapyBookings: [] });
}

export async function adminUpdateTherapyBooking(req, res) {
  if (isMongoConnected()) {
    const booking = await TherapyBooking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    return res.json({ therapyBooking: booking });
  }
}

/* ═══════════════════════════════════════════════
   SITE PAGES (about / contact / tnc)
   ═══════════════════════════════════════════════ */
const SITE_PAGE_DEFAULTS = {
  about:   { title: 'About Us',      content: 'About Nouryum...' },
  contact: { title: 'Contact Us',    content: 'Email: hello@nouryum.com\nPhone: +91-XXXXXXXXXX\nAddress: ...' },
  tnc:     { title: 'Terms & Conditions', content: 'By using Nouryum, you agree to our Terms and Conditions...' },
};

export async function adminGetSitePages(_req, res) {
  if (!isMongoConnected()) return res.json({ sitePages: [] });
  const sitePages = await SitePage.find().lean();
  // Ensure all three slugs exist
  const slugs = sitePages.map(p => p.slug);
  for (const [slug, def] of Object.entries(SITE_PAGE_DEFAULTS)) {
    if (!slugs.includes(slug)) {
      const p = await SitePage.create({ slug, ...def });
      sitePages.push(p);
    }
  }
  return res.json({ sitePages });
}

export async function adminGetSitePage(req, res) {
  const { slug } = req.params;
  if (!isMongoConnected()) {
    return res.json({ sitePage: { slug, ...SITE_PAGE_DEFAULTS[slug] } });
  }
  let page = await SitePage.findOne({ slug }).lean();
  if (!page) {
    page = await SitePage.create({ slug, ...SITE_PAGE_DEFAULTS[slug] });
  }
  return res.json({ sitePage: page });
}

export async function adminUpdateSitePage(req, res) {
  const { slug } = req.params;
  const { title, content } = req.body;
  if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected.' });
  const page = await SitePage.findOneAndUpdate(
    { slug }, { title, content }, { new: true, upsert: true }
  );
  return res.json({ sitePage: page });
}

/* ═══════════════════════════════════════════════
   PODCASTS CRUD
   ═══════════════════════════════════════════════ */

/** Convert any YouTube watch/short/embed URL → embed URL */
function toYouTubeEmbedUrl(raw) {
  if (!raw) return '';
  if (raw.includes('youtube.com/embed/')) return raw.trim();
  const shortMatch = raw.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = raw.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortsMatch = raw.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  return raw.trim();
}

export async function adminGetPodcasts(_req, res) {
  if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected.' });
  const podcasts = await Podcast.find().sort({ order: 1, createdAt: -1 }).lean();
  return res.json({ podcasts });
}

export async function adminCreatePodcast(req, res) {
  const { title, description, youtubeUrl, isActive, order } = req.body;
  if (!title || !youtubeUrl) return res.status(400).json({ message: 'title and youtubeUrl are required.' });
  if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected.' });
  const podcast = await Podcast.create({
    title,
    description: description || '',
    youtubeUrl: toYouTubeEmbedUrl(youtubeUrl),
    isActive: String(isActive) !== 'false',
    order: Number(order) || 0,
  });
  return res.status(201).json({ podcast });
}

export async function adminUpdatePodcast(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.youtubeUrl) updates.youtubeUrl = toYouTubeEmbedUrl(updates.youtubeUrl);
  if (updates.isActive !== undefined) updates.isActive = String(updates.isActive) !== 'false';
  if (updates.order !== undefined) updates.order = Number(updates.order) || 0;
  if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected.' });
  const podcast = await Podcast.findByIdAndUpdate(id, updates, { new: true });
  if (!podcast) return res.status(404).json({ message: 'Podcast not found.' });
  return res.json({ podcast });
}

export async function adminDeletePodcast(req, res) {
  if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected.' });
  await Podcast.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Podcast deleted.' });
}

