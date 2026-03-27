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
      <div className={`relative w-[10rem] overflow-hidden ${imageClassName}`.trim()}>
        <div className="relative aspect-[4.2/1] w-full overflow-hidden">
          <Image
            src="/nextgenius-logo-exact.svg"
            alt="NextGenius"
            fill
            className="object-contain scale-[2.05] -translate-x-[11%] translate-y-[2%]"
          />
        </div>
      </div>
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
