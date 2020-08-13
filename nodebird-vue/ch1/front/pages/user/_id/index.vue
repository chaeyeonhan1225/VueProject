<template>
  <v-container>
    <v-card style="margin-bottom: 20px">
      <v-container>
        {{ other.nickname }}
        <v-row>
          <v-col cols="4">{{other.Followings.length}} 팔로잉</v-col>
          <v-col cols="4">{{other.Followers.length}} 팔로우</v-col>
          <v-col cols="4">{{other.Posts.length}} 게시글</v-col>
        </v-row>
      </v-container>
    </v-card>
    <div>
      <post-card v-for="p in mainPosts" :key="p.id" :post="p"></post-card>
    </div>
  </v-container>
</template>

<script>
import PostCard from '~/components/PostCard';

export default {
  components: {
    PostCard, 
  },
  computed: {
    other() {
      return this.$store.state.users.other;
    },
    mainPosts() {
      return this.$store.state.posts.mainPosts;
    },
  },
  // fetch에서는 this를 못써서 params에서 id를 꺼내쓴다.
  fetch({ store, params }){
    // return은 완료를 기다린다.중요 !!
    return Promise.all([store.dispatch('posts/loadUserPosts',{
        userId: params.id,
        reset: true,
      }),
      store.dispatch('users/loadOther',{
        userId: params.id,
        }),
      ]);
  },
  mounted(){
    window.addEventListener('scroll',this.onScroll);
  },
  beforeDestroy(){
    window.removeEventListener('scroll',this.onScroll);
  },
  methods : {
    onScroll(){
      if(window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300){
        if(this.hasMorePost){
          console.log('scroll');
          this.$store.dispatch('posts/loadPosts');
        }
      }
    }
  }
}
</script>

<style>
</style>