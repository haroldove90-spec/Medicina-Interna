import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Users, 
  Activity, 
  Pill, 
  FileText, 
  FlaskConical, 
  ChevronRight, 
  Search,
  Plus,
  Calendar,
  User as UserIcon,
  AlertCircle,
  X,
  Trash2,
  TrendingUp,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Stethoscope,
  Brain,
  Calculator,
  Video,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Eye,
  EyeOff,
  Menu,
  Download,
  Smartphone,
  HeartPulse,
  Image,
  Camera,
  Upload,
  Key,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { format, isToday, parseISO, startOfDay, endOfDay } from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Patient, PatientDetail, LabResult, Appointment, UserProfile } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, getMockPatientDetail } from './mockData';

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-semibold text-xl text-slate-800">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ClinicalHistoryView = ({ detail, onEdit, onAddVitals }: { detail: PatientDetail, onEdit: () => void, onAddVitals: () => void }) => {
  const history = detail.clinical_history;
  const vitals = detail.vital_signs_history;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-slate-800 text-xl">Historial Clínico Completo</h3>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onAddVitals}
            className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Signos Vitales
          </button>
          <button 
            onClick={onEdit}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Settings className="w-4 h-4" />
            Editar Historial
          </button>
        </div>
      </div>

      {/* Modern Graphics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="h-[400px] flex flex-col">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Tendencia de Presión Arterial
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitals}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(val) => format(parseISO(val), 'dd/MM')} 
                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Line type="monotone" dataKey="ta_systolic" name="Sistólica" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="ta_diastolic" name="Diastólica" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill: '#818cf8'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" /> Frecuencia Cardiaca y SatO2
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitals}>
              <defs>
                <linearGradient id="colorFc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(val) => format(parseISO(val), 'dd/MM')} 
                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="fc" name="FC (bpm)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFc)" strokeWidth={3} />
              <Line type="monotone" dataKey="sato2" name="SatO2 (%)" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Clinical History Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Ficha de Identificación */}
        <Card>
          <h4 className="font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 uppercase text-xs tracking-wider text-indigo-600">1. Ficha de Identificación</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ocupación</p>
              <p className="text-sm font-bold text-slate-700">{history?.occupation || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estado Civil</p>
              <p className="text-sm font-bold text-slate-700">{history?.marital_status || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Escolaridad</p>
              <p className="text-sm font-bold text-slate-700">{history?.education_level || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Religión</p>
              <p className="text-sm font-bold text-slate-700">{history?.religion || 'No registrado'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contacto de Emergencia</p>
              <p className="text-sm font-bold text-slate-700">{history?.emergency_contact_name || 'No registrado'} {history?.emergency_contact_relationship ? `(${history.emergency_contact_relationship})` : ''}</p>
              <p className="text-xs text-slate-500 mt-1">{history?.emergency_contact_phone}</p>
            </div>
          </div>
        </Card>

        {/* 2. Antecedentes Heredofamiliares */}
        <Card>
          <h4 className="font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 uppercase text-xs tracking-wider text-indigo-600">2. Antecedentes Heredofamiliares</h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Crónico-Degenerativos</p>
              <p className="text-sm text-slate-700">{history?.family_history_chronic || 'Sin antecedentes de importancia'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Oncológicos</p>
              <p className="text-sm text-slate-700">{history?.family_history_oncologic || 'Sin antecedentes de importancia'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Autoinmunes</p>
              <p className="text-sm text-slate-700">{history?.family_history_autoimmune || 'Sin antecedentes de importancia'}</p>
            </div>
          </div>
        </Card>

        {/* 3. Antecedentes Personales No Patológicos */}
        <Card>
          <h4 className="font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 uppercase text-xs tracking-wider text-indigo-600">3. Antecedentes Personales No Patológicos</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Índice Tabáquico</p>
              <p className="text-sm font-bold text-slate-700">{history?.smoking_index || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alcoholismo</p>
              <p className="text-sm text-slate-700">{history?.alcohol_frequency || 'Negado'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inmunizaciones</p>
              <p className="text-sm text-slate-700">{history?.immunizations || 'Esquema incompleto o no referido'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vivienda y Zoonosis</p>
              <p className="text-sm text-slate-700">{history?.housing_services || 'No referido'} • {history?.zoonosis || 'Sin contacto con animales'}</p>
            </div>
          </div>
        </Card>

        {/* 4. Antecedentes Personales Patológicos */}
        <Card className="border-rose-100 bg-rose-50/30">
          <h4 className="font-bold text-rose-800 mb-6 pb-2 border-b border-rose-100 uppercase text-xs tracking-wider">4. Antecedentes Personales Patológicos</h4>
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-rose-100">
              <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Alergias (Crítico)</p>
              <p className="text-sm font-black text-rose-700 uppercase tracking-tight">{detail.allergies || 'NEGADAS'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Quirúrgicos y Traumáticos</p>
              <p className="text-sm text-slate-700">{history?.surgical_history || 'Ninguno'} • {history?.traumatic_history || 'Ninguno'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Hospitalizaciones y Transfusiones</p>
              <p className="text-sm text-slate-700">{history?.previous_hospitalizations || 'Ninguna'} • {history?.transfusion_history || 'Ninguna'}</p>
            </div>
          </div>
        </Card>

        {/* 6. Interrogatorio por Aparatos y Sistemas */}
        <Card className="md:col-span-2">
          <h4 className="font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 uppercase text-xs tracking-wider text-indigo-600">6. Interrogatorio por Aparatos y Sistemas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">General</p>
                <p className="text-xs text-slate-600">{history?.sys_general || 'Sin alteraciones'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cardiovascular</p>
                <p className="text-xs text-slate-600">{history?.sys_cardiovascular || 'Sin alteraciones'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Respiratorio</p>
                <p className="text-xs text-slate-600">{history?.sys_respiratory || 'Sin alteraciones'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gastrointestinal</p>
                <p className="text-xs text-slate-600">{history?.sys_gastrointestinal || 'Sin alteraciones'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Genitourinario</p>
                <p className="text-xs text-slate-600">{history?.sys_genitourinary || 'Sin alteraciones'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Neurológico/Psiquiátrico</p>
                <p className="text-xs text-slate-600">{history?.sys_neuro_psych || 'Sin alteraciones'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'agenda' | 'tools' | 'profile' | 'media'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [patientSubTab, setPatientSubTab] = useState<'summary' | 'consultations' | 'history' | 'labs'>('summary');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Modal States
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  // Edit States
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);
  const [editingCondition, setEditingCondition] = useState<any>(null);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [editingLab, setEditingLab] = useState<any>(null);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  // --- Data Fetching ---

  useEffect(() => {
    if (userProfile?.role === 'Asistente' && (activeTab === 'patients' || activeTab === 'tools')) {
      setActiveTab('dashboard');
    }
  }, [userProfile, activeTab]);

  const isSupabaseConfigured = (import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  const fetchPatients = async () => {
    if (!isSupabaseConfigured) {
      setPatients(MOCK_PATIENTS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) console.error('Error fetching patients:', error);
    else setPatients(data || []);
    setLoading(false);
  };

  const fetchAppointments = async () => {
    if (!isSupabaseConfigured) {
      setAppointments(MOCK_APPOINTMENTS);
      return;
    }
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          first_name,
          last_name
        )
      `)
      .order('start_time', { ascending: true });
    
    if (error) console.error('Error fetching appointments:', error);
    else {
      // Flatten the join result
      const formatted = (data || []).map((app: any) => ({
        ...app,
        first_name: app.patients?.first_name,
        last_name: app.patients?.last_name
      }));
      setAppointments(formatted);
    }
  };

  const fetchPatientDetail = async (id: string) => {
    if (!isSupabaseConfigured) {
      setPatientDetail(getMockPatientDetail(id));
      setAiSummary('');
      return;
    }
    const { data: patient, error: pError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (pError) return console.error('Error fetching patient:', pError);

    const [conds, meds, consults, labs, history, vitals] = await Promise.all([
      supabase.from('chronic_conditions').select('*').eq('patient_id', id),
      supabase.from('medications').select('*').eq('patient_id', id),
      supabase.from('consultations').select('*').eq('patient_id', id).order('consultation_date', { ascending: false }),
      supabase.from('lab_results').select('*').eq('patient_id', id).order('test_date', { ascending: false }),
      supabase.from('clinical_histories').select('*').eq('patient_id', id).single(),
      supabase.from('vital_signs').select('*').eq('patient_id', id).order('created_at', { ascending: true })
    ]);

    setPatientDetail({
      ...patient,
      conditions: conds.data || [],
      medications: meds.data || [],
      consultations: consults.data || [],
      labs: labs.data || [],
      clinical_history: history.data || undefined,
      vital_signs_history: vitals.data || []
    });
    setAiSummary('');
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ id: 'demo-user', email: 'demo@example.com' });
      setUserProfile({
        id: 'demo-user',
        role: 'Medico',
        full_name: 'Dr. Jesús Monteón (Demo)',
        avatar_url: null
      });
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => {
          setAuthLoading(false);
        });
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    }).catch(err => {
      console.error("Session fetch error:", err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  const fetchProfile = async (userId: string) => {
    try {
      const localProfile = localStorage.getItem(`profile_${userId}`);
      let parsedLocal = null;
      try {
        parsedLocal = localProfile ? JSON.parse(localProfile) : null;
      } catch (e) {
        console.error("Error parsing local profile:", e);
      }

      if (!isSupabaseConfigured) {
        setUserProfile(parsedLocal || {
          id: userId,
          role: 'Medico',
          full_name: 'Dr. Jesús Monteón (Demo)',
          avatar_url: null
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Fallback to metadata if profile table doesn't exist yet or other error
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUserProfile({
            id: userData.user.id,
            role: (userData.user.user_metadata?.role as any) || 'Medico',
            full_name: userData.user.user_metadata?.full_name || 'Usuario',
            ...parsedLocal
          });
        } else {
          // Final fallback
          setUserProfile({
            id: userId,
            role: 'Medico',
            full_name: 'Usuario',
            ...parsedLocal
          });
        }
      } else {
        setUserProfile({ ...data, ...parsedLocal });
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetail(selectedPatientId);
    }
  }, [selectedPatientId]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // --- AI Logic ---

  const generateAiSummary = async () => {
    if (!patientDetail) return;
    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `Actúa como un médico internista experto. Resume el expediente clínico del paciente ${patientDetail.first_name} ${patientDetail.last_name}.
      Datos:
      - Alergias: ${patientDetail.allergies || 'Ninguna conocida'}
      - Antecedentes Crónicos: ${patientDetail.chronic_history || 'Ninguno registrado'}
      - Patologías: ${patientDetail.conditions.map(c => c.condition_name).join(', ')}
      - Medicamentos: ${patientDetail.medications.map(m => m.medication_name).join(', ')}
      - Últimas consultas: ${patientDetail.consultations.map(c => c.assessment).join(' | ')}
      - Laboratorios: ${patientDetail.labs.map(l => `${l.test_name}: ${l.value}`).join(', ')}
      
      Proporciona un resumen ejecutivo clínico, destaca riesgos potenciales y sugiere próximos pasos. Usa formato Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      setAiSummary(response.text || "No se pudo generar el resumen.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Error al generar el resumen clínico. Por favor, intente de nuevo.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // --- Handlers ---

  const seedSampleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Sample Patients
      const { data: pData, error: pError } = await supabase.from('patients').insert([
        { first_name: 'Juan', last_name: 'Pérez', date_of_birth: '1975-05-15', gender: 'M', blood_type: 'O+', allergies: 'Penicilina', chronic_history: 'Hipertensión Arterial' },
        { first_name: 'María', last_name: 'García', date_of_birth: '1982-11-20', gender: 'F', blood_type: 'A-', allergies: 'Ninguna', chronic_history: 'Diabetes Mellitus Tipo 2' }
      ]).select();

      if (pError) throw pError;

      if (pData && pData.length > 0) {
        const p1 = pData[0].id;
        const p2 = pData[1].id;

        // Sample Conditions
        await supabase.from('chronic_conditions').insert([
          { patient_id: p1, condition_name: 'Hipertensión Arterial', diagnosis_date: '2015-01-01', status: 'controlado' },
          { patient_id: p2, condition_name: 'Diabetes Mellitus Tipo 2', diagnosis_date: '2018-06-12', status: 'activo' }
        ]);

        // Sample Medications
        await supabase.from('medications').insert([
          { patient_id: p1, medication_name: 'Enalapril', dosage: '10mg', frequency: 'Cada 12 horas', start_date: '2015-01-05' },
          { patient_id: p2, medication_name: 'Metformina', dosage: '850mg', frequency: 'Con la cena', start_date: '2018-06-15' }
        ]);

        // Sample Consultations
        await supabase.from('consultations').insert([
          { patient_id: p1, reason_for_visit: 'Control rutinario', subjective: 'Paciente se siente bien', objective: 'TA 120/80', assessment: 'HTA controlada', plan: 'Continuar mismo tratamiento' }
        ]);

        // Sample Clinical Histories
        await supabase.from('clinical_histories').insert([
          { 
            patient_id: p1, 
            occupation: 'Contador', 
            marital_status: 'Casado', 
            education_level: 'Licenciatura',
            religion: 'Católico',
            emergency_contact_name: 'Ana Pérez',
            emergency_contact_phone: '555-0123',
            emergency_contact_relationship: 'Esposa',
            family_history_chronic: 'Padre con HTA, Madre con DM2',
            family_history_oncologic: 'Abuelo paterno con cáncer de próstata',
            smoking_index: 0,
            alcohol_frequency: 'Social ocasional',
            immunizations: 'Esquema completo, Influenza 2025, Refuerzo COVID 2024',
            housing_services: 'Todos los servicios urbanos',
            zoonosis: 'Un perro en casa',
            previous_diseases: 'Varicela en la infancia',
            surgical_history: 'Apendicectomía a los 15 años',
            sys_general: 'Astenia ocasional',
            sys_cardiovascular: 'Niega disnea o dolor precordial'
          }
        ]);

        // Sample Vital Signs
        const now = new Date();
        const vitals = [];
        for (let i = 0; i < 6; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (5 - i));
          vitals.push({
            patient_id: p1,
            ta_systolic: 120 + Math.floor(Math.random() * 15),
            ta_diastolic: 75 + Math.floor(Math.random() * 10),
            fc: 65 + Math.floor(Math.random() * 15),
            fr: 16 + Math.floor(Math.random() * 4),
            temp: 36.4 + (Math.random() * 0.6),
            sato2: 96 + Math.floor(Math.random() * 4),
            weight: 78 - (i * 0.5),
            height: 175,
            created_at: date.toISOString()
          });
        }
        await supabase.from('vital_signs').insert(vitals);
      }

      await fetchPatients();
      await fetchAppointments();
      alert('Datos de muestra cargados con éxito.');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error al cargar datos de muestra.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      alert('Modo Demo: Paciente creado localmente (no persistente)');
      setIsPatientModalOpen(false);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (editingPatient) {
      const { error } = await supabase.from('patients').update(data).eq('id', editingPatient.id);
      if (error) {
        alert('Error al actualizar expediente: ' + error.message);
      } else {
        setEditingPatient(null);
        setIsPatientModalOpen(false);
        fetchPatients();
        if (selectedPatientId === editingPatient.id) fetchPatientDetail(editingPatient.id);
      }
    } else {
      const { error } = await supabase.from('patients').insert([data]);
      if (error) {
        alert('Error al crear expediente: ' + error.message);
        console.error('Insert error:', error);
      } else {
        setIsPatientModalOpen(false);
        fetchPatients();
      }
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!isSupabaseConfigured) {
      alert('Modo Demo: Paciente eliminado localmente (no persistente)');
      return;
    }
    if (!confirm('¿Está seguro de eliminar este expediente? Se borrarán todos sus registros asociados.')) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (!error) {
      if (selectedPatientId === id) setSelectedPatientId(null);
      fetchPatients();
    }
  };

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      alert('Modo Demo: Cita agendada localmente (no persistente)');
      setIsAppointmentModalOpen(false);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    // Combine date and time inputs
    const date = rawData.appointment_date as string;
    const time = rawData.appointment_time as string;
    const start_time = new Date(`${date}T${time}`).toISOString();
    const end_time = new Date(new Date(start_time).getTime() + 30 * 60000).toISOString();
    
    const data = {
      patient_id: rawData.patient_id,
      notes: rawData.notes,
      start_time,
      end_time,
      type: 'presencial'
    };
    
    if (editingAppointment) {
      const { error } = await supabase.from('appointments').update(data).eq('id', editingAppointment.id);
      if (error) {
        alert('Error al actualizar cita: ' + error.message);
      } else {
        setEditingAppointment(null);
        setIsAppointmentModalOpen(false);
        fetchAppointments();
      }
    } else {
      // Check for duplicates
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', data.patient_id)
        .eq('start_time', data.start_time)
        .maybeSingle();

      if (existing) {
        alert('Ya existe una cita para este paciente en este horario.');
        return;
      }

      const { error } = await supabase.from('appointments').insert([data]);
      if (error) {
        alert('Error al agendar cita: ' + error.message);
      } else {
        setIsAppointmentModalOpen(false);
        fetchAppointments();
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) fetchAppointments();
  };

  const handleAddConsultation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Consulta guardada localmente (no persistente)');
      setIsConsultationModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData.entries()), patient_id: selectedPatientId };
    
    if (editingConsultation) {
      const { error } = await supabase.from('consultations').update(data).eq('id', editingConsultation.id);
      if (error) {
        alert('Error al actualizar nota: ' + error.message);
      } else {
        setEditingConsultation(null);
        setIsConsultationModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    } else {
      const { error } = await supabase.from('consultations').insert([data]);
      if (error) {
        alert('Error al guardar nota: ' + error.message);
      } else {
        setIsConsultationModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    const { error } = await supabase.from('consultations').delete().eq('id', id);
    if (!error && selectedPatientId) fetchPatientDetail(selectedPatientId);
  };

  const handleAddCondition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Condición agregada localmente (no persistente)');
      setIsConditionModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData.entries()), patient_id: selectedPatientId };
    
    if (editingCondition) {
      const { error } = await supabase.from('chronic_conditions').update(data).eq('id', editingCondition.id);
      if (error) {
        alert('Error al actualizar condición: ' + error.message);
      } else {
        setEditingCondition(null);
        setIsConditionModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    } else {
      const { error } = await supabase.from('chronic_conditions').insert([data]);
      if (error) {
        alert('Error al agregar condición: ' + error.message);
      } else {
        setIsConditionModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    }
  };

  const handleDeleteCondition = async (id: string) => {
    if (!confirm('¿Eliminar esta patología?')) return;
    const { error } = await supabase.from('chronic_conditions').delete().eq('id', id);
    if (!error && selectedPatientId) fetchPatientDetail(selectedPatientId);
  };

  const handleAddMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Medicamento agregado localmente (no persistente)');
      setIsMedicationModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData.entries()), patient_id: selectedPatientId };
    
    if (editingMedication) {
      const { error } = await supabase.from('medications').update(data).eq('id', editingMedication.id);
      if (error) {
        alert('Error al actualizar medicamento: ' + error.message);
      } else {
        setEditingMedication(null);
        setIsMedicationModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    } else {
      const { error } = await supabase.from('medications').insert([data]);
      if (error) {
        alert('Error al agregar medicamento: ' + error.message);
      } else {
        setIsMedicationModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('¿Eliminar este medicamento?')) return;
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (!error && selectedPatientId) fetchPatientDetail(selectedPatientId);
  };

  const handleAddLab = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Resultado de laboratorio agregado localmente (no persistente)');
      setIsLabModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData.entries()), patient_id: selectedPatientId };
    
    if (editingLab) {
      const { error } = await supabase.from('lab_results').update(data).eq('id', editingLab.id);
      if (!error) {
        setEditingLab(null);
        setIsLabModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    } else {
      const { error } = await supabase.from('lab_results').insert([data]);
      if (!error) {
        setIsLabModalOpen(false);
        fetchPatientDetail(selectedPatientId);
      }
    }
  };

  const handleDeleteLab = async (id: string) => {
    if (!confirm('¿Eliminar este resultado?')) return;
    const { error } = await supabase.from('lab_results').delete().eq('id', id);
    if (!error && selectedPatientId) fetchPatientDetail(selectedPatientId);
  };

  const SofaCalculator = () => {
    const [scores, setScores] = useState<Record<string, number>>({ resp: 0, coag: 0, liver: 0, cv: 0, cns: 0, renal: 0 });
    const total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Respiratorio (PaO2/FiO2)', key: 'resp', options: ['>400 (0)', '<400 (1)', '<300 (2)', '<200 + VM (3)', '<100 + VM (4)'] },
            { label: 'Coagulación (Plaquetas)', key: 'coag', options: ['>150 (0)', '<150 (1)', '<100 (2)', '<50 (3)', '<20 (4)'] },
            { label: 'Hígado (Bilirrubina)', key: 'liver', options: ['<1.2 (0)', '1.2-1.9 (1)', '2.0-5.9 (2)', '6.0-11.9 (3)', '>12.0 (4)'] },
            { label: 'Cardiovascular (PAM/Drogas)', key: 'cv', options: ['PAM >70 (0)', 'PAM <70 (1)', 'Dopa <5 (2)', 'Dopa 5-15 (3)', 'Dopa >15 (4)'] },
            { label: 'SNC (Glasgow)', key: 'cns', options: ['15 (0)', '13-14 (1)', '10-12 (2)', '6-9 (3)', '<6 (4)'] },
            { label: 'Renal (Creatinina/Gasto)', key: 'renal', options: ['<1.2 (0)', '1.2-1.9 (1)', '2.0-3.4 (2)', '3.5-4.9 (3)', '>5.0 (4)'] },
          ].map(item => (
            <div key={item.key} className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</label>
              <select 
                className="w-full bg-slate-50 rounded-xl p-3 text-xs outline-none"
                onChange={(e) => setScores({ ...scores, [item.key]: parseInt(e.target.value) })}
              >
                {item.options.map((opt, i) => <option key={i} value={i}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="p-6 bg-indigo-600 rounded-3xl text-center text-white">
          <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Puntaje Total SOFA</p>
          <p className="text-4xl font-bold">{total}</p>
          <p className="text-xs mt-2 opacity-90">Mortalidad estimada: {total > 15 ? '>90%' : total > 12 ? '50-95%' : 'Variable'}</p>
        </div>
      </div>
    );
  };

  const Curb65Calculator = () => {
    const [criteria, setCriteria] = useState<Record<string, boolean>>({ c: false, u: false, r: false, b: false, a: false });
    const total = Object.values(criteria).filter(Boolean).length;

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {[
            { label: 'Confusión (nueva)', key: 'c' },
            { label: 'Urea > 19 mg/dL (7 mmol/L)', key: 'u' },
            { label: 'Frec. Resp. ≥ 30/min', key: 'r' },
            { label: 'PAS < 90 o PAD ≤ 60 mmHg', key: 'b' },
            { label: 'Edad ≥ 65 años', key: 'a' },
          ].map(item => (
            <button 
              key={item.key}
              onClick={() => setCriteria({ ...criteria, [item.key as keyof typeof criteria]: !criteria[item.key as keyof typeof criteria] })}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                criteria[item.key as keyof typeof criteria] ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-600'
              }`}
            >
              <span className="text-sm font-bold">{item.label}</span>
              {criteria[item.key as keyof typeof criteria] && <CheckCircle2 className="w-5 h-5" />}
            </button>
          ))}
        </div>
        <div className="p-6 bg-emerald-600 rounded-3xl text-center text-white">
          <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Puntaje CURB-65</p>
          <p className="text-4xl font-bold">{total}</p>
          <p className="text-xs mt-2 opacity-90">
            {total <= 1 ? 'Tratamiento Ambulatorio' : total === 2 ? 'Considerar Hospitalización' : 'Hospitalización Urgente'}
          </p>
        </div>
      </div>
    );
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Map username to demo email
    if (email === 'asistente') email = 'asistente@demo.com';
    if (email === 'medicina_interna') email = 'medicina_interna@demo.com';

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('¡Registro exitoso! Por favor verifica tu correo.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const handleDemoLogin = async () => {
    if (!isSupabaseConfigured) {
      setUser({ id: 'mock-medico', email: 'medico@demo.com' });
      setUserProfile({ id: 'mock-medico', role: 'Medico', full_name: 'Dr. Jesús Monteón (Demo)' });
      setAuthLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: 'medicina_interna@demo.com',
      password: 'prueba1234'
    });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'medicina_interna@demo.com',
        password: 'prueba1234',
        options: { data: { role: 'Medico', full_name: 'Dr. Jesús Monteón' } }
      });
      if (signUpError) alert('Error al crear cuenta demo: ' + signUpError.message);
      else alert('Cuenta demo creada. Por favor intente entrar de nuevo.');
    }
  };

  const handleAssistantLogin = async () => {
    if (!isSupabaseConfigured) {
      setUser({ id: 'mock-asistente', email: 'asistente@demo.com' });
      setUserProfile({ id: 'mock-asistente', role: 'Asistente', full_name: 'Asistente Clínica (Demo)' });
      setAuthLoading(false);
      return;
    }
    const email = 'asistente@demo.com';
    const password = 'prueba123';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'Asistente', full_name: 'Asistente Clínica' } }
      });
      if (signUpError) alert('Error al crear cuenta asistente: ' + signUpError.message);
      else alert('Cuenta asistente creada. Por favor intente entrar de nuevo.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSaveHistory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Historia guardada localmente (no persistente)');
      setIsHistoryModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const historyData = Object.fromEntries(formData.entries());

    const { error } = await supabase
      .from('clinical_histories')
      .upsert({
        patient_id: selectedPatientId,
        ...historyData,
        updated_at: new Date().toISOString()
      });

    if (error) alert(error.message);
    else {
      setIsHistoryModalOpen(false);
      fetchPatientDetail(selectedPatientId);
    }
  };

  const handleSaveVitals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Signos vitales guardados localmente (no persistente)');
      setIsVitalsModalOpen(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const vitalsData = Object.fromEntries(formData.entries());

    const { error } = await supabase
      .from('vital_signs')
      .insert({
        patient_id: selectedPatientId,
        ...vitalsData,
        created_at: new Date().toISOString()
      });

    if (error) alert(error.message);
    else {
      setIsVitalsModalOpen(false);
      fetchPatientDetail(selectedPatientId);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('full_name') as string;

    if (!isSupabaseConfigured) {
      const updated = { ...userProfile, full_name };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated));
      setUserProfile(updated as any);
      alert('Modo Demo: Perfil actualizado en tu navegador');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        full_name, 
        updated_at: new Date().toISOString() 
      });

    if (error) alert('Error al actualizar perfil: ' + error.message);
    else {
      alert('Perfil actualizado con éxito');
      fetchProfile(user.id);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password) {
      alert('Por favor, introduce una nueva contraseña');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!isSupabaseConfigured) {
      alert('Modo Demo: Contraseña "actualizada" (no persistente)');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) alert('Error al actualizar contraseña: ' + error.message);
    else {
      alert('Contraseña actualizada con éxito');
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!isSupabaseConfigured) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = { ...userProfile, avatar_url: base64String };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updated));
        setUserProfile(updated as any);
        alert('Modo Demo: Foto guardada en tu navegador');
      };
      reader.readAsDataURL(file);
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Error al subir imagen: ' + uploadError.message + '. Asegúrate de haber configurado las Políticas (Policies) en el bucket "media" de Supabase.');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) alert('Error al vincular imagen: ' + updateError.message);
    else fetchProfile(user.id);
  };

  // --- Views ---

  const DashboardView = () => {
    const todayAppointments = appointments.filter(a => {
      try { return a.start_time && isToday(parseISO(a.start_time)); } catch { return false; }
    });
    
    // Calculate weekly and monthly appointments
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weekAppointments = appointments.filter(a => {
      try { return a.start_time && parseISO(a.start_time) >= startOfWeek; } catch { return false; }
    });
    const monthAppointments = appointments.filter(a => {
      try { return a.start_time && parseISO(a.start_time) >= startOfMonth; } catch { return false; }
    });
    
    // Assume $500 per appointment for income calculation
    const estimatedIncome = monthAppointments.length * 500;

    const stats = [
      { label: 'Pacientes Totales', value: patients.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Citas Hoy', value: todayAppointments.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Citas Semana', value: weekAppointments.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Ingresos Mes', value: `$${estimatedIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {userProfile?.role === 'Medico' && (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                <img 
                  src="https://img.freepik.com/vector-premium/plantilla-logotipo-sanitario_1283348-17032.jpg?semt=ais_hybrid&w=740&q=80" 
                  className="w-full h-full object-cover"
                  alt="Medico Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <h3 className="font-bold text-slate-800 text-xl">Resumen General</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                setUserProfile(prev => prev ? { ...prev, role: prev.role === 'Medico' ? 'Asistente' : 'Medico' } : null);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Cambiar a {userProfile?.role === 'Medico' ? 'Asistente' : 'Médico'}
            </button>
            <button 
              onClick={() => setIsPatientModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Nuevo Paciente
            </button>
            {userProfile?.role === 'Medico' && (
              <button 
                onClick={seedSampleData}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Cargar Datos
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="flex items-center gap-6">
              <div className={`p-4 ${stat.bg} rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 text-lg">Actividad de Consultas</h3>
              <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none">
                <option>Últimos 7 días</option>
                <option>Último mes</option>
              </select>
            </div>
            <div className="h-80 w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Lun', val: 12 }, { day: 'Mar', val: 18 }, { day: 'Mie', val: 15 },
                  { day: 'Jue', val: 22 }, { day: 'Vie', val: 20 }, { day: 'Sab', val: 8 }, { day: 'Dom', val: 2 }
                ]}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} fill="url(#dashGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 text-lg">Agenda de Hoy</h3>
              <button onClick={() => setActiveTab('agenda')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Ver Todo</button>
            </div>
            <div className="space-y-6">
              {todayAppointments.length > 0 ? todayAppointments.map(app => (
                <div key={app.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs font-bold text-slate-800">{format(parseISO(app.start_time), 'HH:mm')}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">AM</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{app.first_name} {app.last_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{app.type} • {app.notes || 'Sin notas'}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-sm text-slate-400">No hay citas para hoy</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <Card className="md:w-1/3 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-4 bg-slate-100 flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{userProfile?.full_name || 'Usuario'}</h3>
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-2 uppercase tracking-widest">{userProfile?.role}</p>
            <p className="text-xs text-slate-400 mt-4">{user?.email}</p>
          </Card>

          {/* Settings Section */}
          <div className="md:w-2/3 space-y-8">
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg"><UserIcon className="w-5 h-5 text-indigo-600" /></div>
                <h3 className="font-bold text-slate-800">Datos Personales</h3>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input 
                    name="full_name"
                    type="text" 
                    defaultValue={userProfile?.full_name}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Tu nombre..."
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Actualizar Datos</button>
              </form>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-lg"><Key className="w-5 h-5 text-rose-600" /></div>
                <h3 className="font-bold text-slate-800">Seguridad</h3>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <div className="relative">
                      <input 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <input 
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">Cambiar Contraseña</button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const MediaView = () => {
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMedia = async () => {
      if (!isSupabaseConfigured) return;
      const { data, error } = await supabase.storage.from('media').list();
      if (error) console.error(error);
      else setMediaFiles(data || []);
    };

    useEffect(() => {
      fetchMedia();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isSupabaseConfigured) {
        alert('Modo Demo: Archivo "subido" (no persistente)');
        return;
      }

      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('media').upload(fileName, file);

      if (error) alert('Error al subir: ' + error.message);
      else {
        fetchMedia();
        alert('Archivo subido con éxito');
      }
      setIsUploading(false);
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xl">Gestión de Medios</h3>
          <label className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {mediaFiles.length > 0 ? mediaFiles.map((file, i) => {
            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(file.name);
            const isImage = file.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                {isImage ? (
                  <img src={publicUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                    <FolderOpen className="w-8 h-8 text-slate-300" />
                    <p className="text-[8px] font-bold text-slate-400 mt-2 px-2 text-center truncate w-full">{file.name}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-all">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Image className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold">No hay archivos en la biblioteca</p>
              <p className="text-xs text-slate-300 mt-1">Sube fotos o documentos para verlos aquí</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ToolsView = () => {
    const [bmi, setBmi] = useState<{ weight: string, height: string, result: number | null }>({ weight: '', height: '', result: null });
    
    const calculateBmi = () => {
      const w = parseFloat(bmi.weight);
      const h = parseFloat(bmi.height) / 100;
      if (w && h) setBmi({ ...bmi, result: parseFloat((w / (h * h)).toFixed(1)) });
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
        <Card>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calculator className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Calculadora de IMC</h3>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Peso (kg)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:border-indigo-100 outline-none transition-all"
                  value={bmi.weight}
                  onChange={e => setBmi({ ...bmi, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Altura (cm)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm focus:bg-white focus:border-indigo-100 outline-none transition-all"
                  value={bmi.height}
                  onChange={e => setBmi({ ...bmi, height: e.target.value })}
                />
              </div>
            </div>
            <button 
              onClick={calculateBmi}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Calcular IMC
            </button>
            {bmi.result && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-indigo-50 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Resultado IMC</p>
                <p className="text-4xl font-bold text-indigo-700">{bmi.result}</p>
                <p className="text-xs font-bold text-indigo-600 mt-2">
                  {bmi.result < 18.5 ? 'Bajo peso' : bmi.result < 25 ? 'Normal' : bmi.result < 30 ? 'Sobrepeso' : 'Obesidad'}
                </p>
              </motion.div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-rose-50 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Escalas Clínicas</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'SOFA Score', id: 'sofa' },
              { name: 'CURB-65', id: 'curb65' },
              { name: 'APACHE II', id: 'apache' },
              { name: 'Framingham Risk', id: 'framingham' }
            ].map(scale => (
              <div 
                key={scale.id} 
                onClick={() => setSelectedScale(scale.id)}
                className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <span className="text-sm font-bold text-slate-700">{scale.name}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // --- Render ---

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 font-bold text-indigo-600">
      <motion.img 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        src="https://img.freepik.com/vector-premium/plantilla-logotipo-sanitario_1283348-17032.jpg?semt=ais_hybrid&w=740&q=80" 
        className="w-32 h-32 rounded-3xl shadow-2xl mb-6 object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="animate-pulse">Cargando MedInterna...</div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {!isSupabaseConfigured && (
          <div className="mb-6 w-full max-w-md bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Modo Demo Activado</p>
              <p className="text-xs opacity-80">No se ha conectado una base de datos. Los cambios se guardarán localmente en tu navegador.</p>
            </div>
          </div>
        )}
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-2xl shadow-lg shadow-indigo-100">
              <img 
                src="https://img.freepik.com/vector-premium/plantilla-logotipo-sanitario_1283348-17032.jpg?semt=ais_hybrid&w=740&q=80" 
                className="w-full h-full object-cover"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Dr. Jesús Monteón</h1>
            <p className="text-slate-400 text-sm mt-2">Medicina Interna - Gestión Clínica</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Usuario o Correo</label>
              <input 
                name="email" 
                type="text" 
                required 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" 
                placeholder="asistente o doctor@ejemplo.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          {authMode === 'login' && (
            <div className="mt-4 space-y-3">
              <button 
                onClick={handleDemoLogin}
                className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Acceso Médico (Demo)
              </button>
              <button 
                onClick={handleAssistantLogin}
                className="w-full bg-amber-50 text-amber-700 py-4 rounded-2xl font-bold border border-amber-100 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
              >
                <UserIcon className="w-5 h-5" />
                Acceso Asistente (Demo)
              </button>
              <div className="space-y-1">
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Médico: medicina_interna / prueba1234</p>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Asistente: asistente / prueba123</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:w-96"
          >
            <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-indigo-400/30 backdrop-blur-xl">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">¡Instala la App!</p>
                <p className="text-[10px] opacity-80">Accede más rápido desde tu pantalla de inicio.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-50 transition-all"
                >
                  Instalar
                </button>
                <button 
                  onClick={() => setShowInstallBanner(false)}
                  className="text-[10px] font-bold uppercase opacity-60 hover:opacity-100"
                >
                  Después
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 overflow-hidden rounded-xl shadow-lg shadow-indigo-100">
                <img 
                  src="https://img.freepik.com/vector-premium/plantilla-logotipo-sanitario_1283348-17032.jpg?semt=ais_hybrid&w=740&q=80" 
                  className="w-full h-full object-cover"
                  alt="Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="font-bold text-lg text-slate-800">Dr. Monteón</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Medico', 'Asistente'] },
              { id: 'patients', label: 'Pacientes', icon: Users, roles: ['Medico'] },
              { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['Medico', 'Asistente'] },
              { id: 'tools', label: 'Herramientas', icon: Calculator, roles: ['Medico'] },
              { id: 'media', label: 'Medios', icon: Image, roles: ['Medico'] },
              { id: 'profile', label: 'Perfil', icon: UserIcon, roles: ['Medico', 'Asistente'] },
            ].filter(item => item.roles.includes(userProfile?.role || 'Medico')).map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Soporte Premium</p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">Acceso directo a consultoría técnica 24/7.</p>
            <a 
              href="https://wa.me/525624222449" 
              target="_blank" 
              rel="noreferrer"
              className="block w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 hover:bg-slate-100 transition-all text-center"
            >
              Contactar
            </a>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-500 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-bold text-slate-800 text-lg capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar..."
                className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Bell className="w-5 h-5" /></button>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden hover:border-indigo-100 transition-all"
            >
              <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Doctor" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'media' && <MediaView />}
          
          {activeTab === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-full">
              {/* Patient List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Lista de Pacientes</h3>
                  <button 
                    onClick={() => setIsPatientModalOpen(true)} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Nuevo</span>
                  </button>
                </div>
                      <div className="space-y-2">
                        {filteredPatients.map(p => (
                          <div key={p.id} className="relative group">
                            <button
                              onClick={() => setSelectedPatientId(p.id)}
                              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 ${
                                selectedPatientId === p.id ? 'bg-white shadow-md border-indigo-100 border' : 'hover:bg-white/50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedPatientId === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {p.first_name[0]}{p.last_name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{p.first_name} {p.last_name}</p>
                                <p className="text-[10px] font-bold text-slate-400">ID: #{p.id.slice(0, 8)}</p>
                              </div>
                            </button>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingPatient(p); setIsPatientModalOpen(true); }}
                                className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePatient(p.id); }}
                                className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-600 rounded-lg shadow-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
              </div>

              {/* Patient Detail */}
              <div className="lg:col-span-3">
                {patientDetail ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Card className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-100">
                          {patientDetail.first_name[0]}{patientDetail.last_name[0]}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">{patientDetail.first_name} {patientDetail.last_name}</h2>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {patientDetail.date_of_birth}</span>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{patientDetail.blood_type}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {patientDetail.allergies && (
                              <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
                                <p className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">Alergias</p>
                                <p className="text-xs font-bold text-rose-700">{patientDetail.allergies}</p>
                              </div>
                            )}
                            {patientDetail.chronic_history && (
                              <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                                <p className="text-[10px] font-bold text-amber-400 uppercase leading-none mb-1">Antecedentes</p>
                                <p className="text-xs font-bold text-amber-700">{patientDetail.chronic_history}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setIsConsultationModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Nueva Consulta</button>
                        <button onClick={() => setIsAppointmentModalOpen(true)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">Agendar Cita</button>
                      </div>
                    </Card>

                    {/* Sub-Tabs Navigation */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                      {[
                        { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
                        { id: 'consultations', label: 'Consultas', icon: FileText },
                        { id: 'history', label: 'Historial', icon: Activity },
                        { id: 'labs', label: 'Laboratorio', icon: FlaskConical },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setPatientSubTab(tab.id as any)}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            patientSubTab === tab.id 
                              ? 'bg-white text-indigo-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {patientSubTab === 'summary' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        {/* AI Assistant Section */}
                        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl shadow-indigo-100 overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-8 opacity-10"><Brain className="w-32 h-32" /></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md"><Brain className="w-5 h-5" /></div>
                                <h3 className="font-bold text-lg">Asistente Clínico IA</h3>
                              </div>
                              <button 
                                onClick={generateAiSummary}
                                disabled={isGeneratingAi}
                                className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
                              >
                                {isGeneratingAi ? 'Analizando...' : 'Generar Resumen'}
                              </button>
                            </div>
                            {aiSummary ? (
                              <div className="prose prose-invert prose-sm max-w-none bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                                <p className="whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
                              </div>
                            ) : (
                              <p className="text-indigo-100 text-sm italic">Haga clic en "Generar Resumen" para que la IA analice el expediente completo y proporcione insights clínicos.</p>
                            )}
                          </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Card>
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-rose-500" /> Patologías</h4>
                              <button onClick={() => setIsConditionModalOpen(true)} className="text-slate-400 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                              {patientDetail.conditions.map(c => (
                                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all group relative">
                                  <p className="font-bold text-sm text-slate-700">{c.condition_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{c.status} • Desde {c.diagnosis_date}</p>
                                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingCondition(c); setIsConditionModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Settings className="w-3 h-3" /></button>
                                    <button onClick={() => handleDeleteCondition(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>

                          <Card>
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Pill className="w-4 h-4 text-amber-500" /> Medicación</h4>
                              <button onClick={() => setIsMedicationModalOpen(true)} className="text-slate-400 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                              {patientDetail.medications.map(m => (
                                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all group relative">
                                  <p className="font-bold text-sm text-slate-700">{m.medication_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{m.dosage} • {m.frequency}</p>
                                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingMedication(m); setIsMedicationModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Settings className="w-3 h-3" /></button>
                                    <button onClick={() => handleDeleteMedication(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {patientSubTab === 'consultations' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <Card>
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Notas de Evolución</h4>
                            <button onClick={() => setIsConsultationModalOpen(true)} className="text-slate-400 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
                          </div>
                          <div className="space-y-4">
                            {patientDetail.consultations.map(c => (
                              <div key={c.id} className="p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{c.consultation_date}</p>
                                    <p className="font-bold text-slate-800 mt-1">{c.reason_for_visit}</p>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingConsultation(c); setIsConsultationModalOpen(true); }} className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm"><Settings className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteConsultation(c.id)} className="p-2 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase text-[9px] mb-1">Subjetivo</p>
                                    <p className="text-slate-600 line-clamp-2">{c.subjective}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase text-[9px] mb-1">Objetivo</p>
                                    <p className="text-slate-600 line-clamp-2">{c.objective}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase text-[9px] mb-1">Análisis</p>
                                    <p className="text-slate-600 line-clamp-2">{c.assessment}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-400 uppercase text-[9px] mb-1">Plan</p>
                                    <p className="text-slate-600 line-clamp-2">{c.plan}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {patientSubTab === 'history' && (
                      <ClinicalHistoryView 
                        detail={patientDetail} 
                        onEdit={() => setIsHistoryModalOpen(true)} 
                        onAddVitals={() => setIsVitalsModalOpen(true)}
                      />
                    )}

                    {patientSubTab === 'labs' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <Card>
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-emerald-500" /> Laboratorios</h4>
                            <button onClick={() => setIsLabModalOpen(true)} className="text-slate-400 hover:text-indigo-600"><Plus className="w-5 h-5" /></button>
                          </div>
                          <div className="space-y-4">
                            {patientDetail.labs.map(l => (
                              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 transition-all group relative">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-sm text-slate-700">{l.test_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{l.test_date}</p>
                                  </div>
                                  <div className="text-right flex items-center gap-4">
                                    <p className="font-bold text-indigo-600">{l.value} <span className="text-[10px] text-slate-400">{l.unit}</span></p>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingLab(l); setIsLabModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Settings className="w-3 h-3" /></button>
                                      <button onClick={() => handleDeleteLab(l.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <Users className="w-16 h-16 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Seleccione un Paciente</h3>
                    <p className="text-slate-400 text-sm max-w-xs">Elija un expediente de la lista lateral para comenzar el análisis clínico.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xl">Gestión de Citas</h3>
                <button onClick={() => setIsAppointmentModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Cita
                </button>
              </div>
              <Card>
                <div className="space-y-4">
                  {appointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{format(parseISO(app.start_time), 'MMM')}</p>
                          <p className="text-xl font-bold text-slate-800">{format(parseISO(app.start_time), 'dd')}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">{app.first_name} {app.last_name}</p>
                          <p className="text-xs font-bold text-indigo-600 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {format(parseISO(app.start_time), 'HH:mm')} - {format(parseISO(app.end_time), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Cita</p>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">{app.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingAppointment(app);
                              setIsAppointmentModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Editar Cita"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAppointment(app.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar Cita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-20">
                      <Calendar className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400">No hay citas programadas</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'tools' && <ToolsView />}
        </div>
      </main>

      {/* MODALS */}
      
      <Modal isOpen={isPatientModalOpen} onClose={() => { setIsPatientModalOpen(false); setEditingPatient(null); }} title={editingPatient ? "Editar Expediente" : "Nuevo Expediente"}>
        <form onSubmit={handleCreatePatient} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" required defaultValue={editingPatient?.first_name} placeholder="Nombre" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
            <input name="last_name" required defaultValue={editingPatient?.last_name} placeholder="Apellido" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha de Nacimiento</label>
              <input type="date" name="date_of_birth" required defaultValue={editingPatient?.date_of_birth} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Género</label>
              <select name="gender" defaultValue={editingPatient?.gender || 'M'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="blood_type" defaultValue={editingPatient?.blood_type} placeholder="Tipo Sangre" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
            <input name="phone" defaultValue={editingPatient?.phone} placeholder="Teléfono" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
          </div>
          <input name="email" type="email" defaultValue={editingPatient?.email} placeholder="Correo Electrónico" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
          <input name="address" defaultValue={editingPatient?.address} placeholder="Dirección" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10" />
          <div className="grid grid-cols-2 gap-4">
            <textarea name="allergies" defaultValue={editingPatient?.allergies} placeholder="Alergias (Ej. Penicilina)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-indigo-500/10" />
            <textarea name="chronic_history" defaultValue={editingPatient?.chronic_history} placeholder="Antecedentes Crónicos (Ej. HTA, DM2)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-indigo-500/10" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingPatient ? "Guardar Cambios" : "Crear Expediente"}</button>
        </form>
      </Modal>

      <Modal isOpen={isAppointmentModalOpen} onClose={() => { setIsAppointmentModalOpen(false); setEditingAppointment(null); }} title={editingAppointment ? "Editar Cita" : "Nueva Cita"}>
        <form onSubmit={handleAddAppointment} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Paciente</label>
              {!editingAppointment && (
                <button 
                  type="button"
                  onClick={() => { setIsAppointmentModalOpen(false); setIsPatientModalOpen(true); }}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
                >
                  + Nuevo Paciente
                </button>
              )}
            </div>
            <select name="patient_id" required defaultValue={editingAppointment?.patient_id} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none">
              <option value="">Seleccionar Paciente</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fecha</label>
              <input 
                type="date" 
                name="appointment_date" 
                required 
                defaultValue={editingAppointment?.start_time ? new Date(editingAppointment.start_time).toISOString().split('T')[0] : ''} 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hora</label>
              <input 
                type="time" 
                name="appointment_time" 
                required 
                defaultValue={editingAppointment?.start_time ? new Date(editingAppointment.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''} 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" 
              />
            </div>
          </div>
          <textarea name="notes" defaultValue={editingAppointment?.notes} placeholder="Notas adicionales..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingAppointment ? "Guardar Cambios" : "Agendar Cita"}</button>
        </form>
      </Modal>

      <Modal isOpen={isConsultationModalOpen} onClose={() => { setIsConsultationModalOpen(false); setEditingConsultation(null); }} title={editingConsultation ? "Editar Nota de Evolución" : "Nueva Nota de Evolución"}>
        <form onSubmit={handleAddConsultation} className="space-y-6">
          <input name="reason_for_visit" required defaultValue={editingConsultation?.reason_for_visit} placeholder="Motivo de Consulta" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <textarea name="subjective" defaultValue={editingConsultation?.subjective} placeholder="Subjetivo (S)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-32" />
            <textarea name="objective" defaultValue={editingConsultation?.objective} placeholder="Objetivo (O)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-32" />
          </div>
          <textarea name="assessment" required defaultValue={editingConsultation?.assessment} placeholder="Evaluación (A)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
          <textarea name="plan" required defaultValue={editingConsultation?.plan} placeholder="Plan (P)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-32" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingConsultation ? "Guardar Cambios" : "Guardar Nota"}</button>
        </form>
      </Modal>

      <Modal isOpen={isConditionModalOpen} onClose={() => { setIsConditionModalOpen(false); setEditingCondition(null); }} title={editingCondition ? "Editar Patología" : "Nueva Patología"}>
        <form onSubmit={handleAddCondition} className="space-y-6">
          <input name="condition_name" required defaultValue={editingCondition?.condition_name} placeholder="Nombre de la Condición" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="diagnosis_date" required defaultValue={editingCondition?.diagnosis_date} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            <select name="status" defaultValue={editingCondition?.status || 'active'} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none">
              <option value="active">Activo</option>
              <option value="controlled">Controlado</option>
            </select>
          </div>
          <textarea name="notes" defaultValue={editingCondition?.notes} placeholder="Notas..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingCondition ? "Guardar Cambios" : "Añadir Condición"}</button>
        </form>
      </Modal>

      <Modal isOpen={isMedicationModalOpen} onClose={() => { setIsMedicationModalOpen(false); setEditingMedication(null); }} title={editingMedication ? "Editar Medicación" : "Nueva Medicación"}>
        <form onSubmit={handleAddMedication} className="space-y-6">
          <input name="medication_name" required defaultValue={editingMedication?.medication_name} placeholder="Medicamento" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input name="dosage" required defaultValue={editingMedication?.dosage} placeholder="Dosis" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            <input name="frequency" required defaultValue={editingMedication?.frequency} placeholder="Frecuencia" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          </div>
          <input type="date" name="start_date" required defaultValue={editingMedication?.start_date} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingMedication ? "Guardar Cambios" : "Añadir Medicamento"}</button>
        </form>
      </Modal>

      <Modal isOpen={isLabModalOpen} onClose={() => { setIsLabModalOpen(false); setEditingLab(null); }} title={editingLab ? "Editar Resultado" : "Nuevo Resultado de Laboratorio"}>
        <form onSubmit={handleAddLab} className="space-y-6">
          <input name="test_name" required defaultValue={editingLab?.test_name} placeholder="Estudio" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <div className="grid grid-cols-3 gap-4">
            <input name="value" required defaultValue={editingLab?.value} placeholder="Valor" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            <input name="unit" defaultValue={editingLab?.unit} placeholder="Unidad" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            <input name="reference_range" defaultValue={editingLab?.reference_range} placeholder="Rango Ref." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          </div>
          <input type="date" name="test_date" required defaultValue={editingLab?.test_date} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{editingLab ? "Guardar Cambios" : "Guardar Resultado"}</button>
        </form>
      </Modal>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Editar Historial Clínico">
        <form onSubmit={handleSaveHistory} className="space-y-8 max-h-[70vh] overflow-y-auto px-2">
          {/* 1. Perfil Sociodemográfico */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">1. Perfil Sociodemográfico</h4>
            <div className="grid grid-cols-2 gap-4">
              <input name="occupation" defaultValue={patientDetail?.clinical_history?.occupation} placeholder="Ocupación" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="marital_status" defaultValue={patientDetail?.clinical_history?.marital_status} placeholder="Estado Civil" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="education_level" defaultValue={patientDetail?.clinical_history?.education_level} placeholder="Escolaridad" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="religion" defaultValue={patientDetail?.clinical_history?.religion} placeholder="Religión" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="emergency_contact_name" defaultValue={patientDetail?.clinical_history?.emergency_contact_name} placeholder="Contacto Emergencia" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="emergency_contact_phone" defaultValue={patientDetail?.clinical_history?.emergency_contact_phone} placeholder="Teléfono Emergencia" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="emergency_contact_relationship" defaultValue={patientDetail?.clinical_history?.emergency_contact_relationship} placeholder="Parentesco" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>

          {/* 2. Antecedentes Heredofamiliares */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">2. Antecedentes Heredofamiliares</h4>
            <textarea name="family_history_chronic" defaultValue={patientDetail?.clinical_history?.family_history_chronic} placeholder="Crónico-Degenerativos (DM, HTA, Cardiopatías...)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            <textarea name="family_history_oncologic" defaultValue={patientDetail?.clinical_history?.family_history_oncologic} placeholder="Oncológicos (Cáncer en 1er grado...)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            <textarea name="family_history_autoimmune" defaultValue={patientDetail?.clinical_history?.family_history_autoimmune} placeholder="Autoinmunes (Lupus, AR...)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
          </div>

          {/* 3. Antecedentes No Patológicos */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">3. Antecedentes No Patológicos</h4>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="smoking_index" defaultValue={patientDetail?.clinical_history?.smoking_index} placeholder="Índice Tabáquico" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="alcohol_frequency" defaultValue={patientDetail?.clinical_history?.alcohol_frequency} placeholder="Alcoholismo (Frecuencia)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <textarea name="immunizations" defaultValue={patientDetail?.clinical_history?.immunizations} placeholder="Inmunizaciones (Influenza, COVID, Neumococo...)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            <div className="grid grid-cols-2 gap-4">
              <input name="zoonosis" defaultValue={patientDetail?.clinical_history?.zoonosis} placeholder="Zoonosis" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
              <input name="housing_services" defaultValue={patientDetail?.clinical_history?.housing_services} placeholder="Servicios Básicos" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>

          {/* 4. Antecedentes Patológicos */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">4. Antecedentes Patológicos</h4>
            <textarea name="previous_diseases" defaultValue={patientDetail?.clinical_history?.previous_diseases} placeholder="Enfermedades Previas" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            <div className="grid grid-cols-2 gap-4">
              <textarea name="surgical_history" defaultValue={patientDetail?.clinical_history?.surgical_history} placeholder="Quirúrgicos" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="traumatic_history" defaultValue={patientDetail?.clinical_history?.traumatic_history} placeholder="Traumáticos" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <textarea name="transfusion_history" defaultValue={patientDetail?.clinical_history?.transfusion_history} placeholder="Transfusionales" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="previous_hospitalizations" defaultValue={patientDetail?.clinical_history?.previous_hospitalizations} placeholder="Hospitalizaciones" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            </div>
          </div>

          {/* 6. Interrogatorio por Sistemas */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider border-b pb-2">6. Interrogatorio por Sistemas</h4>
            <div className="grid grid-cols-2 gap-4">
              <textarea name="sys_general" defaultValue={patientDetail?.clinical_history?.sys_general} placeholder="General" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="sys_cardiovascular" defaultValue={patientDetail?.clinical_history?.sys_cardiovascular} placeholder="Cardiovascular" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="sys_respiratory" defaultValue={patientDetail?.clinical_history?.sys_respiratory} placeholder="Respiratorio" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="sys_gastrointestinal" defaultValue={patientDetail?.clinical_history?.sys_gastrointestinal} placeholder="Gastrointestinal" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="sys_genitourinary" defaultValue={patientDetail?.clinical_history?.sys_genitourinary} placeholder="Genitourinario" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
              <textarea name="sys_neuro_psych" defaultValue={patientDetail?.clinical_history?.sys_neuro_psych} placeholder="Neurológico/Psiquiátrico" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none resize-none h-24" />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">Guardar Historial Completo</button>
        </form>
      </Modal>

      <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title="Registrar Signos Vitales">
        <form onSubmit={handleSaveVitals} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sistólica (mmHg)</label>
              <input type="number" name="ta_systolic" required placeholder="120" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Diastólica (mmHg)</label>
              <input type="number" name="ta_diastolic" required placeholder="80" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">FC (bpm)</label>
              <input type="number" name="fc" required placeholder="70" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">FR (rpm)</label>
              <input type="number" name="fr" required placeholder="16" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Temp (°C)</label>
              <input type="number" step="0.1" name="temp" required placeholder="36.5" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">SatO2 (%)</label>
              <input type="number" name="sato2" required placeholder="98" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Peso (kg)</label>
              <input type="number" step="0.1" name="weight" required placeholder="70" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Talla (cm)</label>
              <input type="number" name="height" required placeholder="170" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">IMC</label>
              <input type="number" step="0.1" name="imc" placeholder="24.2" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-100">Guardar Signos Vitales</button>
        </form>
      </Modal>

      {/* SCALE MODALS */}
      <Modal 
        isOpen={selectedScale === 'sofa'} 
        onClose={() => setSelectedScale(null)} 
        title="Calculadora SOFA Score"
      >
        <SofaCalculator />
      </Modal>

      <Modal 
        isOpen={selectedScale === 'curb65'} 
        onClose={() => setSelectedScale(null)} 
        title="Calculadora CURB-65"
      >
        <Curb65Calculator />
      </Modal>

      <Modal 
        isOpen={selectedScale === 'apache' || selectedScale === 'framingham'} 
        onClose={() => setSelectedScale(null)} 
        title="Próximamente"
      >
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Esta calculadora estará disponible en la próxima actualización.</p>
        </div>
      </Modal>
      </div>
    </ErrorBoundary>
  );
}
