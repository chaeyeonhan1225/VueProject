// state만 함수이고, 나머지는 객체
export const state = () => ({
    me: null,
    followerList: [],
    followingList: [],
    hasMoreFollower: true,
    hasMoreFollowing: true,
});

const totalFollowers = 8;
const totalFollowings = 6;
const limit = 3;

// mutations은 비동기 작업이 있으면 안된다.
// state를 바꾼다.
export const mutations = {
    setMe(state,payload) {
        state.me = payload;
    },
    changeNickname(state,payload){
        state.me.nickname = payload.nickname;
    },
    addFollowing(state,payload){
        state.followingList.push(payload.nickname);
    },
    addFollower(state,payload){
        state.followerList.push(payload.nickname);
    },
    removeFollowing(state,payload){
        const index = state.followingList.findIndex(v => v.id === payload.id);
        state.followingList.splice(index,1);
    },
    removeFollower(state,payload){
        const index = state.followerList.findIndex(v => v.id === payload.id);
        state.followerList.splice(index,1);
    },
    loadFollowings(state){
        const diff = totalFollowings - state.followingList.length;
        const fakeUsers = Array(diff > limit ? limit : diff).fill().map(v => ({
            id: Math.random().toString(),
            nickname: Math.floor(Math.random() * 1000),
        }));
        state.followingList = state.followingList.concat(fakeUsers);
        state.hasMoreFollowing = fakeUsers.length == limit;
    },
    loadFollowers(state){
        const diff = totalFollowers - state.followerList.length;
        const fakeUsers = Array(diff > limit ? limit : diff).fill().map(v => ({
            id: Math.random().toString(),
            nickname: Math.floor(Math.random() * 1000),
        }));
        state.followerList = state.followerList.concat(fakeUsers);
        state.hasMoreFollower = fakeUsers.length == limit;
    }
};

// 비동기적 작업
export const actions = {
    loadUser({ commit }) {
        this.$axios.get('/user',{
            withCredentials: true,
        })
        .then((res)=>{
            commit('setMe',res.data);
        })
        .catch((err)=>{
            console.error(err);
        });
    },
    signUp({ commit,state }, payload) {
        // console.log(context);
        // 서버에 회원가입 요청을 보내는 부분
        this.$axios.post('/user',{
            email: payload.email,
            password: payload.passwd,
            nickname: payload.nickname
        },{
            withCredentials: true
        })
        .then((res)=>{
            console.log(res.data);
            commit('setMe',res.data);
        },{
            withCredentials: true
        })
        .catch((err)=>{
            console.error(err);
        });  // REST API
    },
    logIn({ commit }, payload) {
        this.$axios.post('/user/login',{
            email: payload.email,
            password: payload.password,
        },{
            withCredentials: true
        })
        .then((res)=>{
            console.log(res.data);
            commit('setMe',res.data);
        })
        .catch((err)=>{
            console.error(err);
        });
    },
    logOut({ commit },payload) {
        this.$axios.post('/user/logout',{},{
            withCredentials: true,
        })
        .then((res)=>{
            commit('setMe',null);
        })
        .catch((err)=>{
            console.error(err);
        });
    },
    changeNickname({ commit },payload){
        commit('changeNickname',payload);
    },
    addFollowing({ commit },payload) {
        commit('addFollowing',payload);
    },
    addFollower({ commit },payload) {
        commit('addFollower',payload);
    },
    removeFollowing({ commit },payload){
        commit('removeFollowing',payload);
    },
    removeFollower({ commit },payload){
        commit('removeFollower',payload);
    },
    loadFollowers({ commit,state },payload){
        if(state.hasMoreFollower) {
            commit("loadFollowers");
        }
    },
    loadFollowings({ commit,state },payload){
        if(state.hasMoreFollowing) {
            commit("loadFollowings");
        }
    }
}
