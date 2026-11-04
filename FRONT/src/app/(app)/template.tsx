export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fade-up_350ms_var(--ease-ui)]">{children}</div>
  );
}
