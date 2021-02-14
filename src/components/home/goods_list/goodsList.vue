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
      <!-- 搜索栏和添加按钮区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getGoodsLisr'>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsLisr"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-plus" @click="goAddGoods">添加</el-button>
        </el-col>
      </el-row>
      <!-- 展示商品列表区域 -->
      <el-table :data="goodsList" border stripe style="height:100%">
        <el-table-column type="index" label="序号" width="60px"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="75px"></el-table-column>
        <el-table-column prop="add_time" label="添加时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click=""></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleGoodsSizeChange"
        @current-change="handleGoodsCurrentChange"
        :page-sizes="[5, 10, 15, 20]"
        :page-size= queryInfo.pagesize
        layout="total, sizes, prev, pager, next, jumper"
        :total = total background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数
      queryInfo : {
        query : '',
        // 当前的页码
        pagenum : 1,
        // 每页显示的数据条数
        pagesize : 5
      },
      // 数据总条数
      total : 0,
      // 商品分类列表数据
      goodsList : [] 
    }
  },
  created() {
    this.getGoodsLisr()
  },
  methods : {
    // 获取商品列表数据
    async getGoodsLisr() {
      const {data : res} = await this.$http.get('goods', {params : this.queryInfo})
      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示的总条数
    handleGoodsSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsLisr()
    },
    // 当页码发生改变的时候
    handleGoodsCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize
      this.getGoodsLisr()
    },
    // 删除商品
    removeGoods(row) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete('goods/' + row.goods_id)
        if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
        this.$message.success('删除商品成功！')
        this.getGoodsLisr()
      }).catch(() => this.$message.info('用户取消的删除商品操作！'))
    },
    // 跳转添加商品页面
    goAddGoods() {
      this.$router.push('/addGoods')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table {
    font-size:12px ;
  }
</style>