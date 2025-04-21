<script setup lang="ts">
const route = useRoute()
const { user } = useUserSession()

// Display name (preferred_username if available, otherwise email)
const displayName = computed(() => {
  return user.value?.preferred_username || user.value?.email || ''
})

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Blog',
  to: '/blog'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <LogoPro class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <AuthState>
        <template #default="{ loggedIn, clear }">
          <!-- When not logged in - mobile view -->
          <template v-if="!loggedIn">
            <UButton
              icon="i-lucide-log-in"
              color="neutral"
              variant="ghost"
              to="/auth/cognito"
              class="lg:hidden"
              external
            />

            <UButton
              label="Sign in"
              color="neutral"
              variant="ghost"
              to="/auth/cognito"
              class="hidden lg:inline-flex"
              external
            />

            <UButton
              label="Sign up"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="hidden lg:inline-flex"
              to="/auth/cognito_signup"
              external
            />
          </template>

          <!-- When logged in - mobile view -->
          <template v-else>
            <UButton
              icon="i-lucide-log-out"
              color="neutral"
              variant="ghost"
              class="lg:hidden"
              @click="async () => { await clear(); await navigateTo('/'); }"
            />

            <div class="hidden lg:flex items-center gap-2">
              <UBadge
                color="neutral"
                class="px-2 py-1"
              >
                {{ displayName }}
              </UBadge>
              <UButton
                label="Sign out"
                color="neutral"
                variant="ghost"
                @click="async () => { await clear(); await navigateTo('/'); }"
              />
            </div>
          </template>
        </template>
        <template #placeholder>
          <div class="flex items-center justify-between mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span class="text-sm">Loading...</span>
          </div>
        </template>
      </AuthState>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <!-- Responsive menu footer buttons -->
      <AuthState>
        <template #default="{ loggedIn, clear }">
          <template v-if="!loggedIn">
            <UButton
              label="Sign in"
              color="neutral"
              variant="subtle"
              to="/auth/cognito"
              block
              class="mb-3"
              external
            />
            <UButton
              label="Sign up"
              color="neutral"
              to="/auth/cognito_signup"
              block
              external
            />
          </template>
          <template v-else>
            <div class="flex items-center justify-between mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <span class="text-sm">{{ displayName }}</span>
            </div>
            <UButton
              label="Sign out"
              color="neutral"
              variant="subtle"
              block
              @click="async () => { await clear(); await navigateTo('/'); }"
            />
          </template>
        </template>
        <template #placeholder>
          <div class="flex items-center justify-between mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span class="text-sm">Loading...</span>
          </div>
        </template>
      </AuthState>
    </template>
  </UHeader>
</template>
