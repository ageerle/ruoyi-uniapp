<script>
import {
  mapState,
  mapMutations
} from 'vuex'
export default {
  // methods: {
  //   async init() {
  //     this.$request('/api/Baseconfig/getInfo').then(res => {
  //       console.log(res)
  //       this.$store.commit('setConfig', res)
  //     }).catch(err => {
  //       this.$request('/api/Baseconfig/getInfo').then(res => {
  //         console.log(res)
  //         this.$store.commit('setConfig', res)
  //       })
  //     })
  //     var userInfo = uni.getStorageSync('userInfo');
  //     if (userInfo) {
  //       await this.login(userInfo);
  //       this.$request('/api/Member/checkNum', 'POST').then(res => {
  //         userInfo.num = res.data.num // 更新数量
  //         this.syncUserInfo(userInfo)
  //       })
  //     } else {
  //       // #ifdef H5
  //       if (/MicroMessenger/i.test(navigator.userAgent) && this.$store.state.config.wxGzhLogin == 1) {
  //         const launchOptions = uni.getLaunchOptionsSync()
  //         const query = launchOptions.query
  //         const token = query.token
  //         console.log('url中的token参数：', token)
  //         if (token) {
  //           this.$store.commit('wxH5SetToken', token);
  //           this.$nextTick(() => {
  //             // 通过token获取用户信息
  //             this.$request('/api/Member/getUserInfo', 'POST').then(res => {
  //               console.log(res)
  //               if (res.status == 200) {
  //                 let uInfo = res.data;
  //                 uInfo.token = token;
  //                 this.syncUserInfo(uInfo)
  //                 uni.setStorageSync('userInfo', uInfo)
  //                 uni.setStorageSync('token', token)
  //               }
  //             })
  //           })
  //         } else {
  //           let rurl = 'https://xxxxx.xxxxxxx.cn/api/Member/wxH5Login'; // 此处修改为服务端回调接口
  //           // 替换url参数中的appid
  //           let url =
  //             "https://open.weixin.qq.com/connect/oauth2/authorize?appid=xxxxxxxxxx&redirect_uri=" +
  //             rurl +
  //             "&response_type=code&scope=snsapi_userinfo&state=123&connect_redirect=1#wechat_redirect"
  //           window.location.href = url;
  //         }
  //       }
  //       // #endif
  //     }
  //   },
  //   ...mapMutations(['login', 'syncUserInfo'])
  // },
  onLaunch: function () {
    console.log('App Launch')
    // this.init()
    // /* #ifdef H5 */
    // // 接入百度统计
    // var bp = document.createElement('script');
    // var curProtocol = window.location.protocol.split(':')[0];
    // if (curProtocol === 'https') {
    //   bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    // } else {
    //   bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    // }
    // var s = document.getElementsByTagName("script")[0];
    // s.parentNode.insertBefore(bp, s);
    // /* #endif */
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/*每个页面公共css */
@import url("./static/style/icon.css");
</style>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uview-ui/index.scss";

.pix_box {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
}

.one {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.two {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pdg {
  width: fit-content;
}

.a {
  position: relative;
}

.a image {
  position: absolute;
  width: 100%;
  height: 100%;
}

.showt {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.showt_box {
  width: 520rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.showt_title {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
  padding: 60rpx 30rpx;
  text-align: center;
  margin: auto;
}

.showt_btn {
  width: 100%;
  height: 88rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.showt_btn view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 500;
}

.showt_btnl {
  color: #999999;
  border-right: 1rpx solid rgba(0, 0, 0, 0.12);
  margin-left: -1rpx;
}

.custom {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100000;
}

.custom_box {
  width: 520rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
}

.custom_title {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
  padding: 60rpx 30rpx;
  line-height: 42rpx;
  text-align: center;
}

.custom_btn {
  width: 100%;
  height: 88rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom_btn view {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 500;
}

.custom_btn_l {
  color: #999999;
  margin-left: -1rpx;
  border-right: 1rpx solid rgba(0, 0, 0, 0.12);
}

.custom_btn_r {
  color: #23A0F0;
}
</style>
