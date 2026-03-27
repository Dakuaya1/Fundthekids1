import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  href?: string;
};

export default function BrandLogo({
  className = '',
  imageClassName = '',
  href = '/',
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center ${className}`.trim()}>
      <Image
        src="/nextgenius-logo-exact.png"
        alt="NextGenius"
        width={1024}
        height={1024}
        className={`h-auto w-full ${imageClassName}`.trim()}
      />
    </div>
  );

  return href ? (
    <Link href={href} aria-label="NextGenius home">
      {content}
    </Link>
  ) : (
    content
  );
}
