<script lang="ts" module>
    let instanceCount = 0;
    let portalContainer: HTMLDivElement | null = null;
    import '$assets/lib.css';
    function getPortal() {
        if (typeof document === 'undefined') return null;
        if (!portalContainer) {
            portalContainer = document.createElement('div');
            portalContainer.id = 'predebug-stack-container';
            portalContainer.className = 'dc:fixed dc:bottom-28 dc:right-6 dc:z-[9999] dc:flex dc:flex-col-reverse dc:items-end dc:gap-3 dc:pointer-events-none';
            document.body.appendChild(portalContainer);
        }
        return portalContainer;
    }
</script>

<script lang="ts">
    import { fade, fly, scale } from 'svelte/transition';
    import { cubicOut, backOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    let {
        data = undefined,
        title = "",
        classes = "",
        floating = true 
    }: {
        data?: any;
        title?: string;
        classes?: string;
        floating?: boolean;
    } = $props();

    const instanceId = ++instanceCount;
    const displayTitle = $derived(title || `No Title ${instanceId}`);

    let copied = $state(false);
    let isExpanded = $state(false);
    let isModalOpen = $state(false);
    let isMounted = $state(false);
    let element = $state<HTMLElement | null>(null);

    // --- DRAG ENGINE ---
    let dragTarget = $state<'block' | 'modal' | null>(null);
    let blockPos = $state({ x: 0, y: 0 });
    let modalPos = $state({ x: 0, y: 0 });
    let startMousePos = { x: 0, y: 0 };
    let startElemPos = { x: 0, y: 0 };
    let hasMovedSignificantly = false;

    function handleGlobalMouseMove(e: MouseEvent) {
        if (!dragTarget) return;
        const dx = e.clientX - startMousePos.x;
        const dy = e.clientY - startMousePos.y;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMovedSignificantly = true;

        if (dragTarget === 'block') {
            blockPos.x = startElemPos.x + dx;
            blockPos.y = startElemPos.y + dy;
        } else {
            modalPos.x = startElemPos.x + dx;
            modalPos.y = startElemPos.y + dy;
        }
    }

    function handleGlobalMouseUp() {
        dragTarget = null;
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    }

    function initDrag(e: MouseEvent, target: 'block' | 'modal') {
        dragTarget = target;
        hasMovedSignificantly = false;
        startMousePos = { x: e.clientX, y: e.clientY };
        const currentPos = target === 'block' ? blockPos : modalPos;
        startElemPos = { x: currentPos.x, y: currentPos.y };
        
        e.preventDefault();

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    let stats = $derived.by(() => {
        const str = JSON.stringify(data || {});
        const bytes = new Blob([str]).size;
        const formatted = JSON.stringify(data, null, 2) || "";
        const lines = formatted.split('\n').length;
        return {
            weight: bytes > 1024 ? (bytes / 1024).toFixed(1) + 'KB' : bytes + 'B',
            height: lines + 'L'
        };
    });

    onMount(() => {
        if (floating && element) {
            const portal = getPortal();
            if (portal) portal.appendChild(element);
        }
        requestAnimationFrame(() => { isMounted = true; });
    });

    function toggleExpand() {
        if (hasMovedSignificantly) return; 
        isExpanded = !isExpanded;
    }

    function openModal(e: MouseEvent) {
        e.stopPropagation();
        modalPos = { x: (window.innerWidth / 2) - 450, y: (window.innerHeight / 2) - 300 };
        isModalOpen = true;
    }

    let formattedData = $derived.by(() => {
        try {
            return JSON.stringify(structuredClone(data ?? { status: "empty" }), null, 2);
        } catch (e) {
            return JSON.stringify(data, null, 2);
        }
    });

    async function handleCopy(e: MouseEvent) {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(formattedData);
            copied = true;
            setTimeout(() => (copied = false), 2000);
        } catch (err) {}
    }
</script>

<div 
    bind:this={element}
    class="{floating ? 'dc:pointer-events-auto dc:w-fit' : 'dc:relative dc:my-4 dc:w-full'} {classes}"
>
    {#if isMounted}
        <div 
            style="transform: translate3d({blockPos.x}px, {blockPos.y}px, 0);"
            transition:fly={{ x: 20, duration: 400, easing: cubicOut }}
            onmousedown={(e) => initDrag(e, 'block')}
            class="dc:group dc:flex dc:flex-col dc:overflow-hidden dc:rounded-2xl dc:bg-slate-950/90 dc:shadow-2xl dc:shadow-black/50 dc:backdrop-blur-xl dc:ring-1 dc:ring-white/10 dc:transition-all dc:duration-500 {isExpanded ? 'dc:w-[450px] dc:max-w-[90vw]' : 'dc:w-auto'} {dragTarget === 'block' ? 'dc:cursor-grabbing' : 'dc:cursor-grab'}"
        >
            <div 
                role="button" 
                tabindex="0"
                onclick={toggleExpand}
                class="dc:flex dc:items-center dc:justify-between dc:gap-4 dc:border-b dc:border-slate-800/50 dc:bg-white/[0.02] dc:px-4 dc:py-2 dc:select-none"
            >
                <div class="dc:flex dc:items-center dc:gap-3">
                    <div class="dc:flex dc:items-center dc:font-mono dc:text-[10px] dc:uppercase dc:tracking-widest dc:text-slate-400">
                        <span class="dc:font-bold dc:text-slate-200">{displayTitle}</span>
                    </div>
                    <div class="dc:flex dc:items-center dc:gap-1.5 dc:opacity-60">
                        <span class="dc:rounded dc:bg-slate-900 dc:px-1.5 dc:py-0.5 dc:text-[9px] dc:font-bold dc:text-indigo-400 dc:ring-1 dc:ring-white/5">{stats.weight}</span>
                        <span class="dc:rounded dc:bg-slate-900 dc:px-1.5 dc:py-0.5 dc:text-[9px] dc:font-bold dc:text-emerald-400 dc:ring-1 dc:ring-white/5">{stats.height}</span>
                    </div>
                </div>

                <div class="dc:flex dc:items-center dc:gap-2">
                    <button 
                        onclick={openModal}
                        onmousedown={(e) => e.stopPropagation()} 
                        class="dc:rounded dc:p-1 dc:text-slate-500 dc:hover:bg-white/10 dc:hover:text-white dc:transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                    </button>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" height="14" 
                        viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="3" 
                        class="dc:text-slate-600 dc:transition-transform dc:duration-300 {isExpanded ? 'dc:rotate-180' : ''}"
                    >
                        <path d="m18 15-6-6-6 6"/>
                    </svg>
                </div>
            </div>

            {#if isExpanded}
                <div in:fade={{ duration: 200 }} class="dc:custom-scrollbar dc:max-h-[300px] dc:overflow-auto dc:p-5 dc:pointer-events-auto">
<pre onmousedown={(e) => e.stopPropagation()} class="dc:font-mono dc:text-[12px] dc:leading-relaxed dc:text-slate-300 dc:cursor-auto"><code>{@html formattedData
    .replace(/"([^"]+)":/g, '<span class="dc:text-indigo-400">"$1"</span>:') 
    .replace(/: (true|false)/g, ': <span class="dc:text-orange-400">$1</span>')
    .replace(/: (\d+)/g, ': <span class="dc:text-sky-400">$1</span>')
    .replace(/: "([^"]+)"/g, ': <span class="dc:text-emerald-400">"$1"</span>')
}</code></pre>
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if isModalOpen}
    <div class="dc:fixed dc:inset-0 dc:z-[10000] dc:bg-slate-950/40 dc:backdrop-blur-sm" transition:fade></div>

    <div 
        class="dc:fixed dc:z-[10001] dc:flex dc:flex-col dc:overflow-hidden dc:rounded-3xl dc:bg-slate-950 dc:ring-1 dc:ring-white/20 dc:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] {dragTarget === 'modal' ? 'dc:cursor-grabbing' : 'dc:cursor-grab'}"
        style="width: 900px; max-width: 95vw; height: 600px; max-height: 80vh; left: {modalPos.x}px; top: {modalPos.y}px;"
        transition:scale={{ start: 0.8, duration: 400, easing: backOut }}
        onmousedown={(e) => initDrag(e, 'modal')}
    >
        <div class="dc:flex dc:items-center dc:justify-between dc:border-b dc:border-slate-800 dc:bg-white/5 dc:px-6 dc:py-4 dc:select-none">
            <div class="dc:flex dc:items-center dc:gap-4">
                <div class="dc:flex dc:gap-1.5">
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-slate-800"></div>
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-slate-800"></div>
                    <div class="dc:w-2.5 dc:h-2.5 dc:rounded-full dc:bg-slate-800"></div>
                </div>
                <h3 class="dc:font-mono dc:text-xs dc:font-bold dc:uppercase dc:tracking-[0.3em] dc:text-slate-400">{displayTitle}</h3>
            </div>
            
            <div class="dc:flex dc:items-center dc:gap-3">
                <button 
                    onclick={handleCopy} 
                    onmousedown={(e) => e.stopPropagation()}
                    class="dc:text-[10px] dc:font-bold dc:uppercase dc:text-indigo-400 dc:hover:text-white dc:px-3 dc:py-1 dc:rounded-full dc:bg-indigo-500/10 dc:transition-all"
                >
                    {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button 
                    onclick={() => isModalOpen = false}
                    onmousedown={(e) => e.stopPropagation()}
                    class="dc:rounded-full dc:bg-white/5 dc:p-1.5 dc:text-slate-400 dc:hover:bg-red-500/20 dc:hover:text-red-400 dc:transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <div class="dc:custom-scrollbar dc:flex-1 dc:overflow-auto dc:p-8 dc:bg-slate-950/50 dc:pointer-events-auto">
<pre onmousedown={(e) => e.stopPropagation()} class="dc:font-mono dc:text-[14px] dc:leading-relaxed dc:tabular-nums dc:cursor-auto"><code class="dc:text-slate-300">{@html formattedData
    .replace(/"([^"]+)":/g, '<span class="dc:text-indigo-400">"$1"</span>:') 
    .replace(/: (true|false)/g, ': <span class="dc:text-orange-400">$1</span>')
    .replace(/: (\d+)/g, ': <span class="dc:text-sky-400">$1</span>')
    .replace(/: "([^"]+)"/g, ': <span class="dc:text-emerald-400">"$1"</span>')
}</code></pre>
        </div>
    </div>
{/if}

<style>
    .dc\:custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .dc\:custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .dc\:custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .dc\:custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
    div { will-change: transform, opacity, left, top; }
</style>