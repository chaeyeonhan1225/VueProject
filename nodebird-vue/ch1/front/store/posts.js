import Vue from 'vue';
import throttle from 'lodash.throttle';

export const state = () => ({
  mainPosts: [],
  hasMorePost: true,
  imagePaths: [],
});

export const mutations = {
  addMainPost(state,payload){
    state.mainPosts.unshift(payload);
    state.imagePaths = [];
  },
  removeMainPost(state,payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.id);
    state.mainPosts.splice(index, 1);
  },
  addComment(state,payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    state.mainPosts[index].Comments.unshift(payload);
  },
  loadComments(state,payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    Vue.set(state.mainPosts[index], 'Comments', payload.data);
    console.log(state.mainPosts[index]);
  },
  loadPosts(state,payload){
    if(payload.reset){
      state.mainPosts = payload.data;
    } else {
      state.mainPosts = state.mainPosts.concat(payload.data);
    }
    state.hasMorePost = payload.data.length === 10;
  },
  concatImagePaths(state,payload) {
    state.imagePaths = state.imagePaths.concat(payload);
  },
  removeImagePath(state,payload) {
    state.imagePaths.splice(payload,1);
  },
  unlikePost(state,payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    const userIndex = state.mainPosts[index].Likers.findIndex(v => v.id === payload.userId);
    state.mainPosts[index].Likers.splice(userIndex,1);
  },
  likePost(state,payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    state.mainPosts[index].Likers.push({
      id:payload.userId,
    });
  }
};

export const actions = {
    add({ commit, state },payload){
      console.log('add', payload);
      // 서버에 게시글 등록 요청 보냄
      this.$axios.post('/post',{
        content: payload.content,
        image: state.imagePaths,
      },{
        withCredentials: true
      })
      .then((res)=>{
        commit('addMainPost',res.data);
      })
      .catch((err)=>{
        console.error(err);
      });
    },
    remove({ commit },payload) {
      this.$axios.delete(`/post/${payload.postId}`,{
        withCredentials: true,
      })
        .then(()=>{
          commit('removeMainPost',payload)
        })
        .catch((err)=>{
          console.error(err);
        })
    },
    addComment({ commit },payload) {
      this.$axios.post(`/post/${payload.postId}/comment`,{
        content: payload.content,
      },{
        withCredentials: true
      })
      .then((res)=>{  
        commit('addComment',res.data);
      })
      .catch((err)=>{
        console.error(err);
      });
    },
    loadComments({ commit },payload) {
      this.$axios.get(`/post/${payload.postId}/comments`)
        .then((res)=>{
          commit('loadComments',{
            postId: payload.postId,
            data: res.data,
          });
        })
        .catch((err)=>{
          console.error(err);
        });
    },
    loadPosts: throttle(async function({ commit,state },payload){
        try {
          if(payload && payload.reset) {
            const res = await this.$axios.get(`/posts?limit=10`);
            commit('loadPosts',{
              data: res.data,
              reset: true,
            });
            return;
          }
          if(state.hasMorePost){
            const lastPost = state.mainPosts[state.mainPosts.length-1];
            const res = await this.$axios.get(`/posts?lastId=${lastPost && lastPost.id}&limit=10`);
            commit('loadPosts',{
              data: res.data,
            });
            return;
          } 
        } catch (err) {
          console.error(err);
        }
      },2000),
    loadUserPosts: throttle(async function({ commit,state },payload){
      try {
          if(payload && payload.reset){
            const res = await this.$axios.get(`/user/${payload.userId}/posts?limit=10`);
            commit('loadPosts',{
              data: res.data,
              reset: true,
            });
            return;
          }
          if(state.hasMorePost){
            const lastPost = state.mainPosts[state.mainPosts.length-1];
            const res = await this.$axios.get(`/user/${payload.userId}/posts?lastId=${lastPost && lastPost.id}?limit=10`);
            commit('loadPosts',{
              data: res.data,
            });
            return;
          } 
      }
      catch (err) {
        console.error(err);
      }
    },3000),
    loadHashtagPosts: throttle(async function({ commit,state },payload){
      try {
          if(payload && payload.reset){
            const res = await this.$axios.get(`/hashtag/${payload.hashtag}/posts?limit=10`);
            commit('loadPosts',{
              data: res.data,
              reset: true,
            });
            return;
          }
          if(state.hasMorePost){
            const lastPost = state.mainPosts[state.mainPosts.length - 1];
            const res = await this.$axios.get(`/hashtag/${payload.hashtag}?lastId=${lastPost && lastPost.id}&limit=10`);
            commit('loadPosts',{
              data: res.data,
            });
            return;
          } 
      }
      catch (err) {
        console.error(err);
      }
    },3000),
    uploadImages({ commit },payload) {
      this.$axios.post('/post/images',payload,{
        withCredentials: true,  // 로그인한 사용자 인증 받아야함
      })
      .then((res)=>{
        commit('concatImagePaths',res.data);
      })
      .catch((err)=>{
        console.error(err);
      });
    },
    retweet({ commit },payload){
      this.$axios.post(`/post/${payload.postId}/retweet`,{},{
        withCredentials: true,
      })
      .then((res)=>{
        commit('addMainPost',res.data);
      })
      .catch((err) => {
        console.error(err);
        alert(err.response.data);
      });
    },
    likePost({ commit },payload) {
      this.$axios.post(`/post/${payload.postId}/like`,{},{
        withCredentials: true,
      })
      .then((res)=>{
        commit('likePost',{
          userId: res.data.userId,
          postId: payload.postId,
        });
      })
      .catch((err)=>{
        console.error(err);
      })
    },
    unlikePost({ commit }, payload) {
      // delete는 두번째 인자가 없다!
      this.$axios.delete(`/post/${payload.postId}/like`,{
        withCredentials: true,
      })
      .then((res)=>{
        commit('unlikePost',{
          userId: res.data.userId,
          postId: payload.postId,
        });
      })
      .catch((err)=>{
        console.error(err);
      })
    }
};