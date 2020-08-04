<template>
  <v-app>
    <nav>
      <v-toolbar dark color="green">
        <nuxt-link to="/">NodeBird</nuxt-link>     
      <v-spacer />
      <v-toolbar-items>
        <v-form @submit.prevent="onSearchHashtag">
          <div :style="{ display: 'flex', height: '100%', alignItems: 'center'}">
            <v-text-field
              v-model="hashtag" 
              label="검색" 
              hide-details 
              prepend-icon="mdi-magnify" 
              :style="{ display: 'flex',alignItems: 'center'}"
            />
          </div>
        </v-form>
        <v-btn text nuxt to="/profile" :style="{ display: 'flex', alignItems: 'center'}">
          <div>프로필</div>
        </v-btn>
        <v-btn text nuxt to="/signup" :style="{ display: 'flex', alignItems: 'center'}">
          <div>회원가입</div>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
   </nav>
   <v-row no-gutters>
       <v-col cols="12" md="4">
          <LoginForm />
       </v-col>
       <v-col cols="12" md="8">
          <nuxt />
       </v-col>
   </v-row>
  </v-app>
</template>
<script>
import LoginForm from '~/components/LoginForm'; // ~ : 루트
export default {
  components: {
    LoginForm,
  },
  data() {
    return {
      hashtag: '',
    }
  },
  methods: {
    onSearchHashtag() {
      this.$router.push({
        path: `/hashtag/${this.hashtag}`,
      });
      this.hashtag = '';
    },
  }
}
</script>

<style>
</style>