import { Router } from 'express';
import {
  adminLogin, adminRequired,
  adminGetBlogs, adminCreateBlog, adminUpdateBlog, adminDeleteBlog,
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetDoctors, adminCreateDoctor, adminUpdateDoctor, adminDeleteDoctor,
  adminGetOrders, adminUpdateOrder, adminGetUsers, adminGetBookings, adminUpdateBooking, adminGetFeedbacks,
  adminGetTherapies, adminCreateTherapy, adminUpdateTherapy, adminDeleteTherapy,
  adminGetTherapyPackages, adminCreateTherapyPackage, adminUpdateTherapyPackage, adminDeleteTherapyPackage,
  adminGetTherapyBookings, adminUpdateTherapyBooking,
  adminGetHeroSlides, adminCreateHeroSlide, adminUpdateHeroSlide, adminDeleteHeroSlide,
  adminGetSitePages, adminGetSitePage, adminUpdateSitePage,
  adminGetPodcasts, adminCreatePodcast, adminUpdatePodcast, adminDeletePodcast,
  adminDashboard
} from '../controllers/admin.controller.js';
import { uploadImage, uploadToCloud, uploadMultipleToCloud } from '../middlewares/upload.middleware.js';

/* multer field config for products (primary + 2 extra images) */
const productImageFields = uploadImage.fields([
  { name: 'image',  maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);

const router = Router();

/* Auth */
router.post('/login', adminLogin);

/* Dashboard */
router.get('/dashboard', adminRequired, adminDashboard);

/* Blogs */
router.get('/blogs', adminRequired, adminGetBlogs);
router.post('/blogs', adminRequired, uploadImage.single('image'), uploadToCloud, adminCreateBlog);
router.put('/blogs/:id', adminRequired, uploadImage.single('image'), uploadToCloud, adminUpdateBlog);
router.delete('/blogs/:id', adminRequired, adminDeleteBlog);

/* Products */
router.get('/products', adminRequired, adminGetProducts);
router.post('/products', adminRequired, productImageFields, uploadMultipleToCloud, adminCreateProduct);
router.put('/products/:id', adminRequired, productImageFields, uploadMultipleToCloud, adminUpdateProduct);
router.delete('/products/:id', adminRequired, adminDeleteProduct);

/* Doctors */
router.get('/doctors', adminRequired, adminGetDoctors);
router.post('/doctors', adminRequired, uploadImage.single('image'), uploadToCloud, adminCreateDoctor);
router.put('/doctors/:id', adminRequired, uploadImage.single('image'), uploadToCloud, adminUpdateDoctor);
router.delete('/doctors/:id', adminRequired, adminDeleteDoctor);

/* Orders (read/update) */
router.get('/orders', adminRequired, adminGetOrders);
router.put('/orders/:id', adminRequired, adminUpdateOrder);

/* Users (read-only) */
router.get('/users', adminRequired, adminGetUsers);

/* Bookings (read/update) */
router.get('/bookings', adminRequired, adminGetBookings);
router.put('/bookings/:id', adminRequired, adminUpdateBooking);

/* Therapies */
router.get('/therapies', adminRequired, adminGetTherapies);
router.post('/therapies', adminRequired, adminCreateTherapy);
router.put('/therapies/:id', adminRequired, adminUpdateTherapy);
router.delete('/therapies/:id', adminRequired, adminDeleteTherapy);

/* Therapy Packages */
router.get('/therapyPackages', adminRequired, adminGetTherapyPackages);
router.post('/therapyPackages', adminRequired, adminCreateTherapyPackage);
router.put('/therapyPackages/:id', adminRequired, adminUpdateTherapyPackage);
router.delete('/therapyPackages/:id', adminRequired, adminDeleteTherapyPackage);

/* Therapy Bookings */
router.get('/therapyBookings', adminRequired, adminGetTherapyBookings);
router.put('/therapyBookings/:id', adminRequired, adminUpdateTherapyBooking);

/* Feedbacks (read-only) */
router.get('/feedbacks', adminRequired, adminGetFeedbacks);

/* Home Hero / Product Showcase Slides */
router.get('/heroSlides', adminRequired, adminGetHeroSlides);
router.post('/heroSlides', adminRequired, uploadImage.single('image'), uploadToCloud, adminCreateHeroSlide);
router.put('/heroSlides/:id', adminRequired, uploadImage.single('image'), uploadToCloud, adminUpdateHeroSlide);
router.delete('/heroSlides/:id', adminRequired, adminDeleteHeroSlide);

/* Site Pages (about / contact / tnc) */
router.get('/sitePages', adminRequired, adminGetSitePages);
router.get('/sitePages/:slug', adminRequired, adminGetSitePage);
router.put('/sitePages/:slug', adminRequired, adminUpdateSitePage);

/* Podcasts */
router.get('/podcasts', adminRequired, adminGetPodcasts);
router.post('/podcasts', adminRequired, adminCreatePodcast);
router.put('/podcasts/:id', adminRequired, adminUpdatePodcast);
router.delete('/podcasts/:id', adminRequired, adminDeletePodcast);

export default router;
