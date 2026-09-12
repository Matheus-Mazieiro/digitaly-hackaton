const PATHS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  calendar:'<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  plusCalendar:'<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18M12 13v5M9.5 15.5h5"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
  file:'<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M15.5 14.2c2.3.4 4 2 4.8 4.6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  star:'<path d="M12 2.5l3 6.5 7 .8-5.2 4.9 1.4 7-6.2-3.6-6.2 3.6 1.4-7L2 9.8l7-.8Z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  arrowLeft:'<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8.5v7L16 12l6-3.5Z"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/>',
  micOff:'<path d="M3 3l18 18"/><path d="M9 5a3 3 0 0 1 6 0v6c0 .5-.1 1-.3 1.4M15 15a3 3 0 0 1-6 0v-1"/><path d="M5 11a7 7 0 0 0 10.5 6.1"/><path d="M19 11a7 7 0 0 1-1 3.6"/><path d="M12 18v4"/>',
  camOff:'<path d="M3 3l18 18"/><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 8.5v7L16 12"/>',
  screen:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  paperclip:'<path d="M21 12.5l-9 9a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8-8"/>',
  msg:'<path d="M4 4h16v12H8l-4 4Z"/>',
  phoneOff:'<path d="M3 3l18 18"/><path d="M10.7 6.3A16 16 0 0 1 15 6l1 4-2 1.3M5.3 9A16 16 0 0 0 4 15l4 1 1.3-2"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  shield:'<path d="M12 2.5l8 3v5.5c0 5-3.4 8.5-8 10.5-4.6-2-8-5.5-8-10.5V5.5Z"/><path d="M9 12l2 2 4-4"/>',
  chevronRight:'<path d="M9 6l6 6-6 6"/>',
  robot:'<rect x="4" y="8" width="16" height="11" rx="3"/><circle cx="9" cy="13.5" r="1.3"/><circle cx="15" cy="13.5" r="1.3"/><path d="M12 8V4M9 4h6"/>',
  sparkle:'<path d="M12 3l1.6 4.9L18 9.5l-4.4 1.6L12 16l-1.6-4.9L6 9.5l4.4-1.6Z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 8v.01"/>',
  alert:'<path d="M12 3 2 20h20Z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  activity:'<path d="M3 12h4l2.5-7L14 19l2.5-7H21"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
};

export function Icon({ name, size = 18, className, style, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: PATHS[name] || '' }}
      {...rest}
    />
  );
}