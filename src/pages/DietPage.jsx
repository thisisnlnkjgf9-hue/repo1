import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   SVASTAVRTTA — SVASTHAVRTTA REFERENCE DATA
   Source: Svasthavrtta textbook (Ṛtucaryā, Trayopastambha, Āhāra Pravicāra)
   Pages: 37, 48–53, 67, 78
───────────────────────────────────────────────────────────────────────────── */

// Page 37 — Ṛtu Calendar Table
const RTU_CALENDAR = [
  { rtu: 'Śiśira',  rasi: ['Makaraṁ', 'Kumbham'],   sakaVarsa: ['Māgha / Tapa', 'Phālguṇa / Tapasya'],   month: ['Jan 15 – Feb 15', 'Feb 15 – Mar 15'],    rasa: 'Tikta' },
  { rtu: 'Vasanta', rasi: ['Mīnam', 'Meṣa'],          sakaVarsa: ['Caitra / Madhu', 'Vaiśākha / Mādhava'],  month: ['Mar 15 – Apr 15', 'Apr 15 – May 15'],    rasa: 'Kaṣāya' },
  { rtu: 'Grīṣma',  rasi: ['Vṛṣabha', 'Mithuna'],     sakaVarsa: ['Jyeṣṭha / Śuci', 'Āṣāḍha / Śukra'],    month: ['May 15 – Jun 15', 'Jun 15 – Jul 15'],    rasa: 'Kaṭu' },
  { rtu: 'Varṣā',   rasi: ['Karkaṭaka', 'Siṁha'],     sakaVarsa: ['Śrāvaṇa / Nabha', 'Bhādrapada / Nabhasya'], month: ['Jul 15 – Aug 15', 'Aug 15 – Sep 15'], rasa: 'Amla' },
  { rtu: 'Śarat',   rasi: ['Kanyā', 'Tulā'],           sakaVarsa: ['Āśvija / Iśa', 'Kārtika / Ūrja'],       month: ['Sep 15 – Oct 15', 'Oct 15 – Nov 15'],    rasa: 'Lavaṇa' },
  { rtu: 'Hemanta', rasi: ['Vṛścika', 'Dhanu'],        sakaVarsa: ['Mārgaśira / Saha', 'Puṣya / Sahasya'],   month: ['Nov 15 – Dec 15', 'Dec 15 – Jan 15'],    rasa: 'Madhura' },
];

