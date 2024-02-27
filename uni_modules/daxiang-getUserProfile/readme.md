# daxiang-getUserProfile
### 简介
微信小程序端对于基础库>=2.27.1的客户端收回了getUserProfile的头像与昵称返回能力，此插件做的事情正是针对这种情况进行的适配。
模仿原生微信弹出界面1：1高度还原，用户感知降到最低。
当基础库<2.27.1时，使用原生的getUserProfile进行授权登录。
否则弹出头像昵称填写的授权框。

### 组件参数
| 属性名		| 类型		|  默认值	| 说明									|
| :----:		| :----:	| :----:		|  :----								|
| logo			| String	|			| 应用LOGO图片，与应用名称一起显示在头部|
| uploadAvatar	| Boolean	| true		|提交时，是否上传头像到云存储			|

### 使用方法
#### 1、引入组件
```vue
<daxiang-getUserProfile ref="getUserProfile" logo="..."></daxiang-getUserProfile>
```
#### 2、调用方法
```javascript
//与 uni.getUserProfile的参数一致
this.$refs.getUserProfile.open({
	desc: '授权登录',
	success: e => resolve(e.userInfo),
	fail: reject
});
```
#### 3、插件依赖了uni-popup组件，请注意项目是否导入
