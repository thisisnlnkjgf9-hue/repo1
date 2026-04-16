import { useState } from 'react';
import NavTabs from '../components/NavTabs';

const CHAKRA_BLOGS = [
  {
    id: 'muladhara',
    tab: '1. Muladhara (Root)',
    title: 'Muladhara (Root Chakra) - Stability and Grounding',
    ayurvedicView: 'Element: Earth | Dominant Dosha: Kapha | Linked with bones, legs, and survival instincts',
    imbalance: 'Fear, insecurity, fatigue, and lack of stability.',
    yoga: ['Tadasana (Mountain Pose) - improves grounding', 'Malasana (Garland Pose) - activates pelvic base', 'Vrikshasana (Tree Pose) - enhances balance'],
    support: ['Warm, nourishing foods (ghee, root vegetables)', 'Daily routine (Dinacharya)', 'Abhyanga (oil massage) with sesame oil']
  },
  {
    id: 'swadhisthana',
    tab: '2. Swadhisthana (Sacral)',
    title: 'Swadhisthana (Sacral Chakra) - Emotions and Creativity',
    ayurvedicView: 'Element: Water | Dosha: Kapha + Vata',
    imbalance: 'Emotional instability, low creativity, and hormonal imbalance.',
    yoga: ['Baddha Konasana (Butterfly Pose)', 'Bhujangasana (Cobra Pose)', 'Anjaneyasana (Low Lunge)'],
    support: ['Hydrating foods and juicy fruits', 'Herbs like Shatavari', 'Creative expression (art, music, journaling)']
  },
  {
    id: 'manipura',
    tab: '3. Manipura (Solar Plexus)',
    title: 'Manipura (Solar Plexus) - Power and Digestion',
    ayurvedicView: 'Element: Fire | Dosha: Pitta | Center of Agni',
    imbalance: 'Poor digestion, anger, and low confidence.',
    yoga: ['Navasana (Boat Pose) - strengthens core', 'Dhanurasana (Bow Pose)', 'Surya Namaskar (Sun Salutation)'],
    support: ['Use digestive spices (ginger, cumin)', 'Mindful eating habits', 'Avoid overeating and processed foods']
  },
  {
    id: 'anahata',
    tab: '4. Anahata (Heart)',
    title: 'Anahata (Heart Chakra) - Love and Compassion',
    ayurvedicView: 'Element: Air | Dosha: Vata',
    imbalance: 'Grief, emotional block, and anxiety.',
    yoga: ['Ustrasana (Camel Pose)', 'Matsyasana (Fish Pose)', 'Setu Bandhasana (Bridge Pose)'],
    support: ['Pranayama (Anulom Vilom)', 'Herbal teas (Tulsi, Arjuna)', 'Gratitude and emotional release practices']
  },
  {
    id: 'vishuddha',
    tab: '5. Vishuddha (Throat)',
    title: 'Vishuddha (Throat Chakra) - Expression and Truth',
    ayurvedicView: 'Element: Ether | Dosha: Vata',
    imbalance: 'Difficulty expressing and throat-related issues.',
    yoga: ['Sarvangasana (Shoulder Stand)', 'Halasana (Plow Pose)', 'Simhasana (Lion Pose)'],
    support: ['Warm fluids and herbal gargles (Gandusha)', 'Mantra chanting', 'Honest communication']
  },
  {
    id: 'ajna',
    tab: '6. Ajna (Third Eye)',
    title: 'Ajna (Third Eye) - Intuition and Focus',
    ayurvedicView: 'Linked with mind (Manas) | Dosha: Vata + Pitta',
    imbalance: 'Overthinking and lack of clarity.',
    yoga: ['Balasana (Child\'s Pose)', 'Padmasana (Lotus Pose)', 'Shambhavi Mudra (Gaze Meditation)'],
    support: ['Meditation (Dhyana)', 'Nasya therapy', 'Herbs: Brahmi, Shankhpushpi']
  },
  {
    id: 'sahasrara',
    tab: '7. Sahasrara (Crown)',
    title: 'Sahasrara (Crown Chakra) - Consciousness and Awareness',
    ayurvedicView: 'Beyond Doshas | Pure consciousness',
    imbalance: 'Disconnection and lack of purpose.',
    yoga: ['Savasana (Deep Relaxation)', 'Sukhasana (Meditative Sitting)', 'Silent meditation and mindfulness'],
    support: ['Spiritual study (Svadhyaya)', 'Silence and introspection', 'Connection with higher consciousness']
  }
];

