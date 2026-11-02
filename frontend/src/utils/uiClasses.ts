export const fieldLabelClass = 'text-[0.75rem] font-bold uppercase tracking-[0.08em] text-muted';

export const fieldInputClass = [
    'w-full rounded border border-ink/10 bg-white/55 px-[0.95rem] py-[0.85rem] text-ink outline-none',
    'transition-[border-color,box-shadow] duration-200',
    'focus:border-brass focus:shadow-[0_0_0_3px_rgba(184,146,74,0.18)]',
].join(' ');

export const sectionTitleClass = 'mb-4 font-display text-[1.8rem] tracking-[0.06em]';

export const choiceClass = [
    'rounded border border-ink/10 bg-white/40 p-4 text-left transition duration-200',
    'hover:-translate-y-0.5 hover:border-brass/55',
].join(' ');

export const choiceActiveClass = 'border-ink bg-ink text-paper hover:border-ink hover:bg-ink';

export const btnClass = [
    'rounded border border-ink bg-ink px-[1.35rem] py-[0.9rem] text-[0.8rem] font-bold uppercase',
    'tracking-[0.08em] text-paper transition duration-200',
    'hover:-translate-y-px hover:border-brass hover:bg-brass hover:text-ink',
    'disabled:cursor-not-allowed disabled:opacity-45',
].join(' ');

export const btnGhostClass = [
    'rounded border border-ink bg-transparent px-[1.35rem] py-[0.9rem] text-[0.8rem] font-bold uppercase',
    'tracking-[0.08em] text-ink transition duration-200',
    'hover:-translate-y-px hover:border-brass hover:bg-brass hover:text-ink',
].join(' ');

export const btnDangerClass = [
    'rounded border border-danger bg-transparent px-[1.35rem] py-[0.9rem] text-[0.8rem] font-bold uppercase',
    'tracking-[0.08em] text-danger transition duration-200',
    'hover:bg-danger hover:text-white',
].join(' ');

export const slotClass = [
    'min-w-[4.5rem] rounded border border-ink/10 bg-white/45 px-3 py-[0.65rem] font-semibold',
    'transition duration-200 hover:border-brass hover:bg-brass hover:text-ink',
].join(' ');

export const slotActiveClass = 'border-brass bg-brass text-ink';

export const messageClass = 'mt-4 animate-rise border-l-[3px] border-brass bg-brass/12 px-4 py-[0.9rem]';

export const messageErrorClass = 'border-danger bg-danger/10 text-danger';

export const messageOkClass = 'border-ok bg-ok/10 text-ok';

export const navLinkClass = [
    'border border-transparent px-4 py-[0.65rem] text-[0.78rem] font-semibold uppercase tracking-[0.04em]',
    'transition duration-200 hover:border-ink hover:bg-ink hover:text-paper',
].join(' ');

export const navLinkActiveClass = 'border-ink bg-ink text-paper';