// Pages 48–53 — Full Ṛtucaryā per season
const RITUCARYA = {
  grisma: {
    label: 'Grīṣma (Summer)',
    pages: 'Pages 48–49',
    features: null,
    bodyEffects: null,
    pathyaDiet: [
      'Water mixed with sugar, mango juice, tender coconut water, and gruels made of corn flour.',
      'Water kept in a new earthen vessel; water scented with Pātala and Karpūra.',
      'Buffalo\'s milk with sugar candy at night.',
      'Saktu (roasted grain flour) with ghee and sugar.',
      'Meat of terrestrial animals (Jāṅgala māṁsa), ghee, milk, and Śāli rice.',
    ],
    pathyaLifestyle: [],
    apathyaDiet: [
      'Kaṭu (pungent), Amla (sour), and Lavaṇa (salty) rasas.',
      'Alcoholic preparations — if one is addicted to alcohol, it should be consumed mixed with a large quantity of water.',
    ],
    apathyaLifestyle: [
      'Exercise, exposure to fire, prolonged sunlight, exertion, and sexual intercourse.',
    ],
    treatment: null,
  },

  varsa: {
    label: 'Varṣā (Monsoon / Rainy)',
    pages: 'Pages 49–50',
    features: [
      'Rivers are filled with water; by the force of current, trees on the banks are uprooted.',
      'Lakes look beautiful with blossoming white and blue lotus flowers.',
      'The earth is covered with grass so that pits cannot be made out; it appears beautiful with different types of grains.',
      'Rain comes with muffled sound without thunderbolts; sun and stars are covered with clouds in the sky.',
    ],
    bodyEffects: [
      'Medicines are of less potency in Varṣā ṛtu due to excess water content from rain and a sky full of clouds.',
      'Land moisture increases kliṇnatā (moistness) in the body along with coldness, producing mandāgni (reduced digestive fire), which leads to improper digestion (vidāha) and accumulation of pitta.',
      'Due to the effect of Ādāna kāla, both body and Agni are weak.',
      'Rain, clouds, ice, and cold wind — along with water vapour produced by the contact of cold rainwater and hot earth — cause doṣa kopa and further weaken Agni.',
      'Sour-tasting food items and unclean water further affect Agni and vitiate the doṣas; vāta especially becomes aggravated.',
      'Agnimāndya produces kapha-pitta prakopa due to improper digestion. Improper nourishment of dhātus causes vāta vṛddhi.',
    ],
    pathyaDiet: [
      'Medicated (saṁskārita) water; Śāli rice along with honey.',
      'Sour, salt, and unctuous food to pacify aggravated vāta in Varṣā ṛtu.',
      'Old barley, wheat, and rice that protect Agni; prepared meat soup and dāl soup (yūṣa).',
      'Small quantities of alcoholic preparations like Mādhvika and Ariṣṭa, mixed with honey.',
      'Rain water, boiled water, well water, or water from a reservoir (sarovara) for drinking.',
      'Honey in small quantities (it increases vāta but reduces excessive moisture / kliṇnatā in the body).',
      'Supernatant part of curds (dadhi mastu) mixed with powder of Sauvarcala salt and Pañcakola.',
      'Madira, Mādhvika, and Ariṣṭa diluted with water in small quantity.',
    ],
    pathyaLifestyle: [
      'Pragharsaṇa (rubbing), Udvartana (dry powder massage), and Dhūmapāna (medicated smoking) during bath.',
      'Rub with thick cloth after bathing; smear fragrant drugs like Agaru.',
      'Wear garlands of fragrant flowers and light, clean clothes.',
      'Preferably live upstairs to prevent moisture rising from the earth.',
      'Stay in a place devoid of moisture.',
    ],
    apathyaDiet: [
      'River water.',
      'Churned preparations (Udamantha) having more water content.',
    ],
    apathyaLifestyle: [
      'Day sleep, exposure to mist, excessive exercise, hot sun, and sexual intercourse.',
      'Exposing to rains and residing in damp places.',
    ],
    treatment: 'After purification of body — i.e., Vamana (emesis) and Virecana (purgation) — Niruha or Āsthāpana Basti (medicated enema) should be given.',
  },

  pravrt: {
    label: 'Prāvṛṭ (Early Rains)',
    pages: 'Page 50',
    features: [
      'Wind blows in the western direction; sky is full of lightning and clouds with thunderbolts.',
      'Earth is covered with delicate, dark-green coloured grass and brightened with Śakragopa (velvet mites / scarlet insects).',
      'Plants of Kadamba, Nipa, Kuṭaja, Sarja, and Ketaka beautify the earth in Prāvṛṭ ṛtu.',
    ],
    bodyEffects: [
      'Vāta gets aggravated during Prāvṛṭ ṛtu as excessive moisture and coldness in the atmosphere increase bodily kliṇnatā (moisture).',
      'Diseases like pain in the abdomen and flatulence are more prevalent in this ṛtu due to vāta sañcaya.',
      'Ṛtucaryā for Prāvṛṭ is similar to that of Varṣā ṛtu.',
    ],
    pathyaDiet: ['Follow Varṣā ṛtu dietary guidelines (see above).'],
    pathyaLifestyle: ['Follow Varṣā ṛtu lifestyle guidelines (see above).'],
    apathyaDiet: [],
    apathyaLifestyle: [],
    treatment: null,
  },

  sarat: {
    label: 'Śarat (Autumn)',
    pages: 'Pages 51–52',
    features: [
      'The sun shines with a copper colour and hotness; the sky is clear with white clouds.',
      'Ponds are filled with lotus leaves, vibrating by the touch of moving swans.',
      'The earth is filled with wet mud and ant-hills.',
      'Plants of Arjuna, Bāṇa, Saptaparṇi, Bandhūka, Kāśa, and Asana flower during this ṛtu.',
    ],
    bodyEffects: [
      'During Varṣā ṛtu the body becomes accustomed to coldness, and the sudden heat of the sun rays in Śarat makes the body hot and aggravates the pitta accumulated during Varṣā ṛtu.',
      'The pitta accumulated during Varṣā ṛtu gets aggravated in Śarat due to reduction of clouds and increased intensity of sun rays.',
      'The wet mud gets dried by this heat and produces paittika disorders.',
    ],
    pathyaDiet: [
      'Sweet, bitter, light, cold, and pitta-śāmaka (pitta-pacifying) food in the required quantity.',
      'Flesh of Lāva, Kapiñjala, Eṇa, Urabhra, and Śaśa (jāṅgala māṁsa — flesh of terrestrial / desert animals).',
      'Śāli variety of rice, barley, wheat.',
      'Hamsodaka — water purified by the rays of the sun during daytime and rays of the moon at night, and by the rising of the Agastya star. This water is devoid of doṣa, clear, pure, and like nectar (amṛta).',
      'Food having bitter, sweet, and astringent tastes — light in quality — consumed after experiencing genuine hunger.',
      'Śāli rice, green gram, sugar candy, gooseberry (Āmalakī), snake gourd (Paṭola), honey, and jāṅgala māṁsa.',
    ],
    pathyaLifestyle: [
      'Garlands made of flowers of Śarat ṛtu, along with clean cloth.',
      'Moonrays in the first three hours of night are conducive to health.',
      'Apply Candana (sandalwood) and Uśīra (vetiver); wear garlands of pearl and clean cloth.',
      'Spend time on the terrace of a white-washed house and enjoy moonlight in the first part of the night.',
      'Even in Kṛṣṇa pakṣa (dark fortnight), enjoy the cool breeze at night.',
    ],
    apathyaDiet: [
      'Fat, oil, mist, meat of marshy and aquatic animals, alkali (kṣāra), curds.',
      'Excessive eating, muscle fat (vasā), strong alcoholic preparations.',
    ],
    apathyaLifestyle: [
      'Mist, day sleep, and Prāgvāta (easterly wind), which increase kapha.',
      'Wind blowing from the eastern direction.',
    ],
    treatment: 'Expulsion of aggravated pitta should be done by purgation (Virecana) and blood-letting (Rakta Mokṣaṇa) after Sneha Pāna with bitter ghee at the end of Varṣā ṛtu.',
  },
};