export default function ChakrasPage() {
  const [activeChakraTab, setActiveChakraTab] = useState(CHAKRA_BLOGS[0].id);
  const activeChakra = CHAKRA_BLOGS.find((item) => item.id === activeChakraTab) || CHAKRA_BLOGS[0];

  return (
    <>
      <NavTabs />
      <main className="page blogs-page">
        <section>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Understanding Chakras with Ayurvedic and Yogic Integration</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 18 }}>
            Each chakra represents a junction of physical, emotional, and energetic health. By combining Ayurvedic lifestyle with specific yoga asanas and pranayama, we can activate and balance these centers effectively.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {CHAKRA_BLOGS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveChakraTab(item.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: activeChakraTab === item.id ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: activeChakraTab === item.id ? 'rgba(197, 157, 95, 0.12)' : 'var(--bg-white)',
                  color: 'var(--ink)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {item.tab}
              </button>
            ))}
          </div>

          <article style={{ border: '1px solid var(--line)', borderRadius: 14, background: 'var(--bg-white)', padding: 20 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: 'var(--ink)' }}>{activeChakra.title}</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 12 }}><strong>Ayurvedic View:</strong> {activeChakra.ayurvedicView}</p>
            <p style={{ color: 'var(--muted)', marginBottom: 14 }}><strong>Imbalance Signs:</strong> {activeChakra.imbalance}</p>

            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 17, marginBottom: 6, color: 'var(--ink)' }}>Yoga Practices</h4>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.6 }}>
                {activeChakra.yoga.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: 17, marginBottom: 6, color: 'var(--ink)' }}>Ayurvedic Support</h4>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.6 }}>
                {activeChakra.support.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>

          <div style={{ marginTop: 24, border: '1px solid var(--line)', borderRadius: 14, background: 'var(--bg-white)', padding: 20 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>Panchakarma (Detoxification)</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
              An advanced Ayurvedic purification experience designed to gently eliminate Ama (toxins), refine the Srotas (subtle body channels), and reawaken the natural flow of Prana. This process restores deep internal harmony, leaving the body light, revitalized, and energetically aligned.
            </p>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>Yoga and Pranayama</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
              A curated integration of movement and breathwork that aligns body, mind, and energy. Through conscious asanas and controlled breathing, these practices activate and balance the chakras, enhancing vitality, focus, and inner equilibrium.
            </p>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>Manas Chikitsa (Mental Wellness)</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
              A refined approach to emotional wellbeing that blends meditation, mindfulness, and mantra therapy. It gently dissolves emotional blockages, quiets mental fluctuations, and cultivates a state of clarity, resilience, and inner stillness.
            </p>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>Final Insight</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10 }}>
              Chakra alignment is not a temporary fix. It is a refined way of living. It emerges from consistent awareness, intentional habits, and a deep connection with oneself.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
              When Agni burns optimally, Doshas remain in perfect balance, and Prana flows effortlessly, the chakras synchronize naturally, resulting in elevated vitality, mental clarity, and profound inner peace.
            </p>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>Ayurvedic Perspective on Diabetes</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
              Ayurveda says disease happens due to imbalance of three Doshas: Vata, Pitta, and Kapha.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
              In diabetes, Kapha Dosha is usually disturbed first, and later Vata becomes dominant in the chronic stage.
            </p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 8 }}>
              A weak digestive fire (Agni) creates toxins (Ama), which block body channels (Srotas), especially affecting Meda (fat tissue), Mamsa (muscle tissue), and Ojas (immunity and vitality). As a result, sugar metabolism gets disturbed and sugar increases in blood and urine.
            </p>

            <h4 style={{ fontSize: 18, marginBottom: 6, color: 'var(--ink)' }}>Causes (Nidana)</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
              <li>Excess sweet foods and heavy diet patterns (rice, wheat, potatoes, excess dairy, fried foods).</li>
              <li>Eating again before the previous meal digests properly.</li>
              <li>Sedentary lifestyle, day sleep, stress, and irregular routine.</li>
              <li>Mental factors like excessive worry, stress, and anxiety.</li>
              <li>Genetic tendency if parents have diabetes.</li>
            </ul>

            <h4 style={{ fontSize: 18, marginBottom: 6, color: 'var(--ink)' }}>Common Symptoms (Lakshana)</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
              <li>Frequent urination and excess thirst.</li>
              <li>Increased hunger, weakness, and later-stage weight loss.</li>
              <li>Sticky or sweet urine and burning sensation in hands or feet.</li>
            </ul>

            <h4 style={{ fontSize: 18, marginBottom: 6, color: 'var(--ink)' }}>Ayurvedic Types</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
              <li>Kapha type (early stage): obesity, lethargy, heavy body.</li>
              <li>Vata type (chronic stage): weight loss, weakness, dryness.</li>
            </ul>

            <h4 style={{ fontSize: 18, marginBottom: 6, color: 'var(--ink)' }}>Diet and Lifestyle (Pathya-Apathya)</h4>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}><strong>What to eat:</strong> barley (Yava), green vegetables, bitter foods like neem and karela, pulses like moong dal, and warm light food.</p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 6 }}><strong>What to avoid:</strong> sugar, sweets, bakery items, cold drinks, heavy oily food, and excess dairy.</p>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}><strong>Lifestyle focus:</strong> daily exercise (walking, yoga), avoiding day sleep, maintaining healthy weight, and following a regular routine.</p>
          </div>
        </section>
      </main>
    </>
  );
}
