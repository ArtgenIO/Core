export default function Icon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return <span className={'material-icons-outlined ' + className}>{id}</span>;
}
