const shapes={
 shirt:'<path d="m8 4-5 4 3 4 2-2v10h8V10l2 2 3-4-5-4c-1 3-7 3-8 0Z"/>',
 cone:'<path d="M9 3h6l4 16H5L9 3Z"/><path d="M7 11h10M6 15h12M3 21h18"/>',
 transfer:'<path d="M3 7h17l-4-4M21 17H4l4 4M20 7l-4 4M4 17l4-4"/>',
 scout:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M8 10h4M10 8v4"/>',
 pack:'<path d="m5 3 14 0 2 18H3L5 3Z"/><path d="m12 7 1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 10.5l3.5-.5Z"/>',
 whistle:'<path d="M3 12a6 6 0 1 0 12 0h6V6H9v5H3Z"/><circle cx="9" cy="16" r="2"/><path d="M5 3 3 1M15 3l2-2"/>',
 trophy:'<path d="M7 3h10v5c0 8-10 8-10 0V3ZM12 14v6M7 21h10M7 5H3v3c0 3 4 4 5 3M17 5h4v3c0 3-4 4-5 3"/>',
 world:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
 shield:'<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
 fire:'<path d="M13 2c1 6 7 7 7 13a8 8 0 0 1-16 0c0-4 3-7 5-8 0 4 2 5 2 5s4-5 2-10Z"/>',
 heart:'<path d="M12 21 3 12C-2 4 8 0 12 7 16 0 26 4 21 12Z"/>',
 calm:'<circle cx="12" cy="12" r="9"/><path d="M6 10h4M14 10h4M8 15c2 3 6 3 8 0"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 book:'<path d="M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-1-1-6-2-10 1ZM12 5v16"/>'
};
export function footballIcon(name){return `<svg class="football-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]||shapes.shield}</svg>`;}
