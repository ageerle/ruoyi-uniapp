<template>
	<view>
		<view v-if="content" style="padding: 30rpx;">
			<u-parse :content="content" :lazyLoad="true"></u-parse>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				content: "",
				title: ""
			}
		},
		onLoad(op) {
			if (op.content_id) {
				this.$request('/api/Content/detail', 'POST', {
					content_id: op.content_id
				}).then(res => {
					console.log(res)
					this.content = res.data.content
					if (res.data.title) {
						this.title = res.data.title
						uni.setNavigationBarTitle({
							title: res.data.title
						})
					}
				})
			}
		},
		onShareAppMessage() {
			return {
				title: this.title
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
