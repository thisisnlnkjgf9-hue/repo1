import { useEffect, useState } from 'react';
import NavTabs from '../components/NavTabs';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

export default function FeedbackPage() {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.getFeedbacks().then((res) => setFeedbacks(res.feedbacks)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !rating) {
      toast.warning('Please enter your name and rating.');
      return;
    }

    try {
      await api.submitFeedback({ name, rating, comment });
      toast.success('Thank you for your feedback! ✓');
      setName('');
      setRating(0);
      setComment('');

      const res = await api.getFeedbacks();
      setFeedbacks(res.feedbacks);
    } catch {
      toast.error('Could not submit feedback. Please try again.');
    }
  };

  return (
    <>
      <NavTabs />
      <main className="page feedback-page">
        <h1>Feedbacks</h1>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <h2>Share Your Experience</h2>

          <div className="form-group">
            <label htmlFor="fb-name">Your Name</label>
            <input
              id="fb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= rating ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fb-comment">Comment</label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={3}
            />
          </div>

          <button type="submit" className="next-btn">
            Submit Feedback
          </button>
        </form>

        <div className="feedback-list">
          {feedbacks.map((fb) => (
            <article key={fb.id || fb._id} className="feedback-card">
              <div className="feedback-card-header">
                <h3>{fb.name}</h3>
                <span className="feedback-stars">
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </span>
              </div>
              <p>{fb.comment}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
