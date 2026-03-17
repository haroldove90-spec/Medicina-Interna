import { Patient, Appointment, PatientDetail } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'mock-1',
    first_name: 'Juan',
    last_name: 'Pérez',
    date_of_birth: '1965-05-15',
    gender: 'Masculino',
    blood_type: 'O+',
    email: 'juan.perez@example.com',
    phone: '555-0101',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    first_name: 'María',
    last_name: 'García',
    date_of_birth: '1982-08-22',
    gender: 'Femenino',
    blood_type: 'A+',
    email: 'maria.garcia@example.com',
    phone: '555-0102',
    created_at: new Date().toISOString()
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patient_id: 'mock-1',
    first_name: 'Juan',
    last_name: 'Pérez',
    start_time: new Date(new Date().setHours(10, 0)).toISOString(),
    end_time: new Date(new Date().setHours(11, 0)).toISOString(),
    status: 'scheduled',
    type: 'Presencial',
    notes: 'Control de diabetes'
  },
  {
    id: 'app-2',
    patient_id: 'mock-2',
    first_name: 'María',
    last_name: 'García',
    start_time: new Date(new Date().setHours(14, 30)).toISOString(),
    end_time: new Date(new Date().setHours(15, 0)).toISOString(),
    status: 'scheduled',
    type: 'Telemedicina',
    notes: 'Revisión de laboratorios'
  }
];

export const getMockPatientDetail = (id: string): PatientDetail => {
  const patient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];
  return {
    ...patient,
    conditions: [
      { id: 'c1', patient_id: id, condition_name: 'Diabetes Mellitus Tipo 2', diagnosis_date: '2015-10-20', status: 'active', notes: 'Controlado con metformina' }
    ],
    medications: [
      { id: 'm1', patient_id: id, medication_name: 'Metformina', dosage: '850mg', frequency: 'Cada 12 horas', start_date: '2015-10-20', end_date: '', status: 'active' }
    ],
    consultations: [
      { id: 'con1', patient_id: id, consultation_date: new Date().toISOString(), reason_for_visit: 'Control rutinario', subjective: 'Paciente se siente bien', objective: 'Signos vitales estables', assessment: 'Diabetes controlada', plan: 'Continuar tratamiento actual' }
    ],
    labs: [
      { id: 'l1', patient_id: id, test_name: 'HbA1c', value: '6.8', unit: '%', reference_range: '4.0-5.6', test_date: '2024-01-15' }
    ],
    vital_signs_history: [
      { id: 'v1', patient_id: id, ta_systolic: 120, ta_diastolic: 80, fc: 72, fr: 16, temp: 36.5, sato2: 98, weight: 80, height: 1.75, imc: 26.1, created_at: new Date().toISOString() }
    ]
  };
};
