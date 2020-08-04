export default function({ store, redirect }) {
    if(store.state.users.me){   // 로그인 했으면
      redirect('/');    // 메인 페이지로
    }
}