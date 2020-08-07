export const state = () => ({
  mainPosts: [],
  hasMorePost: true,
  imagePaths: [],
});

const totalPosts = 51;
const limit = 10;

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
    state.mainPosts[index].Comments = payload;
  },
  loadPosts(state,payload){
    if(payload.reset){
      state.mainPosts = payload.data;
    } else {
      state.mainPosts = state.mainPosts.concat(payload);
    }
    state.hasMorePost = payload.length === limit;
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
        console.log(res.data);
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
    },
    addComment({ commit, state },payload) {
      console.log('postId: ',payload);
      // console.log(state.mainPosts);
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
    loadPosts({ commit,state },payload){
      if(state.hasMorePost){
        this.$axios.get(`/posts?offset=${state.mainPosts.length}?limit=10`)
          .then((res)=>{
            commit('loadPosts',res.data);
          })
          .catch((err)=>{
            console.error(err);
          });
      }
    },
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