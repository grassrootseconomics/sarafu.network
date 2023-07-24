type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  // If you don't use the prefix and have more than one instance on the same page it causes collisions on the gradient id letting loose the bugs. 😱
  logo: ({ prefix, ...props }: IconProps & { prefix: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 36 67"
      {...props}
    >
      <path
        d="m28.5 30.5-1.3-1.8-1.8-2.4c-.1-.2 0-.3.1-.5.9-.7 1.7-1.6 2.3-2.6l1-2c.4-.8.6-1.6.7-2.4v-2.6c0-1.2-.3-2.4-.8-3.5a11.6 11.6 0 0 0-5.9-6 12.5 12.5 0 0 0-11.4.4A11.6 11.6 0 0 0 7.8 24c.9 1.2 2 2 3.3 2.8 1.3.6 2.6 1 4 1.2h.2l.2-.1.2-1 .2-3.2a4 4 0 0 0-1.4-3.2 4 4 0 0 0-2.2-1c-.6-.2-1.2-.5-1.7-.9A3 3 0 0 1 10 16c.3-1 .8-1.6 1.7-2a2 2 0 0 1 1.5-.1l2.6.8a8.4 8.4 0 0 1 5 6.1c.4 1.4.4 2.7.3 4l-.2 3-.1 2.3-.2 2.2-.1 1c0 .2 0 .3.2.3 2 .3 3.9.7 5.6 1.6A15.6 15.6 0 0 1 35 46.5c.4 1.7.3 3.4.3 5.2l-.3 1.6-.2 1a16.7 16.7 0 0 1-9.5 11.1l-2.1.9c-1.1.3-2.2.6-3.3.7h-3.3c-1 0-2-.2-3-.5A17.4 17.4 0 0 1 .5 48.7l.3-2.6c.3-1 .7-2.2 1.2-3.2a16 16 0 0 1 3-4.4l1.8-1.7h.3l1.2 1.6L10 41v.3A11.7 11.7 0 0 0 6.6 46c-.3.9-.6 1.8-.6 2.8 0 1-.1 2.2.1 3.2a11.6 11.6 0 0 0 5.1 7.5 12.7 12.7 0 0 0 11.9 1 11.7 11.7 0 0 0 5.4-5l1-2.5a13.4 13.4 0 0 0-.3-7.2 9.7 9.7 0 0 0-6-6 16 16 0 0 0-2.9-.7c-.2 0-.3 0-.3.2l-.1 1-.2 3.1c0 1 .2 1.8.7 2.6.5.6 1.1 1.1 1.9 1.4l1.8.5c1 .3 1.6 1 1.9 2 .2.8.1 1.6-.4 2.3-.8 1-1.9 1.4-3.1 1-.8-.1-1.7-.4-2.5-.7a8.5 8.5 0 0 1-5-5.8c-.3-.9-.3-1.7-.4-2.6v-1.4l.2-3.2.1-1.5.2-2 .1-2.1c0-.3 0-.4-.3-.4a16.7 16.7 0 0 1-11-5.7 14 14 0 0 1-2-3.3A17.9 17.9 0 0 1 4.2 6.1 17.3 17.3 0 0 1 18.8 0a17.5 17.5 0 0 1 16.4 18.6c0 .8-.1 1.6-.3 2.3l-1 3a18.3 18.3 0 0 1-5.2 6.6h-.2Z"
        fill={`url(#${prefix}_grad)`}
      />
      <defs>
        <linearGradient
          id={`${prefix}_grad`}
          x1="17.5"
          x2="18"
          y1="67.9"
          y2="-1"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".2" stopColor="#0BB79E" />
          <stop offset=".3" stopColor="#0B949C" />
          <stop offset=".8" stopColor="#0E2A96" />
          <stop offset="1" stopColor="#0F0094" />
        </linearGradient>
      </defs>
    </svg>
  ),
  hash: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      strokeWidth="2"
      className="h-4 w-4 text-muted-foreground"
      {...props}
    >
      <path d="M20 14h-4.3l.73-4H20a1 1 0 0 0 0-2h-3.21l.69-3.81A1 1 0 0 0 16.64 3a1 1 0 0 0-1.22.82L14.67 8h-3.88l.69-3.81A1 1 0 0 0 10.64 3a1 1 0 0 0-1.22.82L8.67 8H4a1 1 0 0 0 0 2h4.3l-.73 4H4a1 1 0 0 0 0 2h3.21l-.69 3.81A1 1 0 0 0 7.36 21a1 1 0 0 0 1.22-.82L9.33 16h3.88l-.69 3.81a1 1 0 0 0 .84 1.19 1 1 0 0 0 1.22-.82l.75-4.18H20a1 1 0 0 0 0-2zM9.7 14l.73-4h3.87l-.73 4z" />
    </svg>
  ),
  dollar: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="h-4 w-4 text-muted-foreground"
      {...props}
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  person: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="h-4 w-4 text-muted-foreground"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};
