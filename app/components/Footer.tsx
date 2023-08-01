import { CenteredView } from './CenteredView';

export function Footer() {
  return (
    <div className="flex flex-col items-stretch">
      <CenteredView className="p-4">
        <div className="flex flex-col items-center justify-center gap-1 lg:flex-row lg:justify-end lg:gap-4">
          <a
            className="text-base font-light text-zinc-600/80 transition-all duration-150 hover:underline"
            href="https://allansimoyi.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developed By Allan Simoyi
          </a>
        </div>
      </CenteredView>
    </div>
  );
}
