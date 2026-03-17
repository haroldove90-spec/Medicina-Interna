export interface UserProfile {
  id: string;
  role: 'Medico' | 'Asistente';
  full_name?: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  allergies?: string;
  chronic_history?: string;
  email: string;
  phone: string;
  address?: string;
  created_at: string;
}

export interface ChronicCondition {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosis_date: string;
  status: string;
  notes: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  consultation_date: string;
  reason_for_visit: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  test_date: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
  notes: string;
}

export interface PatientDetail extends Patient {
  conditions: ChronicCondition[];
  medications: Medication[];
  consultations: Consultation[];
  labs: LabResult[];
  clinical_history?: ClinicalHistory;
  vital_signs_history: VitalSigns[];
}

export interface ClinicalHistory {
  id: string;
  patient_id: string;
  occupation?: string;
  marital_status?: string;
  education_level?: string;
  religion?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  family_history_chronic?: string;
  family_history_oncologic?: string;
  family_history_autoimmune?: string;
  smoking_index?: number;
  alcohol_frequency?: string;
  substance_use?: string;
  diet_quality?: string;
  physical_activity?: string;
  zoonosis?: string;
  housing_services?: string;
  immunizations?: string;
  previous_diseases?: string;
  surgical_history?: string;
  traumatic_history?: string;
  transfusion_history?: string;
  previous_hospitalizations?: string;
  sys_general?: string;
  sys_cardiovascular?: string;
  sys_respiratory?: string;
  sys_gastrointestinal?: string;
  sys_genitourinary?: string;
  sys_neuro_psych?: string;
  updated_at?: string;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  consultation_id?: string;
  ta_systolic: number;
  ta_diastolic: number;
  fc: number;
  fr: number;
  temp: number;
  sato2: number;
  weight: number;
  height: number;
  imc: number;
  created_at: string;
}
