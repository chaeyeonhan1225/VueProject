export const state = () => ({});

export const mutations = () => ({});

export const actions = {
    nuxtServerInit({ commit, dispatch, state },{ req }) {
        return dispatch('users/loadUser');  // 비동기 promise는 return 붙여주는게 좋다.
    },
};

