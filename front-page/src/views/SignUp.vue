<template>
  <v-container>
    <v-card>
      <v-toolbar dark window flat>
        <v-icon style="margin-right: 12px">mdi-message</v-icon>
        <v-toolbar-title>Sign Up Page</v-toolbar-title>
      </v-toolbar>
      <v-card-title>Sign Up</v-card-title>
      <v-container>
        <v-text-field
          label="이메일"
        />
        <v-text-field
          label="비밀번호"
        />
        <v-text-field
          label="비밀번호 확인"
        />
        <v-btn 
          color="blue"
          text
        >SUBMIT
        </v-btn>
      </v-container>
      
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Home',
  components: {
    
  }
}
</script>
