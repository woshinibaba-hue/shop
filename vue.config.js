module.exports = {
	chainWebpack: config => {
		// 发布阶段
		config.when(process.env.NODE_ENV === 'production', config => {
			// entry 找到默认的打包入口  clear 删除默认的打包入口    add 添加默认打包入口
			config
				.entry('app')
				.clear()
				.add('./src/main-prod.js')

			//使用externals设置排除项
			// 这样 里面的所有文件，就不会被打包到项目当中，就可以使最终打包出来的项目体积变小
			config.set('externals', {
				vue: 'Vue',
				'vue-router': 'vue-router',
				axios: 'axios',
				lodash: '_',
				echarts: 'echarts',
				nprogress: 'NProgress',
				'vue-quill-editor': 'VueQuillEditor'
			})

			config.plugin('html').tap(args => {
				args[0].isProd = true
				return args
			})
		})

		// 开发阶段
		config.when(process.env.NODE_ENV === 'development', config => {
			config
				.entry('app')
				.clear()
				.add('./src/main-dev.js')

			config.plugin('html').tap(args => {
				args[0].isProd = false
				return args
			})
		})
	}
}
