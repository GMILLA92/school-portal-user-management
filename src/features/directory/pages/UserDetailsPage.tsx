import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, Users, Activity, CalendarPlus, Clock, Briefcase, MapPin, Phone } from 'lucide-react';

import { useUsersQuery } from '../api/useUsersQuery';
import { useUpdateUserMutation } from '../api/useUpdateUserMutation';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select/Select';
import { useAuth } from '../../auth/AuthContext';

import styles from './UserDetailsPage.module.scss';
import { UserField } from './UserField';

import type { UpdateUserPayload, UserDTO, UserRole, UserStatus } from '../../users/model';

const ROLE_OPTIONS: UserRole[] = ['Student', 'Teacher', 'Guardian', 'Staff', 'Admin'];
const STATUS_OPTIONS: UserStatus[] = ['Active', 'Invited', 'Suspended', 'Archived'];

function fullName(u: UserDTO): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function statusClassName(status: UserDTO['status'], stylesObj: typeof styles): string {
  switch (status) {
    case 'Active':
      return stylesObj.statusActive;
    case 'Invited':
      return stylesObj.statusInvited;
    case 'Suspended':
      return stylesObj.statusSuspended;
    case 'Archived':
      return stylesObj.statusArchived;
    default:
      return stylesObj.statusArchived;
  }
}

export function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const { user: authedUser } = useAuth();
  const isAdmin = authedUser?.role === 'Admin';

  const mode = searchParams.get('mode');
  const isEditMode = isAdmin && mode === 'edit';

  const { data, isLoading, isError, error } = useUsersQuery();
  const updateUser = useUpdateUserMutation();

  const currentUser = React.useMemo<UserDTO | null>(() => {
    if (!id) return null;
    return (data ?? []).find((u) => u.id === id) ?? null;
  }, [data, id]);

  // Form state (only used in edit mode)
  const [draftStatus, setDraftStatus] = React.useState<UserStatus>('Active');
  const [draftRole, setDraftRole] = React.useState<UserRole>('Staff');

  // When we enter edit mode or user changes, initialize drafts
  React.useEffect(() => {
    if (!currentUser) return;

    setDraftStatus(currentUser.status);
    setDraftRole(currentUser.roles[0] ?? 'Staff');
  }, [currentUser, isEditMode]);

  const handleBack = () => {
    void navigate('/directory');
  };

  const handleEnterEdit = () => {
    if (!currentUser) return;
    void navigate(`/directory/${currentUser.id}?mode=edit`);
  };

  const handleCancelEdit = () => {
    if (!currentUser) return;
    void navigate(`/directory/${currentUser.id}`);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    const nextRoles: UserRole[] =
      draftRole === 'Admin' ? (['Admin', 'Staff'] satisfies UserRole[]) : [draftRole];

    const payload: UpdateUserPayload = {
      status: draftStatus,
      roles: nextRoles,
    };

    try {
      await updateUser.mutateAsync({ id: currentUser.id, payload });
      void navigate(`/directory/${currentUser.id}`);
    } catch {
      // error is shown below via updateUser.error
    }
  };

  if (!id) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>User</h1>
          <div className={styles.muted}>Missing user id.</div>
          <div className={styles.actions}>
            <Button variant="soft" onClick={handleBack}>
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>User</h1>
          <div className={styles.muted}>Loading…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>User</h1>
          <div className={styles.error}>{error.message}</div>
          <div className={styles.actions}>
            <Button variant="soft" onClick={handleBack}>
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>User not found</h1>
          <div className={styles.muted}>No user with id “{id}”.</div>
          <div className={styles.actions}>
            <Button variant="soft" onClick={handleBack}>
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const name = fullName(currentUser);
  const statusCls = statusClassName(currentUser.status, styles);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{name}</h1>
          {currentUser.pronouns && currentUser.pronouns !== 'prefer not to say' ? (
            <div className={styles.subtle}>{currentUser.pronouns}</div>
          ) : (
            <div className={styles.subtle}> </div>
          )}
        </div>

        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>

          {!isEditMode && isAdmin ? (
            <Button variant="secondary" onClick={handleEnterEdit}>
              Edit
            </Button>
          ) : null}

          {isEditMode ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={updateUser.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSave()}
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        {updateUser.isError ? (
          <div role="alert" className={styles.error}>
            {updateUser.error.message}
          </div>
        ) : null}

        <div className={styles.grid}>
          <UserField icon={<Mail size={16} />} label="Email" value={currentUser.email} />

          {isEditMode ? (
            <UserField
              icon={<Users size={16} />}
              label="Role"
              value={
                <Select
                  className={styles.compactSelect}
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value as UserRole)}
                  aria-label="Role"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              }
            />
          ) : (
            <UserField
              icon={<Users size={16} />}
              label="Roles"
              value={currentUser.roles.join(', ')}
            />
          )}

          {isEditMode ? (
            <UserField
              icon={<Activity size={16} />}
              label="Status"
              value={
                <Select
                  className={styles.compactSelect}
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as UserStatus)}
                  aria-label="Status"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              }
            />
          ) : (
            <UserField
              icon={<Activity size={16} />}
              label="Status"
              value={
                <span className={`${styles.statusPill} ${statusCls}`}>{currentUser.status}</span>
              }
            />
          )}

          <UserField
            icon={<CalendarPlus size={16} />}
            label="Registered"
            value={formatDate(currentUser.registeredAt)}
          />

          <UserField
            icon={<Clock size={16} />}
            label="Last login"
            value={currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt) : '—'}
          />

          {currentUser.department ? (
            <UserField
              icon={<Briefcase size={16} />}
              label="Department"
              value={currentUser.department}
            />
          ) : null}

          {currentUser.campus ? (
            <UserField icon={<MapPin size={16} />} label="Campus" value={currentUser.campus} />
          ) : null}

          {currentUser.phone ? (
            <UserField icon={<Phone size={16} />} label="Phone" value={currentUser.phone} />
          ) : null}

          {currentUser.notes ? (
            <UserField icon={<Activity size={16} />} label="Notes" value={currentUser.notes} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
