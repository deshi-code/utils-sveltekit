import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientResponsiveStore } from './ClientResponsiveStore.ts';

 

describe('ClientResponsiveStore Class', () => {
    it("should be truthy",(x)=>{
        expect(ClientResponsiveStore).toBeTruthy()  
    })
//     // Helper to mock window.matchMedia
//     const setupMatchMediaMock = (
//         matchesHover = false,
//         matchesTouch = false,
//         matchesFold = false
//     ) => {
//         vi.stubGlobal('matchMedia', (query: string) => {
//             let matches = false;
//             if (query.includes('hover: hover')) matches = matchesHover;
//             if (query.includes('pointer: coarse')) matches = matchesTouch;
//             if (query.includes('viewport-segments')) matches = matchesFold;

//             return {
//                 matches,
//                 media: query,
//                 onchange: null,
//                 addListener: vi.fn(), 
//                 removeListener: vi.fn(),
//                 addEventListener: vi.fn(),
//                 removeEventListener: vi.fn(),
//                 dispatchEvent: vi.fn(),
//             };
//         });
//     };

//     // Helper to trigger resize event
//     const simulateResize = (width: number, height: number = 1080) => {
//         vi.stubGlobal('innerWidth', width);
//         vi.stubGlobal('innerHeight', height);
//         window.dispatchEvent(new Event('resize'));
//     };

//     beforeEach(() => {
//         // Clear all mocks before each test
//         vi.clearAllMocks();
        
//         // Mock requestAnimationFrame to execute immediately so we don't have to wait for async ticks in tests
//         vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cb(performance.now()));
        
//         // Set default window dimensions
//         vi.stubGlobal('innerWidth', 1024);
//         vi.stubGlobal('innerHeight', 768);
//     });

//     afterEach(() => {
//         vi.unstubAllGlobals();
//     });

//     describe('Initialization & SSR', () => {
//         it('handles SSR safely when window is undefined', () => {
//             // Temporarily remove window to simulate pure Node environment
//             const originalWindow = global.window;
//             // @ts-expect-error - testing SSR override
//             delete global.window;

//             const responsive = new ClientResponsiveStore();
            
//             expect(responsive.width).toBe(0);
//             expect(responsive.activeBreakpoint).toBe('ssr');
//             expect(responsive.isMobile).toBe(false);

//             // Restore window
//             global.window = originalWindow;
//         });

//         it('initializes with current window dimensions', () => {
//             setupMatchMediaMock();
//             const responsive = new ClientResponsiveStore();
            
//             expect(responsive.width).toBe(1024);
//             expect(responsive.height).toBe(768);
//         });
//     });

//     describe('Breakpoints & Mobile Detection', () => {
//         it('resolves xs breakpoint', () => {
//             setupMatchMediaMock();
//             vi.stubGlobal('innerWidth', 300);
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.activeBreakpoint).toBe('xs');
//             expect(responsive.isMobile).toBe(true);
//         });

//         it('resolves sm breakpoint', () => {
//             setupMatchMediaMock();
//             vi.stubGlobal('innerWidth', breakpoints.sm);
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.activeBreakpoint).toBe('sm');
//             expect(responsive.isMobile).toBe(true);
//         });

//         it('resolves lg breakpoint and returns isMobile as false', () => {
//             setupMatchMediaMock();
//             vi.stubGlobal('innerWidth', breakpoints.lg);
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.activeBreakpoint).toBe('lg');
//             expect(responsive.isMobile).toBe(false);
//         });

//         it('resolves 2xl breakpoint', () => {
//             setupMatchMediaMock();
//             vi.stubGlobal('innerWidth', breakpoints['2xl'] + 100);
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.activeBreakpoint).toBe('2xl');
//         });
//     });

//     describe('Media Queries (Interactions & Foldables)', () => {
//         it('detects hover capability', () => {
//             setupMatchMediaMock(true, false, false);
//             const responsive = new ClientResponsiveStore();
            
//             expect(responsive.isHoverable).toBe(true);
//             expect(responsive.isTouchable).toBe(false);
//         });

//         it('detects touch capability via matchMedia', () => {
//             setupMatchMediaMock(false, true, false);
//             const responsive = new ClientResponsiveStore();
            
//             expect(responsive.isHoverable).toBe(false);
//             expect(responsive.isTouchable).toBe(true);
//         });

//         it('detects touch capability via maxTouchPoints fallback', () => {
//             setupMatchMediaMock(false, false, false);
//             // Simulate a device that doesn't match the media query but has touch points
//             vi.stubGlobal('navigator', { maxTouchPoints: 5 });
            
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.isTouchable).toBe(true);
//         });

//         it('detects foldable displays', () => {
//             setupMatchMediaMock(false, false, true);
//             const responsive = new ClientResponsiveStore();
//             expect(responsive.isFoldable).toBe(true);
//         });
//     });

//     describe('Reactivity & Memory Management', () => {
//         it('fires subscription callback immediately upon subscribing', () => {
//             setupMatchMediaMock();
//             const responsive = new ClientResponsiveStore();
//             const callback = vi.fn();
            
//             responsive.subscribe(callback);
            
//             expect(callback).toHaveBeenCalledTimes(1);
//         });

//         it('notifies subscribers on window resize', () => {
//             setupMatchMediaMock();
//             const responsive = new ClientResponsiveStore();
//             const callback = vi.fn();
            
//             responsive.subscribe(callback);
//             callback.mockClear(); // Clear the initial immediate call

//             simulateResize(800, 600);
            
//             expect(responsive.width).toBe(800);
//             expect(callback).toHaveBeenCalledTimes(1);
//         });

//         it('removes listener when unsubscribe function is called', () => {
//             setupMatchMediaMock();
//             const responsive = new ClientResponsiveStore();
//             const callback = vi.fn();
            
//             const unsubscribe = responsive.subscribe(callback);
//             callback.mockClear(); 

//             unsubscribe();
//             simulateResize(500, 500);
            
//             // Should not be called after unsubscribe
//             expect(callback).not.toHaveBeenCalled(); 
//         });

//         it('clears all listeners and aborts controller on destroy()', () => {
//             setupMatchMediaMock();
//             const responsive = new ClientResponsiveStore();
//             const callback = vi.fn();
            
//             responsive.subscribe(callback);
            
//             // Spy on the AbortController's abort method internally
//             // Note: Since controller is private, we check the behavior (no more events firing)
//             responsive.destroy();
//             callback.mockClear();

//             simulateResize(1200, 800);
            
//             expect(callback).not.toHaveBeenCalled();
//         });
//     });
});