// Page 53 — Ṛtu Sandhi, Ṛtu Harītakī, Ṛtu Viparyaya, Ṛtu Vaikārika
const RTU_SANDHI_DATA = {
  rtuSandhi: {
    title: 'Ṛtu Sandhi — Seasonal Junctions',
    page: 'Page 53',
    content: [
      'The last week of the preceding ṛtu and the first week of the incoming ṛtu together constitute Ṛtu Sandhi.',
      'The regimens (caryās) of the outgoing ṛtu should be discontinued gradually — Padāṁśa abhyāsa — and the regimens of the coming ṛtu should be gradually adopted.',
      'A sudden change in regimens during Ṛtu Sandhi may produce diseases due to Asātmyā (incompatibility / incompetence of the body to adapt).',
    ],
  },
  rtuHaritaki: {
    title: 'Ṛtu Harītakī — Seasonal Rasāyana',
    page: 'Page 53',
    content: 'Bhavaprakāśa emphasises the usage of Ṛtu Harītakī for deriving rejuvenation (rasāyana) effect. Harītakī should be taken with specific adjuvants during each season to achieve this effect.',
    table: [
      { rtu: 'Varṣā',   adjuvant: 'Saindhava Lavaṇa (Rock Salt)' },
      { rtu: 'Śarat',   adjuvant: 'Śarkarā (Sugar)' },
      { rtu: 'Hemanta', adjuvant: 'Śuṇṭhi (Dry Ginger)' },
      { rtu: 'Śiśira',  adjuvant: 'Kaṇā / Pippalī (Pepper Longum)' },
      { rtu: 'Vasanta', adjuvant: 'Madhu (Honey)' },
      { rtu: 'Grīṣma',  adjuvant: 'Guḍa (Jaggery)' },
    ],
  },
  rtuViparyaya: {
    title: 'Ṛtu Viparyaya — Seasonal Inversion',
    page: 'Page 53',
    content: [
      'A similar (samāna) intake of food and regimen with respect to the accumulated doṣas leads to their aggravation irrespective of the general rule of the ṛtu.',
      'Diet and regimens opposite (viparyaya) to the ṛtu help in alleviation of the aggravated doṣas.',
      'Samāna means similar to the accumulated doṣas; Viparyaya means opposite to the kāla (season) and the doṣa.',
    ],
  },
  rtuVaikari: {
    title: 'Ṛtu Vaikārika — Seasonal Aberration',
    page: 'Page 53',
    content: [
      'If features of the seasons are altered, the sun, moon, and stars appear differently. For instance, if stars are covered with dew during Grīṣma ṛtu, it predicts a seasonal variation.',
      'The Ṛtu Vikāras or Viṣamatā (seasonal aberrations) are caused due to air pollution and produce Janapadoddhvaṁsa (community-wide / epidemic-level diseases).',
    ],
  },
};

