
export type RecoveryPlan = {
  name: string;
};

// This list is used by the AI to select a valid icon.
export const VALID_TASK_ICONS = [
    'Bed',
    'GlassWater',
    'Pill',
    'ArrowUp',
    'Snowflake',
    'WrapText',
    'Dumbbell',
    'Calendar',
    'Thermometer',
    'Bone',
    'Eye',
    'Bug',
    'Heart', // Added for cardiovascular conditions
];


export const RECOVERY_PLANS: Record<string, RecoveryPlan> = {
  // Viral & Bacterial Infections
  'common-cold': { name: 'Common Cold' },
  'flu': { name: 'Influenza (Flu)' },
  'covid-19': { name: 'COVID-19' },
  'pneumonia': { name: 'Pneumonia' },
  'bronchitis': { name: 'Bronchitis' },
  'tonsillitis': { name: 'Tonsillitis' },
  'sinusitis': { name: 'Sinusitis' },
  'gastroenteritis': { name: 'Gastroenteritis (Stomach Flu)' },
  'uti': { name: 'Urinary Tract Infection (UTI)' },
  'chickenpox': { name: 'Chickenpox' },
  'dengue-fever': { name: 'Dengue Fever' },
  
  // Injuries & Orthopedic
  'sprained-ankle': { name: 'Sprained Ankle' },
  'bone-fracture': { name: 'Bone Fracture' },
  'back-pain': { name: 'Lower Back Pain' },
  'muscle-strain': { name: 'Muscle Strain' },
  'tendinitis': { name: 'Tendinitis' },

  // Surgical Recovery
  'knee-surgery': { name: 'Knee Surgery Recovery' },
  'appendectomy': { name: 'Appendectomy' },
  'cataract-surgery': { name: 'Cataract Surgery' },
  'wisdom-tooth-extraction': { name: 'Wisdom Tooth Extraction' },
  'hernia-repair': { name: 'Hernia Repair Surgery' },
  
  // Chronic Conditions Management
  'heart-attack': { name: 'Heart Attack Recovery' },
  'hypertension': { name: 'Hypertension Management' },
  'diabetes': { name: 'Diabetes Management' },
  'asthma': { name: 'Asthma Flare-up' },
  'migraine': { name: 'Migraine' },
  
  // Mental & Neurological Health
  'concussion': { name: 'Concussion Recovery' },
  'insomnia': { name: 'Insomnia' },
  'anxiety-panic-attack': { name: 'Anxiety & Panic Attacks' },
  'depression': { name: 'Depression Management' },

  // Other
  'other': { name: 'Custom Recovery Plan' },
};

export const CONDITIONS = Object.keys(RECOVERY_PLANS).map(key => ({
  value: key,
  label: RECOVERY_PLANS[key].name,
}));
