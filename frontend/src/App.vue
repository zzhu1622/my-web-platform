<template>
  <div id="app">
    <!-- Router View Component: Displays the component for the current route -->
    <!-- This is where Vue Router renders different pages based on the URL:
         - "/" route displays LoginForm component
         - "/home" route displays Home component
         - Router guards prevent unauthorized access to /home -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  // No setup() needed - routing is handled by router configuration
  // No state management needed - authentication is managed in localStorage
  // No lifecycle hooks needed - router handles all page transitions
};
</script>

<style>
/* Global styles for the entire application */

#app {
  /* Use system fonts for consistent appearance across browsers */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

  /* Ensure app takes full viewport height */
  min-height: 100vh;

  /* Reset any default margins */
  margin: 0;
  padding: 0;
}

/* Reset body margins to prevent spacing issues */
body {
  margin: 0;
  padding: 0;
}

/* Global box sizing reset */
* {
  box-sizing: border-box;
}
</style>
