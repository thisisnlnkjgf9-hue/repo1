import { useState, useEffect } from 'react';
import { api } from '../api';
import { useRazorpay } from '../hooks/useRazorpay';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function DoctorsPage() {
  const { user, isLoggedIn } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const { pay } = useRazorpay();
  const toast = useToast();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slot, setSlot] = useState('10:00 AM');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        setDoctors(res.doctors || []);
      } catch (error) {
        toast.error('Could not load doctors from the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [toast]);

  const bookDoctor = (doctor) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.warning('Please enter name, email, and phone number before booking.');
      return;
    }

    setSaving(true);
    pay({
      amount: doctor.consultationFee,
      description: `Consultation — ${doctor.name}`,
      onSuccess: async (paymentData) => {
        try {
          await api.createBooking({
            userId,
            doctorId: doctor._id || doctor.id,
            slot,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            paymentMethod: 'razorpay',
            razorpayOrderId: paymentData.razorpay_order_id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpaySignature: paymentData.razorpay_signature
          });

          toast.success(`Booked successfully with ${doctor.name}. Appointment saved.`);
          setSelectedDoctorId(doctor._id || doctor.id);
        } catch (error) {
          toast.error(error.message || 'Booking failed. Please try again.');
        } finally {
          setSaving(false);
        }
      },
      onDismiss: () => {
        setSaving(false);
      },
      onError: (error) => {
        toast.error(error?.message || 'Payment failed. Booking was not created.');
        setSaving(false);
      }
    });
  };

  return (
    <main className="page doctors-page">
      <h1>Doctor Appointment Booking</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 16 }}>
        Consult with verified Ayurvedic experts from the comfort of your home.
      </p>

      <section className="doctor-booking-form" style={{ marginBottom: 20 }}>
        <div className="search-row" style={{ position: 'static', width: '100%', borderWidth: 1.5 }}>
          <input
            placeholder="Your full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="search-row" style={{ position: 'static', width: '100%', borderWidth: 1.5, marginTop: 10 }}>
          <input
            placeholder="Email address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div className="search-row" style={{ position: 'static', width: '100%', borderWidth: 1.5, marginTop: 10 }}>
          <input
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="search-row" style={{ position: 'static', width: '100%', borderWidth: 1.5, marginTop: 10 }}>
          <input
            placeholder="Preferred slot (e.g. 10:00 AM)"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          />
        </div>
      </section>

      {loading && <p style={{ padding: 20 }}>Loading doctors...</p>}
      {!loading && doctors.length === 0 && <p style={{ padding: 20 }}>No doctors found.</p>}
      {!loading && doctors.map((doctor) => {
        const docId = doctor._id || doctor.id;
        return (
          <article key={docId} className="doctor-card">
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p>
                {doctor.qualifications} ({doctor.specialization}) · {doctor.yearsExperience} years experience
              </p>
              <p className="fee" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16, marginBottom: 12 }}>
                Consultation Fee: ₹{doctor.consultationFee}
              </p>
              <button type="button" onClick={() => bookDoctor(doctor)} disabled={saving}>
                {saving && selectedDoctorId === docId ? 'Processing...' : 'Book an Appointment'}
              </button>
            </div>
            <div className="doctor-avatar" style={{ fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F5F0', border: '2px solid var(--line)', overflow: 'hidden' }}>
              {doctor.image ? <img src={doctor.image} alt={doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍⚕️'}
            </div>
          </article>
        );
      })}

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login required for booking"
        message="Please sign in with Google to book a doctor appointment."
      />
    </main>
  );
}
