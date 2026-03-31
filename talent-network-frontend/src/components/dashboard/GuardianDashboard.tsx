'use client';

import { Trophy, GraduationCap, Home, Dumbbell, Sparkles } from 'lucide-react';
import { getGuardianChildren, getEducationState, getLodgingState, getSportsState, getStatusMeta } from '@/lib/guardianDashboard';

const MOCK_GUARDIAN_ID = 'guardian1';

export default function GuardianDashboard() {
  const children = getGuardianChildren(MOCK_GUARDIAN_ID);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_38%),linear-gradient(135deg,_#0f172a,_#1d4ed8_55%,_#22c55e_140%)] p-8 text-white shadow-2xl shadow-slate-900/15">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Guardian Operations
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight">
              Assigned Children
            </h2>
            <p className="mt-3 max-w-2xl text-base text-blue-50/85">
              Track every child&apos;s progress across education, lodging, and sports with a clean demo-ready guardian dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatPill label="Children" value={children.length} />
            <StatPill
              label="Education Ready"
              value={
                children.filter((child) => child.education.schoolFinalized).length
              }
            />
            <StatPill
              label="Sports Active"
              value={children.filter((child) => child.sports.enrolled).length}
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Assigned Children
          </h3>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Guardian ID: {MOCK_GUARDIAN_ID}
          </span>
        </div>

        {children.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            No assigned children found for this guardian.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {children.map((child) => (
              <article
                key={child.id}
                className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20"
              >
                <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {child.name}
                      </h4>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Age {child.age} • {child.talent}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                      <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5">
                  <StatusSection
                    title="Education"
                    icon={<GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
                    items={[
                      {
                        label: 'School Finalized',
                        state: getEducationState(child, 'schoolFinalized'),
                      },
                      {
                        label: 'Fees Paid',
                        state: getEducationState(child, 'feesPaid'),
                      },
                      {
                        label: 'Attending',
                        state: getEducationState(child, 'attending'),
                      },
                    ]}
                  />

                  <StatusSection
                    title="Lodging"
                    icon={<Home className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
                    items={[
                      {
                        label: 'Assigned',
                        state: getLodgingState(child, 'assigned'),
                      },
                      {
                        label: 'Active',
                        state: getLodgingState(child, 'active'),
                      },
                    ]}
                  />

                  <StatusSection
                    title="Sports"
                    icon={<Dumbbell className="h-5 w-5 text-amber-600 dark:text-amber-300" />}
                    items={[
                      {
                        label: 'Enrolled',
                        state: getSportsState(child, 'enrolled'),
                      },
                      {
                        label: 'Academy',
                        state: getSportsState(child, 'academy'),
                        value: child.sports.academy ?? 'Academy not assigned yet',
                      },
                    ]}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ label: string; state: 'completed' | 'in-progress' | 'pending'; value?: string }>;
}) {
  return (
    <section className="rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-950/70">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
          {icon}
        </div>
        <h5 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h5>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <StatusRow
            key={item.label}
            label={item.label}
            state={item.state}
            value={item.value}
          />
        ))}
      </div>
    </section>
  );
}

function StatusRow({
  label,
  state,
  value,
}: {
  label: string;
  state: 'completed' | 'in-progress' | 'pending';
  value?: string;
}) {
  const meta = getStatusMeta(state);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </p>
        {value ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {value}
          </p>
        ) : null}
      </div>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${meta.className}`}
      >
        <span>{meta.icon}</span>
        {meta.label}
      </span>
    </div>
  );
}
