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
  const { name, category, priceInr, stock, tags, description } = req.body;
  const image = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.image || '');
  if (!name || !priceInr) return res.status(400).json({ message: 'name and priceInr are required.' });

  if (isMongoConnected()) {
    const product = await Product.create({
      name, category: category || 'general', priceInr: Number(priceInr), stock: Number(stock) || 0,
      tags: tags ? tags.split(',').map(t => t.trim()) : [], description, image
    });
    return res.status(201).json({ product });
  }
  const product = { id: `prod_${Date.now()}`, name, category: category || 'general', priceInr: Number(priceInr), stock: Number(stock) || 0, tags: tags ? tags.split(',').map(t => t.trim()) : [], description, image };
  memProducts.push(product);
  return res.status(201).json({ product });
}

export async function adminUpdateProduct(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  if (req.file) updates.image = req.file.cloudUrl || `/uploads/${req.file.filename}`;
  if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t => t.trim());
  if (updates.priceInr) updates.priceInr = Number(updates.priceInr);
  if (updates.stock) updates.stock = Number(updates.stock);

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
export async function adminGetHeroSlides(_req, res) {
  if (isMongoConnected()) {
    const heroSlides = await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ heroSlides });
  }

  const slides = [...memHeroSlides].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return res.json({ heroSlides: slides });
}

export async function adminCreateHeroSlide(req, res) {
  const { title = '', subtitle = '', order = 0, isActive = 'true' } = req.body;
  const image = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.image || '');

  if (!image) {
    return res.status(400).json({ message: 'image is required.' });
  }

  const payload = {
    title,
    subtitle,
    image,
    order: Number(order) || 0,
    isActive: String(isActive) !== 'false'
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