// Page 78 — Āhāra Pravicāra Indications (Svasthavrtta)
const AHARA_PRAVICARA = [
  {
    sn: 1,
    name: 'Śītāhāra (Cold / Cool food)',
    note: 'Here Śīta refers to both temperature and potency of the food or drink.',
    indications: 'Persons suffering from Raktaja disorders, Pittaja disorders, thirst, heat, intoxication, burning sensation, Raktapitta (haemorrhagic conditions), poison, and unconsciousness due to excessive sexual indulgence.',
  },
  {
    sn: 2,
    name: 'Uṣṇāhāra (Hot / Warm food)',
    note: 'Here Uṣṇa refers to both temperature and potency of the food or drink.',
    indications: 'Persons suffering from Kapha disorders, Vāta disorders, after Virecana (purgation), after oleation (Snehapāna), and those with a body devoid of excessive moisture (Aklinna Deha).',
  },
  {
    sn: 3,
    name: 'Snigdhāhāra (Unctuous / Oily food)',
    note: null,
    indications: 'Persons of Vāta Prakṛti and suffering from Vāta disorders, those with a dry body, and those who have performed excessive exercise or sexual activity.',
  },
  {
    sn: 4,
    name: 'Rukṣāhāra (Rough / Dry food)',
    note: null,
    indications: 'Persons having excessive Medas (adipose tissue / obesity), Kapha, and Prameha (metabolic / urinary disorders).',
  },
  {
    sn: 5,
    name: 'Śuṣkāhāra (Dry food)',
    note: null,
    indications: 'Persons suffering from wounds, excessive discharge, Prameha, and Kuṣṭha (skin disorders).',
  },
  {
    sn: 6,
    name: 'Dravāhāra (Liquid food)',
    note: null,
    indications: 'Persons suffering from thirst and weakness.',
  },
  {
    sn: 7,
    name: 'Ekakālāhāra (Food once a day)',
    note: null,
    indications: 'Persons having Agnimāndya (diminished digestive fire) — for kindling and reviving the fire.',
  },
  {
    sn: 8,
    name: 'Dvikālāhāra (Food twice daily)',
    note: null,
    indications: 'Persons having Samāgni (balanced, normal digestive fire).',
  },
  {
    sn: 9,
    name: 'Auṣadhayuktāhāra (Medicine mixed in food)',
    note: null,
    indications: 'Persons not willing to take medicine separately — medicine should be incorporated into their food.',
  },
  {
    sn: 10,
    name: 'Mātrāhīna (Food in reduced quantity)',
    note: null,
    indications: 'Persons having Mandāgni (very low digestive fire) should consume food in a correspondingly lesser quantity.',
  },
  {
    sn: 11,
    name: 'Doṣa Praśamana (Food to pacify Doṣas)',
    note: null,
    indications: 'Food given according to the season to pacify the seasonally dominant or aggravated doṣas.',
  },
  {
    sn: 12,
    name: 'Vṛttyartha (Food for maintenance of health)',
    note: null,
    indications: 'Food given for maintenance of health and alleviation of doṣas in healthy individuals.',
  },
];

