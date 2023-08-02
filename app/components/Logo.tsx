import logo from '~/../public/images/logo.png';

interface Props {
  className?: string;
}
export function Logo(props: Props) {
  const { className } = props;
  return (
    <img src={logo} alt="Touchstone Computer Systems" className={className} />
  );
}
