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
      <span
        className={`inline-flex items-center text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white ${imageClassName}`.trim()}
      >
        <span className="mr-2 text-amber-400">★</span>
        <span>NextGenius</span>
      </span>
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
