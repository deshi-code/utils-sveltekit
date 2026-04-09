<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { backOut } from 'svelte/easing';
    import { responsive, type ResponsiveState } from './ClientResponsiveStore.ts';
    import { onDestroy, onMount } from 'svelte';

    import '../../../assets/lib.css';
    
    let res = $state<ResponsiveState>(responsive.getState());
    let isDialogOpen = $state(false);
    let copied = $state(false);
    let activeTab = $state('specs'); 
    let isMounted = $state(false);

    // --- DRAG STATE ---
    let dragX = $state(0);
    let dragY = $state(0);
    let isDragging = $state(false);
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    const bpColors: Record<string, string> = {
        ssr: 'dc:text-slate-400 dc:border-slate-400',
        xs: 'dc:text-pink-400 dc:border-pink-400',
        sm: 'dc:text-orange-400 dc:border-orange-400',
        md: 'dc:text-emerald-400 dc:border-emerald-400',
        lg: 'dc:text-sky-400 dc:border-sky-400',
        xl: 'dc:text-indigo-400 dc:border-indigo-400',
        '2xl': 'dc:text-purple-400 dc:border-purple-400'
    };

    let browserInfo = $state({
        ua: '', browser: 'Unknown', os: 'Unknown', lang: '', cookies: false,
        cores: 0, memory: 'N/A', pdf: false, online: true, dark: false,
        pointer: 'fine', maxTouchPoints: 0, colorDepth: 24, networkType: 'UNKNOWN', screenRes: ''
    });

    onMount(() => {
        isMounted = true;
        const ua = navigator.userAgent;
        
        // Better Browser Detection
        let browserName = 'Unknown';
        if (ua.includes('Firefox/')) browserName = 'Firefox';
        else if (ua.includes('Edg/')) browserName = 'Edge';
        else if (ua.includes('Chrome/')) browserName = 'Chrome';
        else if (ua.includes('Safari/') && !ua.includes('Chrome')) browserName = 'Safari';

        let osName = 'Unknown';
        if (ua.includes('Win')) osName = 'Windows';
        else if (ua.includes('Mac')) osName = 'macOS';
        else if (ua.includes('Linux')) osName = 'Linux';
        else if (/Android/.test(ua)) osName = 'Android';
        else if (/iPhone|iPad|iPod/.test(ua)) osName = 'iOS';

        browserInfo = {
            ua, browser: browserName, os: osName, lang: navigator.language,
            cookies: navigator.cookieEnabled, cores: navigator.hardwareConcurrency || 0,
            // @ts-ignore
            memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A',
            pdf: navigator.pdfViewerEnabled ?? false, online: navigator.onLine,
            dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            pointer: window.matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse',
            maxTouchPoints: navigator.maxTouchPoints || 0, colorDepth: screen.colorDepth || 24,
            // @ts-ignore
            networkType: navigator.connection?.effectiveType?.toUpperCase() || 'N/A',
            screenRes: `${screen.width} × ${screen.height}`
        };
    });

    let formattedJSON = $derived.by(() => {
        const fullData = { browser: browserInfo };
        return JSON.stringify(fullData, null, 2)
            .replace(/"([^"]+)":/g, '<span class="dc:text-indigo-400">"$1"</span>:') 
            .replace(/: (true|false)/g, ': <span class="dc:text-orange-400">$1</span>')
            .replace(/: (\d+)/g, ': <span class="dc:text-sky-400">$1</span>')
            .replace(/: "([^"]+)"/g, ': <span class="dc:text-emerald-400">"$1"</span>');
    });

    // --- UPDATED DRAG LOGIC ---
    function onPointerDown(e: PointerEvent) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = dragX;
        initialY = dragY;

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e: PointerEvent) {
        if (!isDragging) return;
        dragX = initialX + (e.clientX - startX);
        dragY = initialY + (e.clientY - startY);
    }

    function onPointerUp(e: PointerEvent) {
        if (!isDragging) return;
        
        const moved = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
        
        if (moved < 4) {
            isDialogOpen = true;
        }

        isDragging = false;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }

    const unsubscribe = responsive.subscribe((newState) => { res = newState; });
    onDestroy(() => {
        unsubscribe();
        if (typeof window !== 'undefined') {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        }
    });

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(JSON.stringify({ browser: browserInfo }, null, 2));
            copied = true;
            setTimeout(() => (copied = false), 2000);
        } catch (err) {}
    }
    
    let currentColor = $derived(bpColors[res.activeBreakpoint] || 'dc:text-slate-400 dc:border-slate-400');
