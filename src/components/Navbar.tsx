import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useNeumaLab } from '../context/NeumaLabContext.tsx';
import { type ViewId } from '../data/navigationPillars.ts';

interface NavChildItem {
  view: ViewId;
  href: string;
  label: string;
  description: string;
}

const TOOLS_ITEMS: NavChildItem[] = [
  {
    view: 'latin-studio',
    href: '#filologia',
    label: 'Procesador de Latín Litúrgico',
    description: 'Silabeo, acentos tónicos, ritmo espondaico/dactílico y Pronuntiatio Romana',
  },
  {
    view: 'organ-studio',
    href: '#organo',
    label: 'Armonización Modal al Órgano',
    description: '3 escuelas modales, partitura combinada y auditoría diatónica',
  },
];

const ACADEMY_ITEMS: NavChildItem[] = [
  {
    view: 'pilar-1',
    href: '#academia/octoechos',
    label: 'Octoechos y Salmodia',
    description: 'Tetragrama, hexacordos y los 8 tonos salmódicos',
  },
  {
    view: 'pilar-2',
    href: '#academia/semiologia',
    label: 'Semiología y Paleografía',
    description: 'Escuela de Cardine, St. Gallen y Laon 239',
  },
  {
    view: 'pilar-3',
    href: '#academia/organo',
    label: 'Tratado de Órgano Modal',
    description: 'Potiron, Desrocquettes, cadencias e improvisación',
  },
  {
    view: 'pilar-4',
    href: '#academia/schola',
    label: 'Schola y Quironimia',
    description: 'Dirección gestual Arsis/Thesis y técnica vocal',
  },
  {
    view: 'pilar-5',
    href: '#academia/magisterio',
    label: 'Análisis y Magisterio',
    description: 'Fichas litúrgicas y documentos pontificios',
  },
  {
    view: 'pilar-6',
    href: '#academia/gabc',
    label: 'Tipografía GABC y TeX',
    description: 'GregorioTeX, LuaLaTeX, Dorico y GregoBase',
  },
  {
    view: 'pilar-7',
    href: '#academia/investigacion',
    label: 'AISCGre y Fonoteca',
    description: 'Centros académicos, bibliografía y grabaciones',
  },
];

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    resolvedColorScheme,
    toggleColorScheme,
  } = useNeumaLab();

  const headerRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  const [isWide, setIsWide] = useState<boolean>(true);
  const isWideRef = useRef<boolean>(true);
  const lastCollapsedWidthRef = useRef<number>(0);

  const [narrowToolsOpen, setNarrowToolsOpen] = useState<boolean>(false);
  const [narrowAcademyOpen, setNarrowAcademyOpen] = useState<boolean>(false);

  const toolsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const toolsListRef = useRef<HTMLUListElement | null>(null);
  const toolsHoverPreviewRef = useRef<boolean>(false);

  const academyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const academyListRef = useRef<HTMLUListElement | null>(null);
  const academyHoverPreviewRef = useRef<boolean>(false);

  const isToolsActive = activeView === 'latin-studio' || activeView === 'organ-studio';
  const isAcademyActive = activeView.startsWith('pilar-');

  const syncSubmenuState = (
    wide: boolean,
    submenu: HTMLUListElement | null,
    trigger: HTMLButtonElement | null,
    narrowOpen: boolean
  ) => {
    if (!submenu || !trigger) return;
    if (wide) {
      submenu.setAttribute('popover', 'auto');
      submenu.hidden = false;
      const isOpen =
        submenu.matches(':popover-open') || submenu.classList.contains(':popover-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    } else {
      submenu.removeAttribute('popover');
      submenu.hidden = !narrowOpen;
      trigger.setAttribute('aria-expanded', narrowOpen ? 'true' : 'false');
    }
  };

  const measureLayout = () => {
    const header = headerRef.current;
    const inner = innerRef.current;
    const menu = menuRef.current;
    if (!header || !inner || !menu) return;

    const currentWidth = header.clientWidth;
    // When collapsed, only re-measure when the header grows to prevent thrashing
    if (!isWideRef.current && currentWidth <= lastCollapsedWidthRef.current) {
      return;
    }

    const wasMenuOpen =
      !isWideRef.current &&
      (menu.matches(':popover-open') || menu.classList.contains(':popover-open'));

    header.classList.add('is-measuring');
    header.classList.add('is-wide');
    menu.removeAttribute('popover');

    const fits = inner.scrollWidth <= inner.clientWidth + 1;
    isWideRef.current = fits;
    setIsWide(fits);

    if (fits) {
      header.classList.add('is-wide');
      menu.removeAttribute('popover');
    } else {
      lastCollapsedWidthRef.current = currentWidth;
      header.classList.remove('is-wide');
      menu.setAttribute('popover', 'auto');
      if (wasMenuOpen) {
        try {
          (menu as HTMLElement & { showPopover?: () => void }).showPopover?.();
        } catch (_) {}
      }
    }

    syncSubmenuState(fits, toolsListRef.current, toolsTriggerRef.current, narrowToolsOpen);
    syncSubmenuState(
      fits,
      academyListRef.current,
      academyTriggerRef.current,
      narrowAcademyOpen
    );

    requestAnimationFrame(() => {
      header.classList.remove('is-measuring');
    });
  };

  useLayoutEffect(() => {
    measureLayout();
    const header = headerRef.current;
    const menu = menuRef.current;
    if (!header || !menu || typeof ResizeObserver === 'undefined') return;

    const obs = new ResizeObserver(() => measureLayout());
    obs.observe(header);
    obs.observe(menu);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    syncSubmenuState(isWide, toolsListRef.current, toolsTriggerRef.current, narrowToolsOpen);
    syncSubmenuState(
      isWide,
      academyListRef.current,
      academyTriggerRef.current,
      narrowAcademyOpen
    );
  }, [isWide, narrowToolsOpen, narrowAcademyOpen]);

  // Sync aria-expanded & fallback positioning for wide popovers
  useEffect(() => {
    const wireToggle = (
      submenu: HTMLUListElement | null,
      trigger: HTMLButtonElement | null,
      hoverRef: React.MutableRefObject<boolean>
    ) => {
      if (!submenu || !trigger) return () => {};
      const onToggle = (ev: Event) => {
        const newState = (ev as Event & { newState?: string }).newState;
        const isOpen = newState === 'open';
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (!isOpen) hoverRef.current = false;

        if (isOpen && isWideRef.current && !CSS.supports('position-area', 'block-end')) {
          const tRect = trigger.getBoundingClientRect();
          const mRect = submenu.getBoundingClientRect();
          const top =
            tRect.bottom + 8 + mRect.height <= window.innerHeight
              ? tRect.bottom + 8
              : Math.max(8, tRect.top - mRect.height - 8);
          const left = Math.max(8, Math.min(tRect.left, window.innerWidth - mRect.width - 8));
          submenu.style.top = `${top}px`;
          submenu.style.left = `${left}px`;
        }
      };
      submenu.addEventListener('toggle', onToggle);
      return () => submenu.removeEventListener('toggle', onToggle);
    };

    const cleanup1 = wireToggle(
      toolsListRef.current,
      toolsTriggerRef.current,
      toolsHoverPreviewRef
    );
    const cleanup2 = wireToggle(
      academyListRef.current,
      academyTriggerRef.current,
      academyHoverPreviewRef
    );
    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const navigate = (view: ViewId, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveView(view);

    // Cerrar menús/popovers abiertos tras navegar
    try {
      const m = menuRef.current as (HTMLElement & { hidePopover?: () => void }) | null;
      if (!isWideRef.current && m?.matches(':popover-open')) m.hidePopover?.();
      const t = toolsListRef.current as (HTMLElement & { hidePopover?: () => void }) | null;
      if (t?.matches(':popover-open')) t.hidePopover?.();
      const a = academyListRef.current as (HTMLElement & { hidePopover?: () => void }) | null;
      if (a?.matches(':popover-open')) a.hidePopover?.();
    } catch (_) {}
  };

  const handleDropdownLiPointerEnter = (
    submenu: HTMLUListElement | null,
    trigger: HTMLButtonElement | null,
    hoverRef: React.MutableRefObject<boolean>,
    e: React.PointerEvent
  ) => {
    if (!isWide || !submenu || !trigger) return;
    if (e.pointerType === 'touch') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (submenu.matches(':popover-open')) return;
    try {
      hoverRef.current = true;
      (
        submenu as HTMLElement & { showPopover?: (opts?: { source?: HTMLElement }) => void }
      ).showPopover?.({ source: trigger });
    } catch (_) {}
  };

  const handleDropdownLiPointerLeave = (
    submenu: HTMLUListElement | null,
    hoverRef: React.MutableRefObject<boolean>
  ) => {
    if (!isWide || !submenu) return;
    if (hoverRef.current) {
      hoverRef.current = false;
      try {
        (submenu as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
      } catch (_) {}
    }
  };

  const handleDropdownFocusOut = (
    submenu: HTMLUListElement | null,
    e: React.FocusEvent<HTMLLIElement>
  ) => {
    if (!isWide || !submenu) return;
    const related = e.relatedTarget as Node | null;
    if (related && !e.currentTarget.contains(related)) {
      try {
        (submenu as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
      } catch (_) {}
    }
  };

  const handleTriggerClick = (
    submenu: HTMLUListElement | null,
    hoverRef: React.MutableRefObject<boolean>,
    setNarrowOpen: React.Dispatch<React.SetStateAction<boolean>>,
    e: React.MouseEvent
  ) => {
    if (isWide) {
      if (hoverRef.current && submenu?.matches(':popover-open')) {
        // Pin open instead of toggling closed
        hoverRef.current = false;
        e.preventDefault();
      }
    } else {
      e.preventDefault();
      setNarrowOpen((prev) => !prev);
    }
  };

  const isDark = resolvedColorScheme === 'dark';

  return (
    <header ref={headerRef} className="site-header is-wide no-print">
      <div ref={innerRef} className="site-header-inner">
        {/* Emblema / Marca institucional */}
        <a
          href="#inicio"
          onClick={(e) => navigate('home', e)}
          className="flex items-center gap-2.5 no-underline py-1.5 rounded-md"
          style={{ color: 'var(--nm-text-main)' }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border-strong)',
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 36 36"
              className="h-6 w-6"
              fill="none"
            >
              <line x1="3" y1="9" x2="33" y2="9" stroke="var(--nm-crimson)" strokeWidth="1.3" />
              <line x1="3" y1="15" x2="33" y2="15" stroke="var(--nm-crimson)" strokeWidth="1.3" />
              <line x1="3" y1="21" x2="33" y2="21" stroke="var(--nm-crimson)" strokeWidth="1.3" />
              <line x1="3" y1="27" x2="33" y2="27" stroke="var(--nm-crimson)" strokeWidth="1.3" />
              <rect x="6" y="11.5" width="3.5" height="4" fill="var(--nm-text-main)" />
              <rect x="6" y="17.5" width="3.5" height="4" fill="var(--nm-text-main)" />
              <line x1="6" y1="11.5" x2="6" y2="23" stroke="var(--nm-text-main)" strokeWidth="1.4" />
              <rect x="16" y="19" width="5" height="4.2" rx="0.5" fill="var(--nm-text-main)" />
              <rect x="16" y="12.5" width="5" height="4.2" rx="0.5" fill="var(--nm-text-main)" />
              <line x1="20.4" y1="13" x2="20.4" y2="23" stroke="var(--nm-text-main)" strokeWidth="1.4" />
              <rect x="25.5" y="15.5" width="5" height="4.2" rx="0.5" fill="var(--nm-crimson)" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span
              className="font-display text-base font-bold tracking-wider"
              style={{ color: 'var(--nm-text-main)' }}
            >
              NEUMALAB
            </span>
            <span
              className="font-editorial text-[11px] italic"
              style={{ color: 'var(--nm-text-muted)' }}
            >
              Cantus · Schola · Organum
            </span>
          </span>
        </a>

        {/* Árbol único de navegación (<nav>) para escritorio y móvil */}
        <nav className="site-nav flex items-center gap-2" aria-label="Principal">
          <button
            className="menu-button"
            type="button"
            popoverTarget="site-menu"
            popoverTargetAction="toggle"
            aria-controls="site-menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span>Menú</span>
          </button>

          <ul
            ref={menuRef}
            id="site-menu"
            className="site-menu"
            {...(!isWide ? { popover: 'auto' } : {})}
          >
            {!isWide && (
              <li className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: 'var(--nm-border)' }}>
                <span className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--nm-crimson-bright)' }}>
                  Navegación
                </span>
                <button
                  type="button"
                  popoverTarget="site-menu"
                  popoverTargetAction="hide"
                  aria-label="Cerrar menú"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                  style={{ borderColor: 'var(--nm-border)', color: 'var(--nm-text-main)' }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            )}

            <li>
              <a
                href="#inicio"
                className="nav-link-btn"
                aria-current={activeView === 'home' ? 'page' : undefined}
                onClick={(e) => navigate('home', e)}
              >
                Inicio
              </a>
            </li>

            <li>
              <a
                href="#editor"
                className="nav-link-btn"
                aria-current={activeView === 'editor' ? 'page' : undefined}
                onClick={(e) => navigate('editor', e)}
              >
                Editor Gregoriano
              </a>
            </li>

            <li>
              <a
                href="#repertorio"
                className="nav-link-btn"
                aria-current={activeView === 'repertoire' ? 'page' : undefined}
                onClick={(e) => navigate('repertoire', e)}
              >
                Repertorio
              </a>
            </li>

            {/* Submenú: Herramientas Especializadas */}
            <li
              className="nav-dropdown"
              onPointerEnter={(e) =>
                handleDropdownLiPointerEnter(
                  toolsListRef.current,
                  toolsTriggerRef.current,
                  toolsHoverPreviewRef,
                  e
                )
              }
              onPointerLeave={() =>
                handleDropdownLiPointerLeave(toolsListRef.current, toolsHoverPreviewRef)
              }
              onBlur={(e) => handleDropdownFocusOut(toolsListRef.current, e)}
            >
              <button
                ref={toolsTriggerRef}
                className="dropdown-trigger"
                type="button"
                aria-expanded="false"
                aria-controls="tools-submenu"
                popoverTarget={isWide ? 'tools-submenu' : undefined}
                style={
                  isToolsActive
                    ? { color: 'var(--nm-crimson-bright)', fontWeight: 700 }
                    : undefined
                }
                onClick={(e) =>
                  handleTriggerClick(
                    toolsListRef.current,
                    toolsHoverPreviewRef,
                    setNarrowToolsOpen,
                    e
                  )
                }
              >
                <span>Herramientas</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
              </button>

              <ul
                ref={toolsListRef}
                id="tools-submenu"
                className="dropdown-list"
              >
                {TOOLS_ITEMS.map((item) => (
                  <li key={item.view}>
                    <a
                      href={item.href}
                      aria-current={activeView === item.view ? 'page' : undefined}
                      onClick={(e) => navigate(item.view, e)}
                      className="block rounded-lg px-3 py-2 no-underline transition-colors hover:bg-[var(--nm-bg-elevated)]"
                      style={{ color: 'var(--nm-text-main)' }}
                    >
                      <span
                        className="block text-xs font-bold"
                        style={{
                          color:
                            activeView === item.view
                              ? 'var(--nm-crimson-bright)'
                              : 'var(--nm-text-main)',
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="block text-[11px] whitespace-normal leading-snug mt-0.5"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        {item.description}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            {/* Submenú: Academia y Formación */}
            <li
              className="nav-dropdown"
              onPointerEnter={(e) =>
                handleDropdownLiPointerEnter(
                  academyListRef.current,
                  academyTriggerRef.current,
                  academyHoverPreviewRef,
                  e
                )
              }
              onPointerLeave={() =>
                handleDropdownLiPointerLeave(
                  academyListRef.current,
                  academyHoverPreviewRef
                )
              }
              onBlur={(e) => handleDropdownFocusOut(academyListRef.current, e)}
            >
              <button
                ref={academyTriggerRef}
                className="dropdown-trigger"
                type="button"
                aria-expanded="false"
                aria-controls="academy-submenu"
                popoverTarget={isWide ? 'academy-submenu' : undefined}
                style={
                  isAcademyActive
                    ? { color: 'var(--nm-crimson-bright)', fontWeight: 700 }
                    : undefined
                }
                onClick={(e) =>
                  handleTriggerClick(
                    academyListRef.current,
                    academyHoverPreviewRef,
                    setNarrowAcademyOpen,
                    e
                  )
                }
              >
                <span>Academia</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
              </button>

              <ul
                ref={academyListRef}
                id="academy-submenu"
                className="dropdown-list"
              >
                {ACADEMY_ITEMS.map((item) => (
                  <li key={item.view}>
                    <a
                      href={item.href}
                      aria-current={activeView === item.view ? 'page' : undefined}
                      onClick={(e) => navigate(item.view, e)}
                      className="block rounded-lg px-3 py-1.5 no-underline transition-colors hover:bg-[var(--nm-bg-elevated)]"
                      style={{ color: 'var(--nm-text-main)' }}
                    >
                      <span
                        className="block text-xs font-bold"
                        style={{
                          color:
                            activeView === item.view
                              ? 'var(--nm-crimson-bright)'
                              : 'var(--nm-text-main)',
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="block text-[11px] whitespace-normal leading-snug"
                        style={{ color: 'var(--nm-text-muted)' }}
                      >
                        {item.description}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Controles de utilidad compactos (Cambio de esquema claro/oscuro) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleColorScheme}
            aria-label={isDark ? 'Cambiar a tema claro editorial' : 'Cambiar a tema oscuro nocturno'}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 min-h-[2.25rem] text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--nm-bg-elevated)',
              borderColor: 'var(--nm-border-strong)',
              color: 'var(--nm-text-main)',
            }}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" style={{ color: 'var(--nm-gold)' }} aria-hidden="true" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" style={{ color: 'var(--nm-navy)' }} aria-hidden="true" />
                <span className="hidden sm:inline">Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
