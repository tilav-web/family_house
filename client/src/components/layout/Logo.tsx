import logoImg from '../../assets/logo.png'

interface LogoProps {
  white?: boolean
}

export function Logo({ white }: LogoProps = {}) {
  return (
    <img
      src={logoImg}
      alt="Family House"
      width={40}
      height={40}
      className={`h-10 w-10 object-contain ${white ? 'brightness-0 invert' : ''}`}
    />
  )
}