// Page 78 — Āhāra Pariṇāmakara Bhāvas (Factors influencing digestion)
const AHARA_PARINAMAMKARA = {
  title: 'Āhāra Pariṇāmakara Bhāvas — Factors Influencing Digestion of Food',
  pageRef: 'Page 78 (Ch. Su. 6/14; A. Sam. Su. 10/23)',
  sloka1: 'आहार परिणमकारिणो भावाः अग्नि वायुः क्लेदः स्निग्धः कालः समयोगश्च ॥ (च. सू. ६/१४)',
  sloka1Meaning: 'The digestion and assimilation of food is influenced by six factors: heat (Pitta / Agni), Vāyu (air), Kleda (moisture), Snigdha (unctuousness), Kāla (time of administration), and Samayoga (administration of food as per the eight special rules previously explained).',
  sloka2: 'तत्रोष्मा पित्तं वायुः प्रेणयति स्निग्धं मार्दवं जनयति क्लेदः शैथिल्यमापादयति कालः सर्ववृत्तानामभिनिर्वर्तने ॥ (अ. सं. सू. १०/२३)',
  sloka2Meaning: 'Uṣma (Pitta / heat) assists in digestion; Vāyu (air) helps bring food to the site of digestion; the unctuous quality (Snigdha) produces softness / pliability; Kleda (moisture) causes loosening of food mass; Kāla (time) presides over the completion of all processes.',
  factors: [
    { name: 'Agni (Uṣma / Pitta)', role: 'Performs the actual digestion and transformation of food substances at the site of digestion.' },
    { name: 'Vāyu (Air)',          role: 'Propels and transports food to its appropriate site of digestion and assimilation.' },
    { name: 'Kleda (Moisture)',    role: 'Causes loosening and softening of the food bolus, facilitating digestion.' },
    { name: 'Snigdha (Unctuousness)', role: 'Produces softness and pliability in the food mass and body channels, supporting smooth digestion.' },
    { name: 'Kāla (Time)',         role: 'The time elapsed since the last meal; presides over and completes all digestive processes.' },
    { name: 'Samayoga (Proper combination)', role: 'Appropriate combination and preparation of food as per the eight special āhāra vidhis (rules of eating) explained previously.' },
  ],
};

