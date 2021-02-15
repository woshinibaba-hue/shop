<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-input placeholder="请输入内容" class="input-with-select" v-model="SearchContent">
        <el-button slot="append" icon="el-icon-search" @click="SearchOrder"></el-button>
      </el-input>
      <!-- 订单表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="序号" width="80px"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="248px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="warning" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" title="修改地址" @click="cityVisible"></el-button>
            <el-button type="warning" icon="el-icon-truck" size="mini" title="查看物流" @click="logVisibleOut"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageunm"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
        <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="cityDialogVisible" width="50%" @close='cityDialogVisibleOut'>
      <el-form :model="cityForm" :rules="cityRules" ref="cityFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="cityData1">
          <el-cascader
            v-model="cityForm.cityData1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="cityData2">
          <el-input v-model="cityForm.cityData2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cityDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cityDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看物流对话框 -->
    <el-dialog title="查看物流" :visible.sync="logVisible" width="50%">
      <span>空空如也</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  data() {
    return {
      // 查询参数
      queryInfo : {
        // 查询参数
        query : '',
        // 当前页码
        pagenum : 1,
        // 每页显示的数据条数
        pagesize : 5
      },
      // 用于存放订单列表数据
      orderList : [],
      // 总数据条数
      total : 0,
      // 搜索内容
      SearchContent : '',
      // 省市联动数据
      cityData,
      // 控制修改地址对话框显示隐藏
      cityDialogVisible : false,
      // 省市区的选择数据
      cityForm : {
        cityData1 : [],
        cityData2 : ''
      },
      // 省市区的验证规则
      cityRules : {
        cityData1 : [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        cityData2 : [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 控制查看物流对话框显示隐藏
      logVisible : false
    }
  },
  created() {
    this.getOrderList()
  },
  methods : {
    async getOrderList() {
      const {data : res} = await this.$http.get('orders',{params : this.queryInfo})
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取订单列表数据失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 当页面显示的总条数发送变化时触发  
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 当页码数发送变化时触发
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 搜索
    SearchOrder() {
      this.queryInfo.query = this.SearchContent
      this.getOrderList()
    },
    cityVisible() {
      this.cityDialogVisible = true
    },
    // 监听省市区对话框关闭事件
    cityDialogVisibleOut() {
      this.$refs.cityFormRef.resetFields()
      this.cityForm.cityData1 = []
    },
    async logVisibleOut() {
      this.logVisible = true
    }
  }
} 
</script>

<style lang="less" scoped>
  .el-input {
    width: 300px;
  }
</style>