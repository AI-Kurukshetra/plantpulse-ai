'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { StateBadge } from '@/components/common/StateBadge';
import type { RolePermissionMatrix, RolePermissionProfile, UserRole } from '@/types';

interface RbacManagementDashboardProps {
  currentRole: UserRole;
  matrix: RolePermissionMatrix;
  initialProfiles: RolePermissionProfile[];
}

export function RbacManagementDashboard({ currentRole, matrix, initialProfiles }: RbacManagementDashboardProps) {
  const [profiles, setProfiles] = useState<RolePermissionProfile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfiles[0]?.id ?? '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appliesTo, setAppliesTo] = useState<UserRole>('technician');

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0];
  const canManage = currentRole === 'admin';

  const togglePermission = (module: string, action: string) => {
    if (!selectedProfile || !canManage) {
      return;
    }
    setProfiles((prev) =>
      prev.map((profile) => {
        if (profile.id !== selectedProfile.id) return profile;
        const currentActions = profile.permissions[module] ?? [];
        const nextActions = currentActions.includes(action)
          ? currentActions.filter((item) => item !== action)
          : [...currentActions, action];
        return {
          ...profile,
          permissions: {
            ...profile.permissions,
            [module]: nextActions
          }
        };
      })
    );
  };

  const createProfile = () => {
    if (!canManage || !name.trim()) {
      return;
    }

    const newProfile: RolePermissionProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom permission profile',
      appliesTo,
      createdAt: new Date().toISOString(),
      permissions: Object.fromEntries(matrix.modules.map((module) => [module, ['view']]))
    };

    // RBAC create/edit in UI is admin-gated; backend persistence can be plugged in when role APIs are ready.
    setProfiles((prev) => [newProfile, ...prev]);
    setSelectedProfileId(newProfile.id);
    setShowCreateModal(false);
    setName('');
    setDescription('');
    setAppliesTo('technician');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-lg font-medium text-white">Role-based Access Control</p>
            <p className="mt-1 text-sm text-mist/65">
              Granular role permissions for feature modules, actions, and data operations.
            </p>
          </div>
          <Button disabled={!canManage} onClick={() => setShowCreateModal(true)}>
            Create Role Profile
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-mist/70">
            Selected Profile
            <select
              value={selectedProfile?.id ?? ''}
              onChange={(event) => setSelectedProfileId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.appliesTo})
                </option>
              ))}
            </select>
          </label>
          <article className="rounded-2xl border border-white/10 bg-ink/60 p-4">
            <p className="text-sm font-medium text-white">Current Scope</p>
            <p className="mt-2 text-sm text-mist/75">{selectedProfile?.description}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-signal">
              <ShieldCheck className="h-3.5 w-3.5" />
              Applies to
            </p>
            {selectedProfile?.appliesTo ? <StateBadge value={selectedProfile.appliesTo} className="mt-3" /> : null}
          </article>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Permission Matrix</p>
          <p className="mt-1 text-sm text-mist/65">
            Toggle per-module actions for create/update/delete/approve visibility and capability.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Module</th>
                {matrix.actions.map((action) => (
                  <th key={action} className="pb-3 capitalize">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.modules.map((module) => (
                <tr key={module} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white capitalize">{module.replace('_', ' ')}</td>
                  {matrix.actions.map((action) => {
                    const checked = Boolean(selectedProfile?.permissions[module]?.includes(action));
                    return (
                      <td key={`${module}-${action}`} className="py-4">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canManage}
                            onChange={() => togglePermission(module, action)}
                            className="h-4 w-4"
                          />
                          <span className="text-xs text-mist/70">{checked ? 'Allowed' : 'Denied'}</span>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#050d15]/75 p-4 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0b1622] p-5 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create Role Profile</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                aria-label="Close role profile modal"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4">
              <label className="text-sm text-mist/70">
                Profile Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
                  placeholder="Night Shift Supervisor"
                />
              </label>
              <label className="text-sm text-mist/70">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
                  placeholder="Profile for shift-level monitoring and approvals."
                  rows={3}
                />
              </label>
              <label className="text-sm text-mist/70">
                Base Role
                <select
                  value={appliesTo}
                  onChange={(event) => setAppliesTo(event.target.value as UserRole)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="plant_manager">Plant Manager</option>
                  <option value="technician">Technician</option>
                </select>
              </label>
              <Button onClick={createProfile}>Create Profile</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
