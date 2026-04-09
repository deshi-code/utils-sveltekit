<script lang="ts">
	import DevDeviceBlock from "$lib/client/ClientResponsiveStore/DevDeviceBlock.svelte";
	import PreDebug from "$lib/client/PreDebug/PreDebug.svelte";




    // Mock complex data payload you might get from an API or store
    const sessionData = {
        session_id: "sess_9x8c7v6b5n4m",
        authenticated: true,
        user: {
            id: 1024,
            username: "johndoe_dev",
            role: "super_admin",
            permissions: ["read", "write", "execute", "delete"]
        },
        metadata: {
            last_login: new Date().toISOString(),
            ip_address: "192.168.1.105",
            client: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
        }
    };
</script>

<div class="min-h-screen bg-white text-gray-900 p-8 font-sans">
    <div class="mx-auto max-w-5xl">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-2">User Dashboard</h1>
        <p class="text-gray-500 mb-8">This is your standard application view.</p>

        <div class="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-12 shadow-sm">
            <h2 class="text-lg font-semibold">Welcome back, {sessionData.user.username}</h2>
            <p class="text-sm text-gray-600 mt-1">Role: {sessionData.user.role}</p>
        </div>

        <DevDeviceBlock/>

        <div class="mt-16 border-t border-gray-200 pt-8">
            <h3 class="text-xl font-bold mb-4 text-gray-400">Developer Tools</h3>
            
            <PreDebug 
                data={sessionData} 
                title="Active Session Context" 
            />

            <PreDebug 
                title="Orphaned State" 
            />
        </div>
    </div>
</div>