</script>

{#if isMounted}
    <div 
        onpointerdown={onPointerDown}
        style="transform: translate({dragX}px, {dragY}px); touch-action: none;"
        class="dc:fixed dc:bottom-4 dc:right-4 dc:z-[9999] dc:flex dc:items-center dc:gap-3 dc:rounded-full dc:bg-slate-900/95 dc:px-3 dc:py-1.5 dc:text-xs dc:font-medium dc:text-slate-200 dc:shadow-xl dc:shadow-black/20 dc:backdrop-blur-md dc:ring-1 dc:ring-white/10 dc:cursor-grab active:dc:cursor-grabbing hover:dc:bg-slate-800 dc:transition-colors dc:select-none"
    >
        <div class="dc:flex dc:items-center dc:gap-2 dc:border-r dc:border-slate-700 dc:pr-3 dc:font-mono dc:uppercase dc:tracking-widest dc:pointer-events-none">
            <span class="dc:flex dc:h-2 dc:w-2 dc:rounded-full dc:border dc:border-current dc:bg-current/20 {currentColor}"></span> 
            <span class="{currentColor}">{res.activeBreakpoint}</span>
        </div> 
        
        <div class="dc:flex dc:items-center dc:gap-1.5 dc:border-r dc:border-slate-700 dc:pr-3 dc:pointer-events-none">
            <span class="dc:rounded dc:bg-indigo-500/20 dc:px-1.5 dc:py-0.5 dc:text-[10px] dc:text-indigo-300 dc:ring-1 dc:ring-indigo-500/30">
                {browserInfo.dark ? 'DRK' : 'LGT'}
            </span>
            <span class="dc:rounded dc:bg-slate-800 dc:px-1.5 dc:py-0.5 dc:text-[10px] dc:text-slate-400">
                {browserInfo.pointer === 'fine' ? 'PTR' : 'TCH'}
            </span>
        </div> 
        
        <div class="dc:flex dc:items-center dc:gap-1 dc:font-mono dc:tabular-nums dc:tracking-tight dc:pointer-events-none">
            <span>{res.width}</span> 
            <span class="dc:text-slate-500">×</span> 
            <span>{res.height}</span>
        </div>
    </div>
{/if}

{#if isDialogOpen}
    <div class="dc:fixed dc:inset-0 dc:z-[10000] dc:bg-slate-950/40 dc:backdrop-blur-sm" transition:fade onclick={() => isDialogOpen = false}></div>

    <div 
        class="dc:fixed dc:left-1/2 dc:top-1/2 dc:z-[10001] dc:flex dc:h-[600px] dc:w-[900px] dc:max-w-[95vw] dc:max-h-[80vh] dc:-translate-x-1/2 dc:-translate-y-1/2 dc:flex-col dc:overflow-hidden dc:rounded-3xl dc:bg-slate-950 dc:ring-1 dc:ring-white/20 dc:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
        transition:scale={{ start: 0.8, duration: 400, easing: backOut }}
    >
        <div class="dc:flex dc:items-center dc:justify-between dc:border-b dc:border-slate-800 dc:bg-white/5 dc:px-6 dc:py-4">
            <div class="dc:flex dc:items-center dc:gap-4">
                <div class="dc:flex dc:gap-1.5">
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-red-500/20"></div>
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-amber-500/20"></div>
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-emerald-500/20"></div>
                </div>
                <h3 class="dc:font-mono dc:text-xs dc:font-bold dc:uppercase dc:tracking-[0.3em] dc:text-slate-400">Environment Details</h3>
            </div>
            
            <div class="dc:flex dc:items-center dc:gap-4">
                <nav class="dc:flex dc:rounded-full dc:bg-black/40 dc:p-1 dc:ring-1 dc:ring-white/10">
                    {#each ['specs', 'raw'] as tab}
                        <button 
                            onclick={() => activeTab = tab}
                            class="dc:rounded-full dc:px-4 dc:py-1 dc:text-[9px] dc:font-bold dc:uppercase dc:tracking-wider dc:transition-all {activeTab === tab ? 'dc:bg-indigo-500 dc:text-white' : 'dc:text-slate-500 hover:dc:text-slate-300'}"
                        >{tab}</button>
                    {/each}
                </nav>
                <button onclick={() => isDialogOpen = false} class="dc:rounded-full dc:bg-white/5 dc:p-1.5 dc:text-slate-400 hover:dc:bg-red-500/20 hover:dc:text-red-400 dc:transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <div class="custom-scrollbar dc:flex-1 dc:overflow-auto dc:p-8 dc:bg-slate-950/50">
            {#if activeTab === 'specs'}
                <div in:fade={{ duration: 200 }} class="dc:space-y-8">
                    <div>
                        <h4 class="dc:mb-4 dc:text-[10px] dc:font-bold dc:uppercase dc:tracking-[0.2em] dc:text-indigo-400/60">UX & Browser Capabilities</h4>
                        <div class="dc:grid dc:grid-cols-2 md:dc:grid-cols-4 lg:dc:grid-cols-5 dc:gap-4">
                            {#each [
                                { label: 'Browser', value: browserInfo.browser, sub: browserInfo.os },
                                { label: 'Resolution', value: browserInfo.screenRes, sub: `${browserInfo.colorDepth}-bit Color` },
                                { label: 'Device RAM', value: browserInfo.memory, sub: 'Hardware Capacity' },
                                { label: 'CPU Cores', value: browserInfo.cores, sub: 'Logical Threads' },
                                { label: 'Touch Points', value: browserInfo.maxTouchPoints, sub: 'Hardware Limit' },
                                { label: 'Network', value: browserInfo.networkType, sub: browserInfo.online ? 'Online' : 'Offline' },
                                { label: 'Language', value: browserInfo.lang.toUpperCase(), sub: 'Primary Locale' },
                                { label: 'Cookies', value: browserInfo.cookies ? 'Active' : 'Blocked', sub: 'Cookie Policy' },
                                { label: 'PDF View', value: browserInfo.pdf ? 'Available' : 'Disabled', sub: 'Native Plugin' },
                                { label: 'Pixel Ratio', value: `${window.devicePixelRatio}x`, sub: 'Display Density' }
                            ] as item}
                                <div class="dc:rounded-2xl dc:border dc:border-white/5 dc:bg-white/[0.02] dc:p-4">
                                    <p class="dc:text-[9px] dc:font-bold dc:uppercase dc:tracking-widest dc:text-slate-500">{item.label}</p>
                                    <p class="dc:mt-1 dc:font-mono dc:text-sm dc:text-slate-200 dc:truncate">{item.value}</p>
                                    <p class="dc:mt-1 dc:text-[8px] dc:text-slate-600">{item.sub}</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {:else}
                <div in:fade={{ duration: 200 }} class="dc:relative">
                    <button onclick={handleCopy} class="dc:absolute dc:right-0 dc:top-0 dc:rounded-lg dc:bg-indigo-500/10 dc:px-3 dc:py-1.5 dc:text-[10px] dc:font-bold dc:uppercase dc:text-indigo-400 dc:ring-1 dc:ring-indigo-500/20 hover:dc:bg-indigo-500 hover:dc:text-white dc:transition-all dc:z-10">
                        {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <pre class="dc:font-mono dc:text-[13px] dc:leading-relaxed dc:tabular-nums dc:text-slate-300"><code>{@html formattedJSON}</code></pre>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
    div { will-change: transform, opacity; }
</style>