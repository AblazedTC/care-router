export interface Hospital {
  id: string
  name: string
  specialty: string[]
  distance: number // in km
  availableBeds: number
  waitTime: string
  rating: number
  address: string
  phone: string
  emergency: boolean
  image: string
}

export interface TriageCondition {
  name: string
  severity: "low" | "moderate" | "high" | "critical"
  specialty: string[]
  description: string
  confidence: number
}

export interface SymptomRule {
  keywords: string[]
  condition: TriageCondition
}

export const hospitals: Hospital[] = [
  {
    id: "h1",
    name: "City General Hospital",
    specialty: ["General Medicine", "Emergency", "Cardiology", "Neurology"],
    distance: 2.3,
    availableBeds: 12,
    waitTime: "~15 min",
    rating: 4.7,
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 100-2000",
    emergency: true,
    image: "/hospitals/general.jpg",
  },
  {
    id: "h2",
    name: "St. Mary's Heart Center",
    specialty: ["Cardiology", "Cardiac Surgery", "Vascular Medicine"],
    distance: 5.1,
    availableBeds: 6,
    waitTime: "~25 min",
    rating: 4.9,
    address: "456 Oak Avenue, Midtown",
    phone: "+1 (555) 200-3000",
    emergency: true,
    image: "/hospitals/heart.jpg",
  },
  {
    id: "h3",
    name: "Riverside Orthopedic Clinic",
    specialty: ["Orthopedics", "Sports Medicine", "Rehabilitation"],
    distance: 3.8,
    availableBeds: 8,
    waitTime: "~20 min",
    rating: 4.5,
    address: "789 River Road, East Side",
    phone: "+1 (555) 300-4000",
    emergency: false,
    image: "/hospitals/ortho.jpg",
  },
  {
    id: "h4",
    name: "Metro Children's Hospital",
    specialty: ["Pediatrics", "Neonatal Care", "Child Psychology"],
    distance: 4.2,
    availableBeds: 15,
    waitTime: "~10 min",
    rating: 4.8,
    address: "321 Park Lane, North Quarter",
    phone: "+1 (555) 400-5000",
    emergency: true,
    image: "/hospitals/children.jpg",
  },
  {
    id: "h5",
    name: "University Medical Center",
    specialty: ["Neurology", "Oncology", "Research Medicine", "General Medicine"],
    distance: 7.5,
    availableBeds: 22,
    waitTime: "~30 min",
    rating: 4.6,
    address: "555 University Blvd, Campus Area",
    phone: "+1 (555) 500-6000",
    emergency: true,
    image: "/hospitals/university.jpg",
  },
  {
    id: "h6",
    name: "Lakeside Mental Health Center",
    specialty: ["Psychiatry", "Psychology", "Substance Abuse"],
    distance: 6.0,
    availableBeds: 10,
    waitTime: "~5 min",
    rating: 4.4,
    address: "987 Lake Drive, West End",
    phone: "+1 (555) 600-7000",
    emergency: false,
    image: "/hospitals/mental.jpg",
  },
  {
    id: "h7",
    name: "WellCare Dermatology Institute",
    specialty: ["Dermatology", "Cosmetic Surgery", "Allergy"],
    distance: 3.0,
    availableBeds: 4,
    waitTime: "~35 min",
    rating: 4.3,
    address: "654 Elm Street, South Side",
    phone: "+1 (555) 700-8000",
    emergency: false,
    image: "/hospitals/derma.jpg",
  },
  {
    id: "h8",
    name: "PrimaCare ENT Specialists",
    specialty: ["ENT", "Audiology", "Allergy"],
    distance: 2.8,
    availableBeds: 5,
    waitTime: "~15 min",
    rating: 4.5,
    address: "222 Cedar Court, Central District",
    phone: "+1 (555) 800-9000",
    emergency: false,
    image: "/hospitals/ent.jpg",
  },
]

