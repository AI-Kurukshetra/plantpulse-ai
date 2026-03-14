'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import type { UserAccessRecord } from '@/types';
import { formatDateTime } from '@/utils/format';

interface UsersApiPayload {
  currentUserId?: string | null;
  items: UserAccessRecord[];
  page: number;
  pageSize: number;
  total: number;
}

const PAGE_SIZE = 8;

export function UsersManagementClient() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserAccessRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userPendingDelete, setUserPendingDelete] = useState<UserAccessRecord | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Debounce search input to avoid excessive API calls while typing.
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE)
        });
        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        }

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store'
        });
        const payload = (await response.json()) as UsersApiPayload & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load users.');
        }

        if (!active) {
          return;
        }

        setItems(payload.items);
        setCurrentUserId(payload.currentUserId ?? null);
        setTotal(payload.total);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Unable to load users.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, [debouncedSearch, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleCreated = () => {
    // Refresh list immediately after create so new users appear without manual page refresh.
    setShowCreateModal(false);
    setPage(1);
    setDebouncedSearch('');
    setSearch('');
    setReloadKey((prev) => prev + 1);
  };

  const handleDelete = async () => {
    if (!userPendingDelete) {
      return;
    }

    setDeletingId(userPendingDelete.id);
    setDeleteError(null);

    try {
      const params = new URLSearchParams({ userId: userPendingDelete.id });
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to delete user.');
      }

      setUserPendingDelete(null);
      setPage(1);
      setReloadKey((prev) => prev + 1);
    } catch (requestError) {
      setDeleteError(requestError instanceof Error ? requestError.message : 'Unable to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-medium text-white">Profiles & Roles</p>
            <p className="mt-1 text-sm text-mist/65">Admin directory with search and pagination controls.</p>
          </div>
          <Button className="inline-flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create user
          </Button>
        </div>

        {/* Search control is split from heading to prevent visual overlap with title text. */}
        <div className="mb-4">
          <label htmlFor="searchUsers" className="mb-2 block text-sm text-mist/70">
            Search users
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/45" />
            <input
              id="searchUsers"
              type="text"
              placeholder="Search by email or full name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 pl-10 text-white outline-none placeholder:text-mist/35"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Email</th>
                <th className="pb-3">Full name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Created</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-4 text-mist/70" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : null}
              {error ? (
                <tr>
                  <td className="py-4 text-danger" colSpan={5}>
                    {error}
                  </td>
                </tr>
              ) : null}
              {!loading && !error && !items.length ? (
                <tr>
                  <td className="py-4 text-mist/70" colSpan={5}>
                    No users found for the selected filter.
                  </td>
                </tr>
              ) : null}
              {!loading && !error
                ? items.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 text-mist/80 last:border-none">
                      <td className="py-4 text-white">{user.email}</td>
                      <td className="py-4">{user.fullName ?? 'Unspecified'}</td>
                      <td className="py-4 capitalize">{user.role.replace('_', ' ')}</td>
                      <td className="py-4">{formatDateTime(user.createdAt)}</td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          aria-label={`Delete ${user.email}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 bg-danger/10 text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={user.id === currentUserId}
                          onClick={() => {
                            setDeleteError(null);
                            setUserPendingDelete(user);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">
            Page {page} of {totalPages} • {total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              aria-label="Previous page"
              className="inline-flex items-center justify-center px-3"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              aria-label="Next page"
              className="inline-flex items-center justify-center px-3"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050d15]/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b1622] p-4 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create User</h2>
              {/* Standard modal close affordance: icon-only control with larger hit area and no boxed treatment. */}
              <button
                type="button"
                aria-label="Close create user modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Create form lives in a modal to keep user-list context visible and focused. */}
            <CreateUserForm embedded onCreated={handleCreated} />
          </div>
        </div>
      ) : null}

      {userPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050d15]/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0b1622] p-5 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Delete User</h2>
              <button
                type="button"
                aria-label="Close delete user modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                onClick={() => {
                  if (!deletingId) {
                    setDeleteError(null);
                    setUserPendingDelete(null);
                  }
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-7 text-mist/78">
              This will permanently remove <span className="font-medium text-white">{userPendingDelete.email}</span> from
              Supabase Auth and the app profile directory.
            </p>

            {deleteError ? (
              <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-mist/88">
                {deleteError}
              </p>
            ) : null}

            {/* Delete confirmation is modal-based to avoid accidental destructive clicks in the paginated table. */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={Boolean(deletingId)}
                onClick={() => {
                  setDeleteError(null);
                  setUserPendingDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={Boolean(deletingId)}
                className="bg-danger text-white hover:bg-[#eb4f5e]"
                onClick={() => void handleDelete()}
              >
                {deletingId ? 'Deleting...' : 'Delete user'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
