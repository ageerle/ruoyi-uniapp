<template>
  <view class="login">
    <view class="container">
      <!-- logo -->
      <view class="logo">
        <u-avatar src="/static/logo.png" shape="square" size="100"></u-avatar>
      </view>
      <!-- title -->
      <view class="title">
        <h2>{{ title }}</h2>
      </view>
      <!-- 用户名密码表单 -->
      <view class="form">
        <u--form labelPosition="left" :model="model" ref="loginForm" labelWidth="80">
          <u-form-item label="用户名称" prop="user.username" borderBottom customStyle="margin-bottom: 10px">
            <u--input placeholder="请输入用户名称" v-model="model.user.username" border="none"></u--input>
          </u-form-item>
          <u-form-item label="密码" prop="user.password" borderBottom customStyle="margin: 10px 0">
            <u--input placeholder="请输入密码" v-model="model.user.password" border="none" password clearable>
            </u--input>
          </u-form-item>
        </u--form>
        <u-button type="success" text="登录" customStyle="margin-top: 50px" shape="circle" @click="submit">
        </u-button>
      </view>
      <!-- 脚注功能 -->
<!--      <view class="footer">
        <text class="footer-text" @click="register">账号注册</text>
      </view> -->
    </view>
  </view>
</template>

<script>

export default {
  data() {
    return {
      // 标题
      title: '熊猫助手',
      // 找回密码modal显示与否
      modalShow: false,
      // 找回密码
      retrievePwd:{
        // 用户名
        username:'',
        // 邮箱
        email:''
      },
      model: {
        // 用户对象
        user: {
          username: '',
          password: '',
        },
      },
    }
  },
  onLoad() {

  },
  methods: {
    // 登录提交
	submit() {
		this.$request("/auth/login", "Post", {
			username: this.model.user.username,
			password: this.model.user.password
		}, {
			'content-type': 'application/json'
		}).then((res) => {
				if (res.data.token) {
					// token保存到缓存 跳转到主页
					uni.setStorageSync('userInfo', res.data.userInfo);
					uni.setStorageSync('token', res.data.token)
					console.log("登录成功!", res)
					uni.reLaunch({
						url: '../index/home'
					});
				}
		});
		
	
	},
	
	
    // submit() {
    //   this.$refs.loginForm.validate().then(async res => {
    //     let param = this.model.user
    //     const result = await this.$api.login(param)
    //     if (result.success) {
    //       // 将token存入
    //       const {data} = result
    //       uni.setStorageSync("Access-Token", data.accessToken);
    //       uni.$u.route('/pages/message/message');
    //     }else{
    //       uni.$u.toast(result.message);
    //     }
    //   })
    // },
    // 账号注册
    register() {
      uni.$u.route('/pages/h5/register');
    },
  }
}
</script>

<style lang="scss">
.login {
  .container {
    background: #fff;
    width: 100vw;
    padding-top: 10vh;
    // #ifndef H5
    height: 90vh;
    // endif

    .logo {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      width: 100vw;
    }

    .title {
      text-align: center;
      margin-top: 20px;
    }

    .form {
      padding: 0 30px;
      margin-top: 40px;
    }

    .footer {
      flex-direction: row;
      justify-content: center;
      text-align: center;
      align-items: center;
      margin-top: 40px;

      .footer-text {
        font-size: 14px;
        color: #296db5;
        padding: 15px;
      }
    }
  }
}
</style>
