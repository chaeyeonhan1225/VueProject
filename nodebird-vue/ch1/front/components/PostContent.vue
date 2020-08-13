<template>
  <div>
    <PostImages :images="post.Images || []"></PostImages>
      <v-card-title>
        <h3>
          <nuxt-link :to="'/user/' + post.User.id">{{ post.User.nickname }}</nuxt-link>
          <v-btn v-if="canFollow" @click="onFollow">팔로우</v-btn>
          <v-btn v-if="canUnFollow" @click="onUnFollow">언팔로우</v-btn>
        </h3>
      </v-card-title>
      <v-card-text>
        <div>
          <template v-for="(node,i) in nodes">
            <nuxt-link v-if="node.startsWith('#')" :key="i" :to="`/hashtag/${node.slice(1)}`">{{node}}</nuxt-link>
            <template v-else>{{node}}</template>
          </template>
        </div>
      </v-card-text>
  </div>
</template>

<script>
    import PostImages from './PostImages';

    export default {
        components: {
            PostImages,
        },
        props: {
            post: {
                type: Object,
            }
        },
        computed: {
          nodes() {
            return this.post.content.split(/(#[^\s#]+)/); // split에선 괄호 꼭 넣어줘야함
          },
          me() {
            return this.$store.state.users.me;
          },
          canFollow() {
            return this.me && this.post.User.id !== this.me.id && ! this.me.Followings.find(v=>v.id === this.post.User.id);
          },
          canUnFollow() {
            return this.me && this.post.User.id !== this.me.id &&  this.me.Followings.find(v=>v.id === this.post.User.id);
          }
        },
        methods: {
          onFollow() {
            this.$store.dispatch('users/follow',{
              userId: this.post.User.id,
            });
          },
          onUnFollow() {
            this.$store.dispatch('users/unfollow',{
              userId: this.post.User.id,
            });
          },
        },
    }
</script>

<style scoped>
    a {
        text-decoration: none;
        color: inherit;
    }
</style>