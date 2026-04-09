# @deshicode/utils-sveltekit
 

[![Build & Publish](https://github.com/deshi-code/utils-sveltekit/actions/workflows/publish.yml/badge.svg)](https://github.com/deshi-code/utils-sveltekit/actions)
[![NPM Version](https://img.shields.io/npm/v/%40deshicode%2Futils-sveltekit?color=label=npm)](https://www.npmjs.com/package/@deshicode/utils-sveltekit)
[![NPM Downloads](https://img.shields.io/npm/dm/%40deshicode%2Futils-sveltekit?color=black)](https://www.npmjs.com/package/@deshicode/utils-sveltekit)
[![License](https://img.shields.io/github/license/deshi-code/utils-sveltekit?color=blue)](https://github.com/deshi-code/utils-sveltekit/blob/main/LICENSE)
[![SvelteKit Compatibility](https://img.shields.io/badge/SvelteKit-Compatible-ff3e00?logo=svelte&logoColor=white)](https://kit.svelte.dev)



A suite of enterprise-grade SvelteKit utilities designed for internal use. Optimized for high-performance debugging, hardware-aware responsiveness, and seamless development workflows.


## **@deshicode/utils-sveltekit/client**

A suite of utilities and interactive components optimized for SvelteKit. Designed for high-performance debugging, hardware-aware responsiveness, and seamless development workflows.

## **Installation**

Install the core package and its required peer dependencies using your preferred package manager:

### **NPM** or your favorite nodejs package manager

npm install @deshicode/utils-sveltekit svelte tailwindcss


## **API Reference**

### **Components**

#### **DevDeviceBlock**

A lightweight, development-only visualizer for Tailwind CSS breakpoints. It helps ensure your UI scales correctly across the responsive spectrum by displaying the active breakpoint in real-time.

**Usage:**

```svelte
<script>
  import { DevDeviceBlock } from '@deshicode/utils-sveltekit/client';
</script>

<DevDeviceBlock />
```

#### **PreDebug**

An advanced, interactive JSON/data inspector. Unlike standard \<pre\> tags, PreDebug features a portal-based stacking system, smooth drag-and-drop mechanics, and hardware-accelerated transitions.

**Properties:**

| Property | Type | Default | Description |
| :---- | :---- | :---- | :---- |
| data | any | undefined | The reactive data or object to inspect. |
| title | string | "" | Optional header label (auto-generates an ID if empty). |
| classes | string | "" | Custom CSS classes for the container. |
| floating | boolean | true | When true, portals the inspector to a fixed stack in the bottom-right. |

**Features:**

* **Stacking Engine:** Automatically manages multiple instances via a fixed portal container.  
* **Interactive UI:** Supports drag-to-reposition for both the summary block and the full-screen modal.  
* **Live Metadata:** Displays payload weight (KB/B) and line counts.  
* **Syntax Highlighting:** Integrated color-coding for keys, strings, booleans, and numbers.  
* **Modal Viewer:** Full-screen mode for deep-diving into complex nested objects with one-click clipboard copying.

**Usage:**

```svelte
<script>
  import { PreDebug } from '@deshicode/utils-sveltekit/client';
  
  let storeData = { status: 'success', latency: '42ms', region: 'us-east-1' };
</script>

<!-- Floating portal (Default) -->
<PreDebug data={storeData} title="API Response" />

<!-- Inline mode -->
<PreDebug data={storeData} floating={false} classes="rounded-lg border" />

```

### **Stores**

#### **ClientResponsiveStore**

A sophisticated, performance-first store that tracks the environment. It leverages requestAnimationFrame and matchMedia listeners to provide a comprehensive snapshot of the user's hardware and viewport.

**ResponsiveState Schema:**

| Property | Type | Description |
| :---- | :---- | :---- |
| width / height | number | Current window dimensions in pixels. |
| theme | 'light' | 'dark' | 'not-found' | Real-time system color scheme detection. |
| activeBreakpoint | DeviceBreakpoint | Current active breakpoint (xs through 2xl or ssr). |
| isHoverable | boolean | Detects mouse/pointer capability for hover states. |
| isTouchable | boolean | Detects touch-input hardware. |
| isFoldable | boolean | Detects dual-screen or foldable viewport segments. |
| isMobile | boolean | width \< 768px. |
| isTablet | boolean | width \>= 768px && \< 1024px. |
| isDesktop | boolean | width \>= 1024px. |

**Usage:**

```svelte
<script>
  import { ClientResponsiveStore } from '@deshicode/utils-sveltekit/client';
</script>

<div class="p-6">
  <h1 class="text-xl">System: {$ClientResponsiveStore.theme}</h1>
  
  {#if $ClientResponsiveStore.isMobile}
    <MobileNavigation />
  {:else}
    <DesktopNavigation />
  {/if}
</div>

```

**Breakpoint Thresholds:**

* xs: 320px  
* sm: 640px  
* md: 768px  
* lg: 1024px  
* xl: 1280px  
* 2xl: 1536px

## **Import Summary**

```ts
import {   
    DevDeviceBlock,   
    PreDebug,   
    ClientResponsiveStore   
} from "@deshicode/utils-sveltekit/client";
```