import styles from './Button.module.scss';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'soft' | 'ghostDanger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = ({ variant = 'secondary', className, ...props }: Props) => {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return <button type="button" className={cls} {...props} />;
};
