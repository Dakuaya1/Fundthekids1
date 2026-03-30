import { useEffect, useState, type ComponentType } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Home,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';

type ServiceStatus =
  | 'NOT_STARTED'
  | 'READY_TO_START'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED';

interface GuardianChild {
  id: string;
  name: string;
  city: string;
  location: string;
  talentCategory: string;
  totalCommitted: number;
  totalReceived: number;
  isFunded: boolean;
  ngo: { name: string; region: string };
  serviceRecord?: {
    schoolStatus: ServiceStatus;
    lodgingStatus: ServiceStatus;
    activityStatus: ServiceStatus;
    schoolName?: string | null;
    lodgingDetails?: string | null;
    activityDetails?: string | null;
    notes?: string | null;
  } | null;
}

interface DashboardPayload {
  guardian: {
    fullName: string;
    region: string;
    organizationName?: string | null;
    specialties: string[];
  };
  summary: {
    assignedChildren: number;
    fundedChildren: number;
    deliveryInProgress: number;
  };
  children: GuardianChild[];
}

const statusOptions: ServiceStatus[] = [
  'NOT_STARTED',
  'READY_TO_START',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
];

const statusLabel: Record<ServiceStatus, string> = {
  NOT_STARTED: 'Not started',
  READY_TO_START: 'Ready to start',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
};

export default function GuardianDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/guardian/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load guardian dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = async (
    childId: string,
    field: 'schoolStatus' | 'lodgingStatus' | 'activityStatus',
    value: ServiceStatus,
  ) => {
    try {
      setSavingChildId(childId);
      setMessage('');
      await api.patch(`/guardian/services/${childId}`, { [field]: value });
      setData((current) =>
        current
          ? {
              ...current,
              children: current.children.map((child) =>
                child.id === childId
                  ? {
                      ...child,
                      serviceRecord: {
                        schoolStatus:
                          child.serviceRecord?.schoolStatus ?? 'NOT_STARTED',
                        lodgingStatus:
                          child.serviceRecord?.lodgingStatus ?? 'NOT_STARTED',
                        activityStatus:
                          child.serviceRecord?.activityStatus ?? 'NOT_STARTED',
                        schoolName: child.serviceRecord?.schoolName ?? null,
                        lodgingDetails:
                          child.serviceRecord?.lodgingDetails ?? null,
                        activityDetails:
                          child.serviceRecord?.activityDetails ?? null,
                        notes: child.serviceRecord?.notes ?? null,
                        [field]: value,
                      },
                    }
                  : child,
              ),
            }
          : current,
      );
      setMessage('Service delivery status updated.');
    } catch (error) {
      console.error('Failed to update guardian service', error);
      setMessage('Failed to update the service status.');
    } finally {
      setSavingChildId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card rounded-[2rem] p-8 text-slate-600 dark:text-slate-300">
        Guardian dashboard is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-8 border-l-4 border-l-amber-500"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              Guardian Delivery Desk
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 font-light">
              {data.guardian.fullName} coordinates the funded services that turn sponsorship into real delivery on the ground.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Region: {data.guardian.region}
              {data.guardian.organizationName
                ? ` • ${data.guardian.organizationName}`
                : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.guardian.specialties.map((specialty) => (
              <span
                key={specialty}
                className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Sparkles}
          label="Assigned Children"
          value={data.summary.assignedChildren}
          accent="text-amber-600"
        />
        <SummaryCard
          icon={Target}
          label="Funded Cases"
          value={data.summary.fundedChildren}
          accent="text-emerald-600"
        />
        <SummaryCard
          icon={Briefcase}
          label="Cases In Delivery"
          value={data.summary.deliveryInProgress}
          accent="text-blue-600"
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
          {message}
        </div>
      ) : null}

      <div className="space-y-6">
        {data.children.map((child) => (
          <div key={child.id} className="glass-card rounded-3xl p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {child.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {child.location}, {child.city} • Verified by {child.ngo.name}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {child.talentCategory} • Received ${child.totalReceived} of $
                  {child.totalCommitted} committed
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  child.isFunded
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}
              >
                {child.isFunded ? 'Ready for service delivery' : 'Waiting for funds'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <ServiceSelect
                icon={GraduationCap}
                label="Schooling"
                value={child.serviceRecord?.schoolStatus ?? 'NOT_STARTED'}
                disabled={savingChildId === child.id}
                onChange={(value) =>
                  handleServiceUpdate(child.id, 'schoolStatus', value)
                }
              />
              <ServiceSelect
                icon={Home}
                label="Lodging"
                value={child.serviceRecord?.lodgingStatus ?? 'NOT_STARTED'}
                disabled={savingChildId === child.id}
                onChange={(value) =>
                  handleServiceUpdate(child.id, 'lodgingStatus', value)
                }
              />
              <ServiceSelect
                icon={Target}
                label="Activities"
                value={child.serviceRecord?.activityStatus ?? 'NOT_STARTED'}
                disabled={savingChildId === child.id}
                onChange={(value) =>
                  handleServiceUpdate(child.id, 'activityStatus', value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
          <Icon className={`h-6 w-6 ${accent}`} />
        </div>
      </div>
    </div>
  );
}

function ServiceSelect({
  icon: Icon,
  label,
  value,
  onChange,
  disabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ServiceStatus;
  onChange: (value: ServiceStatus) => void;
  disabled: boolean;
}) {
  return (
    <label className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
          <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      </div>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ServiceStatus)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {statusLabel[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