// Page 67 — Trayopastambha context (Svasthavrtta chapter overview)
const TRAYOPASTAMBHA = {
  title: 'Trayopastambha — Chapter Context (Svasthavrtta)',
  page: 'Page 67',
  sections: [
    {
      heading: 'Āhāra (Food)',
      text: 'This section covers food hygiene — including subtopics such as milk hygiene, composition of milk, Pasteurisation, tests for Pasteurisation, meat hygiene and examination, food fortification, food adulteration, food standards, food toxicants, and the advantages and disadvantages of vegetarian and non-vegetarian diets. It also describes the effects of drugs, drug addiction, smoking, and alcoholism on the human body, along with a comprehensive account of Madyatyaya (alcoholism) and its management, and a detailed description of Pathyāpathyā in lifestyle disorders. Nutritional values of different food groups are discussed alongside their Āyurvedic properties as per the National Institute of Nutrition.',
    },
    {
      heading: 'Nidrā (Sleep)',
      text: 'This chapter includes subtopics such as Nirukti and Utpatti (etymology and origin), Svāsthya sambandha (relationship with health), sleep recommendations of the National Sleep Foundation as per age, properties of Yukta Nidrā (proper sleep), types of sleep, diseases produced due to improper sleep, Āhāra and Vihāra causing disturbed sleep, Āhāra and Vihāra to induce sleep, indications of day sleep for healthy and diseased persons, and effects of Rātrijāgaraṇa (night wakefulness), Divāsvapna (day sleep), Anidrā (insomnia), and Atinidrā (hypersomnia) — along with a brief modern description of types of sleep and different theories of sleep production.',
    },
    {
      heading: 'Brahmacaryā (Disciplined Conduct)',
      text: 'This chapter includes subtopics such as the definition of Brahmacaryā and Abrahmacaryā, the importance of each, Vyavāya-sambandhiniyama (regulated sexual activity), effects of Ativyavāya (excessive sexual indulgence), methods of Vīrya Rakṣā (conservation of vital energy), Surataspṛhā (libido) and its enhancement through Vājīkaraṇa (aphrodisiac treatment), and the consequences of Vīryanāśa (loss of vital essence).',
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   SEASON KEYS used in the tab selector
───────────────────────────────────────────────────────────────────────────── */
const SEASON_TABS = [
  { key: 'grisma', label: 'Grīṣma' },
  { key: 'varsa',  label: 'Varṣā' },
  { key: 'pravrt', label: 'Prāvṛṭ' },
  { key: 'sarat',  label: 'Śarat' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const PRAKRITI_STATIC_TIPS = [
  'Eat warm, nourishing foods',
  'Choose oily, moist foods',
  'Avoid dry, cold foods',
  'Favor sweet, sour, salty tastes',
  'Drink warm water, herbal tea',
  'Eat regular, balanced meals',
];

export default function DietPage() {
  const [prakriti, setPrakriti] = useState('vata');
  const [season,   setSeason]   = useState('varsa');
  const [activeTab, setActiveTab] = useState('ritucarya'); // 'ritucarya' | 'sandhi' | 'pravicara' | 'parinamamkara' | 'trayopastambha' | 'calendar'

  const rtuData = RITUCARYA[season] || RITUCARYA.varsa;

  return (
    <main className="page diet-page">
      <h1>Diet Tips For You</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Personalized diet recommendations based on your Prakṛti body type and Āyurvedic seasonal wisdom (Ṛtucaryā — Svasthavrtta).
      </p>

      {/* ══════════════════════════════════════════════════════════════
          SEASONAL DIET TIPS — Svastavrtta Reference
      ══════════════════════════════════════════════════════════════ */}
      <h3 style={{ margin: '28px 0 6px' }}>Seasonal Diet Tips</h3>
      <p style={{ color: 'var(--muted)', marginBottom: 14, fontSize: '0.92rem' }}>
        Based on Svasthavrtta — Ṛtucaryā (Pages 37, 48–53, 67, 78)
      </p>

      {/* Tab Navigation */}
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {[
          { id: 'ritucarya',      label: 'Ṛtucaryā (Seasonal Regimens)' },
          { id: 'sandhi',         label: 'Ṛtu Sandhi & Harītakī' },
          { id: 'pravicara',      label: 'Āhāra Pravicāra (P. 78)' },
          { id: 'parinamamkara',  label: 'Āhāra Pariṇāmakara' },
          { id: 'trayopastambha', label: 'Trayopastambha (P. 67)' },
          { id: 'calendar',       label: 'Ṛtu Calendar (P. 37)' },
        ].map((t) => (
          <button
            type="button"
            key={t.id}
            className={activeTab === t.id ? 'active' : ''}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Ṛtucaryā ─────────────────────────────────────────── */}
      {activeTab === 'ritucarya' && (
        <section className="seasonal-reference" aria-label="Ṛtucaryā seasonal regimen">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>Ṛtucaryā — Seasonal Dietary &amp; Lifestyle Regimens</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Select a ṛtu (season) to view its complete regimen from Svasthavrtta
            </p>
          </div>

          {/* Season selector */}
          <div className="filter-row" style={{ marginTop: 10 }}>
            {SEASON_TABS.map((s) => (
              <button
                type="button"
                key={s.key}
                className={season === s.key ? 'active' : ''}
                onClick={() => setSeason(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <article className="seasonal-reference-card" style={{ marginTop: 16 }}>
            <h4>{rtuData.label} <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>({rtuData.pages})</span></h4>

            {/* Features of the season */}
            {rtuData.features && (
              <div style={{ marginBottom: 18 }}>
                <h5>Features of {rtuData.label}</h5>
                <ul>
                  {rtuData.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}

            {/* Effects on the body */}
            {rtuData.bodyEffects && (
              <div style={{ marginBottom: 18 }}>
                <h5>Effects on the Body</h5>
                <ul>
                  {rtuData.bodyEffects.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="seasonal-reference-grid">
              {/* Pathya Diet */}
              {rtuData.pathyaDiet.length > 0 && (
                <div>
                  <h5>Pathya — Diet (What to Include)</h5>
                  <ul>
                    {rtuData.pathyaDiet.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

              {/* Pathya Lifestyle */}
              {rtuData.pathyaLifestyle.length > 0 && (
                <div>
                  <h5>Pathya — Lifestyle (Vihāra)</h5>
                  <ul>
                    {rtuData.pathyaLifestyle.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

              {/* Apathya Diet */}
              {rtuData.apathyaDiet.length > 0 && (
                <div>
                  <h5>Apathya — Diet (What to Avoid)</h5>
                  <ul>
                    {rtuData.apathyaDiet.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

              {/* Apathya Lifestyle */}
              {rtuData.apathyaLifestyle.length > 0 && (
                <div>
                  <h5>Apathya — Lifestyle (What to Avoid)</h5>
                  <ul>
                    {rtuData.apathyaLifestyle.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Treatment */}
            {rtuData.treatment && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(var(--accent-rgb,180,130,80),0.08)', borderRadius: 8, borderLeft: '3px solid var(--accent, #b4824a)' }}>
                <h5 style={{ marginBottom: 6 }}>Cikitsā (Treatment)</h5>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{rtuData.treatment}</p>
              </div>
            )}
          </article>
        </section>
      )}

      {/* ── TAB: Ṛtu Sandhi & Harītakī ──────────────────────────── */}
      {activeTab === 'sandhi' && (
        <section className="seasonal-reference" aria-label="Ṛtu Sandhi and Harītakī">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>Ṛtu Sandhi, Harītakī &amp; Seasonal Variations</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Svasthavrtta — {RTU_SANDHI_DATA.rtuSandhi.page}</p>
          </div>

          {/* Ṛtu Sandhi */}
          <article className="seasonal-reference-card">
            <h4>{RTU_SANDHI_DATA.rtuSandhi.title}</h4>
            <ul>
              {RTU_SANDHI_DATA.rtuSandhi.content.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </article>

          {/* Ṛtu Harītakī */}
          <article className="seasonal-reference-card" style={{ marginTop: 14 }}>
            <h4>{RTU_SANDHI_DATA.rtuHaritaki.title}</h4>
            <p style={{ lineHeight: 1.7 }}>{RTU_SANDHI_DATA.rtuHaritaki.content}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ṛtu</th>
                  <th style={thStyle}>Adjuvant with Harītakī</th>
                </tr>
              </thead>
              <tbody>
                {RTU_SANDHI_DATA.rtuHaritaki.table.map((row) => (
                  <tr key={row.rtu}>
                    <td style={tdStyle}>{row.rtu}</td>
                    <td style={tdStyle}>{row.adjuvant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          {/* Ṛtu Viparyaya */}
          <article className="seasonal-reference-card" style={{ marginTop: 14 }}>
            <h4>{RTU_SANDHI_DATA.rtuViparyaya.title}</h4>
            <ul>
              {RTU_SANDHI_DATA.rtuViparyaya.content.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </article>

          {/* Ṛtu Vaikārika */}
          <article className="seasonal-reference-card" style={{ marginTop: 14 }}>
            <h4>{RTU_SANDHI_DATA.rtuVaikari.title}</h4>
            <ul>
              {RTU_SANDHI_DATA.rtuVaikari.content.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </article>
        </section>
      )}

      {/* ── TAB: Āhāra Pravicāra ─────────────────────────────────── */}
      {activeTab === 'pravicara' && (
        <section className="seasonal-reference" aria-label="Āhāra Pravicāra indications">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>Āhāra Pravicāra — Indications for Types of Food</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Svasthavrtta — Page 78</p>
          </div>
          <div className="seasonal-article-list">
            {AHARA_PRAVICARA.map((item) => (
              <article key={item.sn} className="seasonal-article-card">
                <div className="seasonal-article-head">
                  <h5>{item.sn}. {item.name}</h5>
                </div>
                {item.note && <p style={{ margin: '4px 0 8px', fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic' }}>{item.note}</p>}
                <p style={{ margin: 0, lineHeight: 1.8 }}><strong>Indications: </strong>{item.indications}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: Āhāra Pariṇāmakara ─────────────────────────────── */}
      {activeTab === 'parinamamkara' && (
        <section className="seasonal-reference" aria-label="Āhāra Pariṇāmakara Bhāvas">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>{AHARA_PARINAMAMKARA.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Svasthavrtta — {AHARA_PARINAMAMKARA.pageRef}</p>
          </div>

          <article className="seasonal-reference-card">
            <div style={{ background: 'rgba(var(--accent-rgb,180,130,80),0.06)', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'serif', fontSize: '1.05rem', margin: '0 0 8px', lineHeight: 1.8 }}>{AHARA_PARINAMAMKARA.sloka1}</p>
              <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--muted)' }}>{AHARA_PARINAMAMKARA.sloka1Meaning}</p>
            </div>

            <div style={{ background: 'rgba(var(--accent-rgb,180,130,80),0.06)', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'serif', fontSize: '1.05rem', margin: '0 0 8px', lineHeight: 1.8 }}>{AHARA_PARINAMAMKARA.sloka2}</p>
              <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--muted)' }}>{AHARA_PARINAMAMKARA.sloka2Meaning}</p>
            </div>

            <h5 style={{ marginTop: 16, marginBottom: 10 }}>The Six Factors</h5>
            <div className="seasonal-reference-grid">
              {AHARA_PARINAMAMKARA.factors.map((f) => (
                <div key={f.name} style={{ padding: '10px 14px', background: 'rgba(var(--accent-rgb,180,130,80),0.04)', borderRadius: 8 }}>
                  <strong>{f.name}</strong>
                  <p style={{ margin: '6px 0 0', lineHeight: 1.7 }}>{f.role}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* ── TAB: Trayopastambha ──────────────────────────────────── */}
      {activeTab === 'trayopastambha' && (
        <section className="seasonal-reference" aria-label="Trayopastambha chapter context">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>{TRAYOPASTAMBHA.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Svasthavrtta — {TRAYOPASTAMBHA.page}</p>
          </div>
          <div className="seasonal-article-list">
            {TRAYOPASTAMBHA.sections.map((s) => (
              <article key={s.heading} className="seasonal-article-card">
                <div className="seasonal-article-head">
                  <h5>{s.heading}</h5>
                </div>
                <p style={{ margin: 0, lineHeight: 1.8 }}>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: Ṛtu Calendar ────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <section className="seasonal-reference" aria-label="Ṛtu calendar table">
          <div className="seasonal-reference-head" style={{ marginTop: 18 }}>
            <h3>Ṛtu Calendar — Rāśi, Śāka Varṣa, Months &amp; Predominant Rasa</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Svasthavrtta — Page 37. In southern parts of Gaṅgā, rain is more, so Prāvṛṭ and Varṣā ṛtu are explained excluding Śiśira, as there is no extreme cold. In northern parts of Gaṅgā, cold is extreme, so Hemanta and Śiśira are included and Prāvṛṭ is excluded.
            </p>
          </div>
          <article className="seasonal-reference-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ṛtu</th>
                  <th style={thStyle}>Rāśi of Sun</th>
                  <th style={thStyle}>Śāka Varṣa</th>
                  <th style={thStyle}>Month</th>
                  <th style={thStyle}>Predominant Rasa</th>
                </tr>
              </thead>
              <tbody>
                {RTU_CALENDAR.map((row) =>
                  row.rasi.map((r, i) => (
                    <tr key={`${row.rtu}-${r}`}>
                      {i === 0 && <td style={{ ...tdStyle, fontWeight: 600 }} rowSpan={2}>{row.rtu}</td>}
                      <td style={tdStyle}>{r}</td>
                      <td style={tdStyle}>{row.sakaVarsa[i]}</td>
                      <td style={tdStyle}>{row.month[i]}</td>
                      {i === 0 && <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--accent, #b4824a)' }} rowSpan={2}>{row.rasa}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </article>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DIET TIPS BY PRAKṚTI — static tips
      ══════════════════════════════════════════════════════════════ */}
      <section aria-label="Diet tips by Prakṛti" style={{ marginTop: 36 }}>
        <h3 style={{ marginBottom: 10 }}>Diet Tips By Prakṛti</h3>
        <div className="filter-row">
          {['vata', 'pitta', 'kapha'].map((type) => (
            <button
              type="button"
              key={type}
              className={prakriti === type ? 'active' : ''}
              onClick={() => setPrakriti(type)}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="tip-list" style={{ marginTop: 12 }}>
          {PRAKRITI_STATIC_TIPS.map((tip) => (
            <article key={tip} className="tip-item">
              {tip}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ── Shared table styles ── */
const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  background: 'rgba(var(--accent-rgb,180,130,80),0.12)',
  fontWeight: 600,
  borderBottom: '2px solid rgba(var(--accent-rgb,180,130,80),0.2)',
};
const tdStyle = {
  padding: '9px 14px',
  borderBottom: '1px solid rgba(128,128,128,0.12)',
  lineHeight: 1.6,
};