export const symptomRules: SymptomRule[] = [
  {
    keywords: ["chest pain", "chest tightness", "heart", "palpitation", "shortness of breath", "chest pressure"],
    condition: {
      name: "Possible Cardiac Issue",
      severity: "critical",
      specialty: ["Cardiology", "Emergency"],
      description: "Symptoms suggest a potential cardiac event. Immediate medical attention is recommended.",
      confidence: 0.82,
    },
  },
  {
    keywords: ["headache", "migraine", "dizziness", "blurred vision", "fainting", "numbness"],
    condition: {
      name: "Neurological Concern",
      severity: "high",
      specialty: ["Neurology", "General Medicine"],
      description: "Symptoms may indicate a neurological condition requiring specialist evaluation.",
      confidence: 0.72,
    },
  },
  {
    keywords: ["broken", "fracture", "sprain", "joint pain", "bone", "swelling", "twisted ankle", "knee pain", "back pain"],
    condition: {
      name: "Musculoskeletal Injury",
      severity: "moderate",
      specialty: ["Orthopedics", "Sports Medicine"],
      description: "Symptoms suggest a bone or joint injury. Imaging and orthopedic evaluation recommended.",
      confidence: 0.78,
    },
  },
  {
    keywords: ["fever", "cough", "cold", "flu", "sore throat", "runny nose", "body ache", "fatigue", "chills"],
    condition: {
      name: "Upper Respiratory Infection",
      severity: "low",
      specialty: ["General Medicine"],
      description: "Symptoms are consistent with a common viral infection. Rest and hydration recommended.",
      confidence: 0.85,
    },
  },
  {
    keywords: ["rash", "itching", "skin", "hives", "acne", "eczema", "psoriasis", "skin lesion"],
    condition: {
      name: "Dermatological Condition",
      severity: "low",
      specialty: ["Dermatology", "Allergy"],
      description: "Symptoms suggest a skin condition. Dermatological consultation advised.",
      confidence: 0.80,
    },
  },
  {
    keywords: ["anxiety", "depression", "insomnia", "panic", "stress", "mood", "hallucination", "mental"],
    condition: {
      name: "Mental Health Concern",
      severity: "moderate",
      specialty: ["Psychiatry", "Psychology"],
      description: "Symptoms suggest a mental health condition. Professional support is recommended.",
      confidence: 0.75,
    },
  },
  {
    keywords: ["child", "pediatric", "infant", "baby", "toddler", "childhood"],
    condition: {
      name: "Pediatric Evaluation Needed",
      severity: "moderate",
      specialty: ["Pediatrics"],
      description: "Condition involves a child. Pediatric specialist evaluation recommended.",
      confidence: 0.70,
    },
  },
  {
    keywords: ["ear pain", "hearing", "sinus", "nose bleed", "tonsil", "throat", "voice loss", "ear infection"],
    condition: {
      name: "ENT Condition",
      severity: "low",
      specialty: ["ENT", "General Medicine"],
      description: "Symptoms point to an ear, nose, or throat condition. ENT specialist consultation recommended.",
      confidence: 0.77,
    },
  },
  {
    keywords: ["stomach", "abdomen", "nausea", "vomiting", "diarrhea", "constipation", "bloating", "cramp"],
    condition: {
      name: "Gastrointestinal Issue",
      severity: "moderate",
      specialty: ["General Medicine", "Emergency"],
      description: "Symptoms indicate a gastrointestinal problem. Medical evaluation recommended.",
      confidence: 0.76,
    },
  },
  {
    keywords: ["cancer", "tumor", "lump", "mass", "oncology", "chemotherapy"],
    condition: {
      name: "Oncology Referral Needed",
      severity: "high",
      specialty: ["Oncology", "Research Medicine"],
      description: "Symptoms or history suggest possible oncological involvement. Specialist referral recommended.",
      confidence: 0.65,
    },
  },
]

export const directDiagnoses: Record<string, TriageCondition> = {
  "hypertension": {
    name: "Hypertension",
    severity: "moderate",
    specialty: ["Cardiology", "General Medicine"],
    description: "High blood pressure condition requiring regular monitoring and treatment.",
    confidence: 0.95,
  },
  "diabetes": {
    name: "Diabetes Management",
    severity: "moderate",
    specialty: ["General Medicine"],
    description: "Diabetes requires ongoing management and monitoring of blood sugar levels.",
    confidence: 0.95,
  },
  "asthma": {
    name: "Asthma",
    severity: "moderate",
    specialty: ["General Medicine", "Allergy"],
    description: "Chronic respiratory condition requiring management and possible specialist care.",
    confidence: 0.95,
  },
  "pneumonia": {
    name: "Pneumonia",
    severity: "high",
    specialty: ["General Medicine", "Emergency"],
    description: "Lung infection requiring antibiotics and close monitoring.",
    confidence: 0.95,
  },
  "appendicitis": {
    name: "Appendicitis",
    severity: "critical",
    specialty: ["Emergency", "General Medicine"],
    description: "Potential surgical emergency. Immediate evaluation required.",
    confidence: 0.95,
  },
  "concussion": {
    name: "Concussion",
    severity: "high",
    specialty: ["Neurology", "Emergency"],
    description: "Traumatic brain injury requiring neurological evaluation and rest.",
    confidence: 0.95,
  },
  "fracture": {
    name: "Bone Fracture",
    severity: "moderate",
    specialty: ["Orthopedics", "Emergency"],
    description: "Broken bone requiring imaging and orthopedic treatment.",
    confidence: 0.95,
  },
}
