<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 内容部分 -->
    <el-card>
      <el-table :data="rigthsList" stripe border>
        <el-table-column type="index" label='序号' width="180px"></el-table-column>
        <el-table-column label='权限名称' prop="authName"></el-table-column>
        <el-table-column label='路径' prop="path"></el-table-column>
        <el-table-column label='权限等级' prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">等级一</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">等级二</el-tag>
            <el-tag type="warning" v-else>等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用于保存权限列表数据
      rigthsList : []
    }
  },
  async created() {
    let {data : res} = await this.$http.get('rights/list')
    if (res.meta.status !== 200) return this.$message.error('权限列表数据获取失败!')
    this.rigthsList = res.data
  }
}
</script>

<style lang="less" scoped>

</style>