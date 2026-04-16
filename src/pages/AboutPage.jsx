import NavTabs from '../components/NavTabs';

export default function AboutPage() {
  return (
    <>
      <NavTabs />
      <main className="page about-page">
        <section className="about-card">
          <h1>About Us</h1>
          <p>
            <strong>Nouryum</strong> is an innovative digital health platform built on the principles of Ayurveda, aiming to make holistic healthcare simple, personalized, and accessible to all. Founded and led by CEO Pallavi Pal, Nouryum brings together the wisdom of Ayurveda with the power of modern technology.
          </p>
          <p>
            We focus on understanding each individual through Prakriti-based assessment and provide customized diet plans, lifestyle guidance, and herbal support tailored to their unique needs. By integrating AI-driven insights with traditional knowledge, Nouryum offers practical solutions for modern lifestyle disorders.
          </p>
          <p>
            Our platform also enables easy doctor consultations, home-based diagnostic services, and educational content to promote awareness and preventive care.
          </p>
          <p>
            At Nouryum, we believe healthcare should go beyond treating illness—it should help people live in balance, stay healthy, and take control of their well-being.
          </p>
          <p>
            We are not just building a platform; we are creating a new way of living.
          </p>
          <p className="about-highlight" style={{ fontSize: '18px', fontWeight: 600 }}>
            🌿 Promote Balance • Preserve Vitality • Prevent Imbalance • Prosper Naturally 🌺
          </p>
        </section>
      </main>
    </>
  );
}
