import logoImg from '../../assets/logo.png'

interface LogoProps {
  white?: boolean
}

export function Logo({ white }: LogoProps = {}) {
  return (
    <img
      src={logoImg}
      alt="Family House"
      width={52}
      height={52}
      className={`h-12 w-12 md:h-13 md:w-13 object-contain ${white ? 'brightness-0 invert' : ''}`}
    />
  )
}
