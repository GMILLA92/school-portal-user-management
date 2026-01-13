import styles from './Select.module.scss';

import type { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

export function Select({ className, label, hint, id, ...props }: Props) {
  const selectId = id ?? props.name;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}

      <select id={selectId} className={styles.select} {...props} />

      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
}
