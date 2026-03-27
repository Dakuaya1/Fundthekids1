import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  href?: string;
};

export default function BrandLogo({
  className = '',
  imageClassName = '',
  priority = false,
  href = '/',
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center ${className}`.trim()}>
      <Image
        src="/nextgenius-logo.svg"
        alt="NextGenius"
        width={840}
        height={220}
        priority={priority}
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
