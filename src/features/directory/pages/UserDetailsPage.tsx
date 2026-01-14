import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Users, Activity, CalendarPlus, Clock, Briefcase, MapPin, Phone } from 'lucide-react';

import { useUsersQuery } from '../api/useUsersQuery';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../../auth/AuthContext';

import styles from './UserDetailsPage.module.scss';
import { UserField } from './UserField';

import type { UserDTO } from '../../users/model';

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

  const { user: authedUser } = useAuth();
  const isAdmin = authedUser?.role === 'Admin';

  const { data, isLoading, isError, error } = useUsersQuery();

  const currentUser = React.useMemo<UserDTO | null>(() => {
    if (!id) return null;
    return (data ?? []).find((u) => u.id === id) ?? null;
  }, [data, id]);

  if (!id) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>User</h1>
          <div className={styles.muted}>Missing user id.</div>
          <div className={styles.actions}>
            <Button
              variant="soft"
              onClick={() => {
                void navigate('/directory');
              }}
            >
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
            <Button
              variant="soft"
              onClick={() => {
                void navigate('/directory');
              }}
            >
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
            <Button
              variant="soft"
              onClick={() => {
                void navigate('/directory');
              }}
            >
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
          <Button
            variant="soft"
            onClick={() => {
              void navigate('/directory');
            }}
          >
            Back
          </Button>

          {isAdmin ? (
            <Button
              variant="soft"
              onClick={() => {
                void navigate(`/directory/${currentUser.id}?mode=edit`);
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          <UserField icon={<Mail size={16} />} label="Email" value={currentUser.email} />
          <UserField
            icon={<Users size={16} />}
            label="Roles"
            value={currentUser.roles.join(', ')}
          />
          <UserField
            icon={<Activity size={16} />}
            label="Status"
            value={
              <span className={`${styles.statusPill} ${statusCls}`}>{currentUser.status}</span>
            }
          />
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
