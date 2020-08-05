<template>
  <v-card style="margin-bottom: 20px">
    <v-container>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmitForm">
        <v-textarea
          outlined
          auto-grow
          clearble
          v-model="content"
          label="어떤 신기한 일이 있었나요?"
          :hide-details="hideDetails"
          :success-messages="successMessages"
          :success="success"
          :rules="[v => !!v.trim() || '내용을 입력하세요.']"
          @input="onChangeTextarea"
        >
        </v-textarea>
        <v-btn type="submit" color="green" absolute right>짹짹</v-btn>
        <input ref="imageInput" type="file" multiple hidden @change="onChangeImage">
        <v-btn type="button" @click="onClickImageUpload">이미지 업로드</v-btn>
        <div>
          <div v-for="(p,i) in imagePaths" :key="p" style="display: inline-block">
            <img :src="`http://localhost:3085/${p}`" :alt="p" style="width: 200px">
             <button @click="onRemoveImage(i)" type="button">제거</button>
          </div>
        </div>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

// form에 있는 버튼들은 submit할거 아니면 type을 button으로 하면 좋다. 안그러면 form에 있는 데이터가 전부 제출됨
export default {
  data() {
    return {
      valid: false,
      hideDetails: false,
      successMessages: '',
      success: false,
      content: '',
    }
  },
  computed: {
    ...mapState('users',['me']),
    ...mapState('posts',['imagePaths']),
  },
  methods: {
    onChangeTextarea(value) {
      if(value.length){
        this.hideDetails = true;
        this.success = false;
        this.successMessages = '';
      }
    },
    onSubmitForm() {
      if(this.$refs.form.validate()){
        this.$store.dispatch('posts/add',{
          content: this.content,
          User: {
            nickname: this.me.nickname,
          },
          Comments: [],
          Images: [],
          id: Date.now(),
          createdAt: Date.now(),
        })
        .then(()=>{
          this.content = '',
          this.hideDetails = false,
          this.success = true,
          this.successMessages = '게시글 등록 성공!';
        })
        .catch((err)=>{

        });
      }
    },
    onClickImageUpload() {
      this.$refs.imageInput.click();
    },
    onChangeImage(e){
      console.log(e.target.files);
      const imageFormData = new FormData();
      [].forEach.call(e.target.files, (f) =>{
        imageFormData.append('image',f);  // { image: [file1,file2]}
      });
      this.$store.dispatch('posts/uploadImages', imageFormData);
    },
    onRemoveImage(index) {
      this.$store.commit('posts/removeImagePath',index);
    }
  }
}
</script>