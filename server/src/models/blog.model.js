import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    date: { type: String, default: '' },
    image: { type: String, default: '' },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export const Blog =
  mongoose.models.Blog || mongoose.model('Blog', blogSchema);
