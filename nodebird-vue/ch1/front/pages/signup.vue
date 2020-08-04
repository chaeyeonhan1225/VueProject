<template>
  <div>
    <v-container>
      <v-card>
        <v-subheader>회원가입</v-subheader>
        <v-container>
        <v-form ref="form" v-model="valid" @submit.prevent="onSubmitForm">
          <v-text-field
            v-model="email"
            label="이메일"
            type="email"
            :rules="emailRules"
            required
          />
          <v-text-field
            v-model="password"
            label="비밀번호"
            type="password"
            :rules="passwordRules"
            required
          />
          <v-text-field
            v-model="passwordCheck"
            label="비밀번호확인"
            type="password"
            :rules="passwordCheckRules"
            required
          />
          <v-text-field
            v-model="nickname"
            label="닉네임"
            :rules="nicknameRules"
            required
          />
          <v-checkbox 
            v-model="terms"
            label="제로초 말을 잘 들을 것을 약속합니다."
            :rules="[v=>!!v||'약관에 동의해야합니다.']"
            required
          />
          <v-btn color="green" type="submit">가입하기</v-btn>
        </v-form>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      valid: false, // 전체 회원가입이 유효한지
      email: '',
      password: '',
      passwordCheck: '',
      nickname: '',
      terms: false,
      emailRules: [
        v => !!v || '이메일은 필수입니다.',
        v => /.+@.+/.test(v) || '이메일이 유효하지 않습니다.'
      ],
      nicknameRules: [
        v => !!v || '닉네임은 필수입니다.',
      ],
      passwordRules: [
        v => !!v || '비밀번호는 필수입니다.',
      ],
      passwordCheckRules: [
        v => !!v || '비밀번호 확인은 필수입니다.',
        v => v === this.password || '비밀번호가 일치하지 않습니다.'
      ]
    };
  },
  computed: {
    me() {
      return this.$store.state.users.me;
    }
  },
  watch: {
    me(value,oldValue){
      if(value){
        this.$router.push({
          path: '/',
        });
      }
    }
  },
  methods: {
    onSubmitForm(){
      if(this.$refs.form.validate()){
        this.$store.dispatch('users/signUp',{
          email: this.email,
          passwd: this.password,
          nickname: this.nickname,
        }).then(() => {
          this.$router.push({
          path: '/',
          });
        }).catch(()=>{
          alert('회원가입 실패');
        });
      }
    },
  },
  head() {
    return {
      title: '회원가입'
    }
  },
  middleware: 'anonymous'
}
</script>

<style>
</style>