<template>
	<view>
		<uni-section title="使用指南" type="line">
			<uni-list>
				<uni-list-item v-for="item in contentList" :key="item.content_id" showArrow :title="item.title"
					rightText="查看详情" :note="$u.timeFormat(item.create_time*1000, 'yyyy-mm-dd')" :to="'./content?content_id=' + item.content_id" />
			</uni-list>
		</uni-section>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				contentList: []
			}
		},
		onLoad() {
			this.$request('/api/Content/index', 'POST', {
				type: 3,
				sort: 'content_id',
				order: 'asc',
				status: 1
			}).then(res => {
				console.log(res)
				this.contentList = res.data.data
			})
		},
		methods: {

		}
	}
</script>

<style>

</style>
