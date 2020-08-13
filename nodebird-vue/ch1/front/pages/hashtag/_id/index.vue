<template>
  <v-container>
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
    mainPosts() {
      return this.$store.state.posts.mainPosts;
    },
  },
  fetch({ store, params }){
    return store.dispatch('posts/loadHashtagPosts',{
      hashtag: encodeURIComponent(params.id),
      reset: true,
    });
  },
  mounted(){
    window.addEventListener('scroll',this.onScroll);
  },
  beforeDestroy(){
    window.removeEventListener('scroll',this.onScroll);
  },
  methods : {
    onScroll(){
      // console.log('scroll');
      if(window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300){
        // console.log('scroll');
        if(this.hasMorePost){
          console.log('scroll');
          this.$store.dispatch('posts/loadPosts');
        }
      }
    }
  }
}
</script>