export const breakpoints = {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
} as const;

export type DeviceBreakpoint = 'ssr' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ThemeMode = 'light' | 'dark' | 'not-found';

export interface ResponsiveState {
    width: number;
    height: number;
    isHoverable: boolean;
    isTouchable: boolean;
    isFoldable: boolean;
    theme: ThemeMode;
    activeBreakpoint: DeviceBreakpoint;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

export class ClientResponsiveStore {
    private state: ResponsiveState;
    private listeners = new Set<(state: ResponsiveState) => void>();
    private controller: AbortController | null = null;

    constructor() {
        // Initialize with default/SSR values
        this.state = this.calculateState(0, 0);
        this.init();
    }

    /**
     * Internal logic to resolve theme from system
     */
    private getSystemTheme(): ThemeMode {
        if (typeof window === 'undefined') return 'not-found';
        
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        
        if (isDark) return 'dark';
        if (isLight) return 'light';
        return 'not-found';
    }

    /**
     * Core logic for calculating state based on current environment
     */
    private calculateState(w: number, h: number): ResponsiveState {
        const bp: DeviceBreakpoint = 
            w === 0 ? 'ssr' :
            w < breakpoints.sm ? 'xs' :
            w < breakpoints.md ? 'sm' :
            w < breakpoints.lg ? 'md' :
            w < breakpoints.xl ? 'lg' :
            w < breakpoints['2xl'] ? 'xl' : '2xl';

        const isClient = typeof window !== 'undefined';

        return {
            width: w,
            height: h,
            theme: this.getSystemTheme(),
            isHoverable: isClient && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
            isTouchable: isClient && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0),
            isFoldable: isClient && window.matchMedia('(horizontal-viewport-segments: 2), (vertical-viewport-segments: 2)').matches,
            activeBreakpoint: bp,
            isMobile: w !== 0 && w < breakpoints.md,
            isTablet: w >= breakpoints.md && w < breakpoints.lg,
            isDesktop: w >= breakpoints.lg
        };
    }

    /**
     * Framework-agnostic subscription
     */
    subscribe(callback: (state: ResponsiveState) => void): () => void {
        this.listeners.add(callback);
        callback(this.state); 
        return () => this.listeners.delete(callback);
    }

    private notify() {
        if (typeof window === 'undefined') return;
        // Generate new state object to trigger reactivity by reference
        this.state = this.calculateState(window.innerWidth, window.innerHeight);
        this.listeners.forEach(callback => callback(this.state));
    }

    private init() {
        if (typeof window === 'undefined') return;

        this.controller = new AbortController();
        const { signal } = this.controller;

        // Sync initial client state
        this.notify();

        // Optimized Resize
        let ticking = false;
        const handleResize = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.notify();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('resize', handleResize, { passive: true, signal });

        // Proactive Media Queries (Hardware + Theme)
        const queries = [
            '(hover: hover)', 
            '(pointer: coarse)', 
            '(horizontal-viewport-segments: 2)',
            '(prefers-color-scheme: dark)',
            '(prefers-color-scheme: light)'
        ];

        queries.forEach(q => {
            window.matchMedia(q).addEventListener('change', () => this.notify(), { signal });
        });
    }

    getState(): ResponsiveState {
        return this.state;
    }

    destroy() {
        this.controller?.abort();
        this.listeners.clear();
    }
}

export const responsive = new ClientResponsiveStore();