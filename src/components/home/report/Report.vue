<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {

  },
  // 当dom元素挂载到页面事触发的钩子
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.querySelector('#main'));

    // 发送请求，获取折线图数据
    const {data : res} = await this.$http.get('reports/type/1')
    console.log(res);
    if (res.meta.status !== 200) return this.$message.error('获取报表失败！')

    // 调用  lodash 下面的 merge 方法将两个对象进行合并
    const result = _.merge(res.data,this.options)

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
}
</script>

<style lang="less" scoped>

</style>