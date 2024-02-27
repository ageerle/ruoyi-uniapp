<template>
	<view class="">
		<uni-popup type="bottom" ref="model">
			<view class="getUserProfile">
				<view class="head">
					<image v-if="logo" class="logo" :src="logo"></image>
					<view class="desc">{{ sysInfo.appName }} 申请</view>
				</view>
				<view class="title">完善你的昵称、头像</view>
				<form @submit="onSubmit(true, $event)">
					<view class="form-item">
						<view class="label">头像</view>
						<button name="avatarUrl" class="auto primary" :class="{ noBg: formData.avatarUrl }"
							style="padding: 10rpx 20rpx;" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
							<text v-if="!formData.avatarUrl">授权头像</text>
							<image class="avatar" v-else :src="formData.avatarUrl"></image>
						</button>
					</view>
					<view class="form-item">
						<view class="label">昵称</view>
						<input name="nickName" type="nickname" placeholder="请填写昵称" class="ipt"
							v-model="formData.nickName" />
					</view>
					<view class="foot">
						<button @click="onSubmit(false)">取消</button>
						<button class="primary" form-type="submit">确定</button>
					</view>
				</form>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		name: 'daxiang-getUserProfile',
		data() {
			return {
				userInfoKey: 'daxiang-getUserProfile-1.0',
				sysInfo: {},
				formData: {
					nickName: '',
					avatarUrl: ''
				},
				options: {}
			};
		},
		created() {
			this.sysInfo = uni.getSystemInfoSync();
		},
		props: {
			logo: String,
			// 是否上传头像
			uploadAvatar: {
				type: Boolean,
				default: true
			}
		},
		methods: {
			open(options) {
				return new Promise((resolve, reject) => {
					let canIUse = true;
					// #ifdef MP-WEIXIN
					let {
						SDKVersion
					} = this.sysInfo;
					console.log('SDKVersion: ', SDKVersion);
					canIUse = this.compareVersion('2.27.1', SDKVersion) == 1;
					// #endif
					console.log('canIUse: ', canIUse);
					if (canIUse) {
						uni.getUserProfile({
							...options
						});
					} else {
						let userInfo = uni.getStorageSync(this.userInfoKey);
						try {
							if (userInfo) {
								this.checkForm(userInfo);
								this.options.success && this.options.success({
									userInfo
								});
							} else {
								throw Error('');
							}
						} catch (e) {
							this.$refs.model.open();
							this.options = options;
						}
					}
				});
			},
			checkForm(data) {
				if (!data.avatarUrl) {
					throw Error('请授权头像');
				}
				if (!data.nickName) {
					throw Error('昵称不能为空');
				}
			},
			async onSubmit(confirm, event) {
				if (confirm) {
					try {
						console.log('this.formData: ', this.formData);
						let {
							nickName
						} = event.detail.value;
						this.checkForm({
							avatarUrl: this.formData.avatarUrl,
							nickName
						});
						this.formData.nickName = nickName;
					} catch (e) {
						//TODO handle the exception
						uni.showToast({
							icon: 'none',
							title: e.message
						});
						return;
					}
					// if (this.uploadAvatar) {
					// 	this.formData.avatarUrl = await this.uploadImage(this.formData.avatarUrl);
					// }
					console.log('this.options: ', this.options);
					// uni.setStorageSync(this.userInfoKey, this.formData);
					this.options.success && this.options.success({
						userInfo: this.formData
					});
				} else {
					this.options.fail && this.options.fail(Error('用户点击取消'));
				}
				this.$refs.model.close();
			},
			uploadImage(url) {
				return new Promise((resolve, reject) => {
					if (!this.isLocalFile(url)) {
						return resolve(url);
					}
					let ranNum = this.getRanNum(1000, 9999);
					uni.showLoading({
						mask: true
					});
					uniCloud.uploadFile({
						cloudPath: `avatar/${Date.now()}_${ranNum}.jpg`,
						filePath: url,
						success(e) {
							resolve(e.fileID);
						},
						fail: reject,
						complete: uni.hideLoading
					});
				});
			},
			isLocalFile(url) {
				/** 是否是base64本地地址 */
				const isBaseUrl = str => {
					return /^\s*data:(?:[a-z]+\/[\d+.a-z-]+(?:;[a-z-]+=[\da-z-]+)?)?(?:;base64)?,([\s\w!$%&'()*+,./:;=?@~-]*?)\s*$/i
						.test(str);
				};
				/** 是否是小程序本地地址 */
				const isTmpUrl = str => {
					return /http:\/\/temp\/wx/.test(str);
				};
				/** 是否是网络地址 */
				const isNetworkUrl = str => {
					return /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w#%&+,./:=?@^~-]*[\w#%&+/=?@^~-])?$/.test(str);
				};
				return isBaseUrl(url) || isTmpUrl(url) || !isNetworkUrl(url);
			},
			getRanNum(min, max, fixedNum = 0, func = 'round') {
				return Math[func]((Math.random() * (max - min) + min) * 10 ** fixedNum) / 10 ** fixedNum;
			},
			onChooseAvatar(e) {
				this.formData.avatarUrl = e.detail.avatarUrl;
			},
			compareVersion(v1, v2) {
				v1 = v1.split('.');
				v2 = v2.split('.');
				const len = Math.max(v1.length, v2.length);

				while (v1.length < len) {
					v1.push('0');
				}
				while (v2.length < len) {
					v2.push('0');
				}

				for (let i = 0; i < len; i++) {
					const num1 = parseInt(v1[i]);
					const num2 = parseInt(v2[i]);

					if (num1 > num2) {
						return 1;
					} else if (num1 < num2) {
						return -1;
					}
				}

				return 0;
			}
		}
	};
</script>

<style scoped lang="scss">
	.getUserProfile {
		background-color: #ededed;
		border-radius: 10rpx 10rpx 0 0;
		padding: 52rpx 32rpx;
		font-size: 26rpx;
		color: #333;

		.head {
			display: flex;
			align-items: center;
			margin-bottom: 54rpx;

			.logo {
				--size: 40rpx;
				width: var(--size);
				height: var(--size);
				border-radius: 50%;
				margin-right: 16rpx;
			}
		}

		.title {
			font-size: 28rpx;
			margin-bottom: 26rpx;
		}

		.form-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 80rpx;
			border: 0 solid #e5e5e5;
			border-bottom-width: 1px;
			font-size: 24rpx;

			&:first-child {
				border-top-width: 1px;
			}

			.label {
				color: #666;
			}

			.ipt {
				font-size: 28rpx;
				background: #e5e5e5;
				height: 80%;
				text-align: right;
				padding: 0 30rpx;
			}
		}

		.avatar {
			--size: 60rpx;
			width: var(--size);
			height: var(--size);
			border-radius: 10rpx;
		}

		button {
			background: #fff;
			box-shadow: 0 0 1px 2px #eee;
			width: 180rpx;
			height: 60rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0;
			font-size: 24rpx;
			$color: #07c160;
			color: $color;

			&+button {
				margin-left: 30rpx;
			}

			&.noBg {
				background: none;
				padding: 0 !important;
			}

			&.auto {
				width: auto;
				height: auto;
				padding: 12rpx 20rpx;
			}

			&.primary {
				background-color: $color;
				color: #fff;
			}
		}

		.foot {
			display: flex;
			justify-content: center;
			padding-top: 48rpx;
		}
	}
</style>
