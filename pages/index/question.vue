<template>
  <view>
    <view class="directask">
      <view class="askaquestion flex align-center justify-between">
        <view class="">🔥热门提问</view>
        <view @click="getRandomQuestion" class="refresh flex align-center">换一换<u-icon name="reload"></u-icon></view>
      </view>
      <view v-for="item in hot_question" :key="item.hotquestion_id" @click="prompt = item.content" class="case">
        {{ item.content }} </view>
      <view class="askaquestion u-flex align-center">📝直接提问</view>
      <view class="textarea">
        <u--textarea v-model="prompt" placeholder="您可以向AI提出任何问题..." :adjustPosition="false" border="none"></u--textarea>
        <view class="flex justify-end">
          <button @click="paset" class="cu-btn line-gray">粘贴</button>
          <view class="padding-lr-xs"></view>
          <button @click="submit" class="cu-btn line-orange">提交问题</button>
        </view>
      </view>
      <view class="askaquestion flex align-center">🤖AI解答<view class="padding-lr-xs"></view><u-icon
          v-if="answerStatus == 2" @click="submit" name="reload"></u-icon></view>
      <view class="anser-area">
        <zero-markdown-view style="padding: 0;" :markdown="answer"></zero-markdown-view>
      </view>
      <view v-if="answerStatus == 2" class="flex justify-center">
        <!-- <button class="cu-btn line-gray">继续</button>
				<view class="padding-lr-xs"></view> -->
        <button @click="copy" class="cu-btn line-orange">复制回答</button>
      </view>
    </view>
    <m-tabbar fixed fill :current="0" :tabbar="tabbar"></m-tabbar>
  </view>
</template>

<script>
import {
  mapState
} from 'vuex'
import setting from "@/common/config";
// #ifdef H5
import axios from 'axios'
// #endif
const defaultAnswer = '每次最多输出500中文字符，如需更多字符请点击继续。'
const answerIng = 'AI组织语言中，请等待...'
export default {
  data() {
    return {
      hot_question: [],
      answer: defaultAnswer,
      answerStatus: 0, // 0 是默认状态，1是生成中，2是已生成
      prompt: ""
    }
  },
  computed: {
    ...mapState(['tabbar'])
  },
  onLoad() {
    console.log('log')
    // #ifdef MP-WEIXIN || MP-JD
    uni.hideHomeButton()
    // #endif
    this.getRandomQuestion()
    let that = this;
    let pong = '';
    let userInfo = uni.getStorageSync('userInfo')
    uni.connectSocket({
      url: setting.ws
    });
    uni.onSocketOpen(function (res) {
      console.log('question页WebSocket连接已打开！');
      // 绑定UID
      sendMsg({
        type: 'login',
        uid: userInfo.member_id
        // uid: 3
      })
      // 设置心跳包
      pong = setInterval(() => {
        sendMsg({
          type: 'pong'
        })
      }, 20 * 1000);

    });
    uni.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！');
    });
    uni.onSocketMessage(function (res) {
      // console.log('收到服务器内容：' + res.data);
      let json = JSON.parse(res.data)
      // console.log(json)
      if (json.hasOwnProperty('id')) {
        if (that.answerStatus != 1) {
          that.answer = ""
          that.answerStatus = 1;
        }
        that.typeingId = json.id
        if (!json.choices[0].delta.finish_reason) {
          if (json.choices[0].delta.hasOwnProperty('content')) {
            that.answer += json.choices[0].delta.content
            // 此处自行斟酌是否替换
            // that.typeingText = that.typeingText.replace(/[cogptn]+/ig, "ChatGLM-6B")
          }
        }
      }

    });
    // socket断开时通知后端改变登录状态
    uni.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！');
    });
    //上文中的sendMsg原型
    const sendMsg = function (data) {
      uni.sendSocketMessage({
        data: JSON.stringify(data)
      })
    }
  },
  onUnload() {
    uni.closeSocket()
  },
  methods: {
    getRandomQuestion() {
      this.$request('/api/HotQuestion/index').then(res => {
        console.log(res)
        this.hot_question = res.data
      })
    },
    submit() {
      if (!this.prompt) {
        this.$failToast("请输入内容");
        return;
      }

      this.answer = answerIng;
      this.sub()
    },
    sub(message) {
      // 条件编译处理，h5端uni.request与socket会互相阻塞
      // #ifndef H5
      this.$request("/api/Message/completions", "POST", {
        message: this.prompt,
      }).then((res) => {
        console.log(res);
        if (res.status == 200) {
          this.answerStatus = 2;
          this.answer = res.data
          this.$store.commit('useNum', 1);
          this.$nextTick(() => {
            uni.pageScrollTo({
              scrollTop: 20000,
              duration: 100
            });
          });
        } else if (res.status == 901) {
          this.loading = false;
          this.$failToast('服务器繁忙，请稍后再试');
        } else if (res.status == 411) {
          this.loading = false;
          uni.showModal({
            content: res.msg
          })
        } else {
          this.loading = false;
          this.$failToast(res.msg);
        }
      }).catch(err => {
        console.log(err)
        this.loading = false;
        this.$failToast(err.errMsg);
      })
      // #endif
      // #ifdef H5
      axios({
        method: 'post',
        url: setting.base_url + "/api/Message/completions",
        data: {
          message: this.prompt,
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Authorization': this.$store.state.token
        }
      }).then(response => {
        console.log(response)
        let res = response.data
        if (res.status == 200) {
          this.answerStatus = 2;
          this.answer = res.data
          this.$store.commit('useNum', 1);
          this.$nextTick(() => {
            uni.pageScrollTo({
              scrollTop: 20000,
              duration: 100
            });
          });
        } else if (res.status == 901) {
          this.loading = false;
          this.$failToast('服务器繁忙，请稍后再试');
        } else if (res.status == 411) {
          this.loading = false;
          uni.showModal({
            content: res.msg
          })
        } else {
          this.loading = false;
          this.$failToast(res.msg);
        }
      }).catch(error => {
        // reject(error);
      });
      // #endif
    },
    paset() {
      uni.getClipboardData({
        success: (res) => {
          console.log(res);
          this.prompt = res.data
        }
      });
    },
    copy() {
      uni.setClipboardData({
        data: this.answer,
        success() {
          uni.showModal({
            title: '提示',
            content: '内容已复制到系统剪贴板'
          })
        }
      })
    }
  }
}
</script>

<style>
@import url("@/static/style/color-ui.css");

.directask {
  padding: 15px 15px 100px;
  border-top: 1px solid #ededed;
}

.directask .askaquestion {
  font-size: 16px;
  margin-bottom: 12px;
}

.textarea {
  box-shadow: 0 0 10px 5px hsla(0, 0%, 62%, .21176470588235294);
  margin-top: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  padding: 10px 15px 15px 6px;
}

.anser-area {
  box-shadow: 0 0 10px 5px hsla(0, 0%, 62%, .21176470588235294);
  margin-top: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  padding: 10px;
  min-height: 120px;
}

.directask .askaquestion {
  font-size: 16px;
  margin-bottom: 12px;
}

.refresh {
  color: rgb(158, 158, 158);
  margin-right: 5px;
}

.case {
  color: #26b3a0;
  background: #f5f8f7;
  width: 100%;
  height: 40px;
  line-height: 40px;
  font-size: 15px;
  padding-left: 15px;
  border-radius: 5px;
  margin: 12px 0;
  border-radius: 5px;
  overflow: hidden;
  display: -webkit-box !important;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical !important;
}
</style>
