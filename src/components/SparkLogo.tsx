import type { SVGProps } from "react";

export default function SparkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 2.5c.4 4.8 2.1 8.1 5.2 10.3C18.4 14 16.8 16.6 16 21.5c-.8-4.9-2.4-7.5-5.2-8.7C13.9 10.6 15.6 7.3 16 2.5Z"
        fill="currentColor"
      />
      <path
        d="M7.2 12.8c2.7 1.5 4.3 3.8 4.8 7-2.9-.7-5.2-2.4-6.8-5.1 1 1 2 1.6 3.2 1.9-1.6-1-2.8-2.1-3.6-3.8h2.4Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M24.8 12.8c-2.7 1.5-4.3 3.8-4.8 7 2.9-.7 5.2-2.4 6.8-5.1-1 1-2 1.6-3.2 1.9 1.6-1 2.8-2.1 3.6-3.8h-2.4Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16 21.2c.55 3.4 1.9 5.5 4.1 6.8-2.1.4-3.6 1.4-4.1 3.5-.55-2.1-2-3.1-4.1-3.5 2.2-1.3 3.55-3.4 4.1-6.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
