export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 md:min-h-0 animate-[fade-up_350ms_var(--ease-ui)] flex-col">{children}</div>
  );
}
