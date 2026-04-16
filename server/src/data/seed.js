import { Blog } from '../models/blog.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Feedback } from '../models/feedback.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { Therapy } from '../models/therapy.model.js';
import { TherapyPackage } from '../models/therapyPackage.model.js';
import { blogs, doctors, products, users } from './store.js';
import { therapies, therapyPackages } from './weightAndTherapy.js';

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(
        users.map((u) => ({
          name: u.name,
          email: u.email,
          prakriti: u.prakriti,
          healthProfile: u.healthProfile
        }))
      );
      console.log('Seeded users.');
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.insertMany(doctors);
      console.log('Seeded doctors.');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(products);
      console.log('Seeded products.');
    }

    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany(blogs);
      console.log('Seeded blogs.');
    }

    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
      await Feedback.insertMany([
        {
          name: 'Pallavi Pal',
          rating: 5,
          comment:
            'Nouryum helped me understand my Prakriti and gave me a personalized diet plan. Wonderful platform!'
        },
        {
          name: 'Zara Khan',
          rating: 5,
          comment:
            'Booking a doctor appointment was so easy. The Ayurvedic approach really works for my sleep issues.'
        },
        {
          name: 'Rohit Mehra',
          rating: 4,
          comment:
            'Great product selection and the AI symptom checker gave me helpful insights. Highly recommend.'
        }
      ]);
      console.log('Seeded feedbacks.');
    }

    /* ── Panchakarma therapies ── */
    const therapyCount = await Therapy.countDocuments();
    if (therapyCount === 0) {
      await Therapy.insertMany(therapies);
      console.log('Seeded therapies.');
    }

    /* ── Therapy packages ── */
    const packageCount = await TherapyPackage.countDocuments();
    if (packageCount === 0) {
      await TherapyPackage.insertMany(therapyPackages);
      console.log('Seeded therapy packages.');
    }
  } catch (error) {
    console.warn('Seed error (non-critical):', error.message);
  }
}
