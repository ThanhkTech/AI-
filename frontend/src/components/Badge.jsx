import { ORDER_STATUSES, CONTAINER_STATUSES, DRIVER_STATUSES } from '../constants';

function Badge({ label, color, dot, small }) {
  return (
    <span className={`inline-flex items-center gap-1 ${small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} rounded-full font-semibold ${color}`}>
      <span className={`rounded-full ${small ? 'w-1 h-1' : 'w-1.5 h-1.5'} ${dot} flex-shrink-0`} />
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status, small }) {
  const s = ORDER_STATUSES[status] || ORDER_STATUSES[0];
  return <Badge label={s.label} color={s.color} dot={s.dot} small={small} />;
}

export function ContainerStatusBadge({ status, small }) {
  const s = CONTAINER_STATUSES[status] || CONTAINER_STATUSES[0];
  return <Badge label={s.label} color={s.color} dot={s.dot} small={small} />;
}

export function DriverStatusBadge({ status, small }) {
  const s = DRIVER_STATUSES[status] || DRIVER_STATUSES[0];
  return <Badge label={s.label} color={s.color} dot={s.dot} small={small} />;
}
