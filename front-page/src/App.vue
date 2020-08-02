<template>
  <v-app>
    <v-app-bar
      app
      color="white"
      flat
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>Page title</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon router :to="{ name: 'SignUp'}">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-row>
        <v-col cols="12" md="4">

        </v-col>
        <v-col cols="12" md="8">
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {

  },

  data: () => ({
    //
  }),
};
</script>
