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
      <el-row>
        <el-button type="primary" @click="addClassify">添加分类</el-button>
      </el-row>
      <!-- 表格区域 -->
      <tree-table :data='cateList' :columns='columns' border 
      :selection-type='false' :expand-type='false' show-index>
      <!-- 是否有效  列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="!scope.row.cat_deleted"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序  列 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag >
        </template>
        <!-- 操作  列 -->
        <template slot="operation" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="classifyCate(scope.row)">编辑</el-button>
          <el-button type="warning" icon="el-icon-delete-solid" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addClassifyDialogVisible" width="50%" @close='addCateDialog'>
      <el-form :model="addClassifyData" :rules="addClassifyDataRules" ref="addClassifyDataRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addClassifyData.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentClassifyList"
            @change="handleChange" :props="cascaderProps" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClassifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="classifyCateDialogVisible" width="50%" @close='classifyCateOut'>
      <el-form :model="ClassifyCateData" :rules="addClassifyDataRules" ref="ClassifyCateDataRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="ClassifyCateData.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="classifyCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="classifyCateConfirm">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存储请求参数
      queryInfo : {
        type : 3,
        pagenum : 1,
        pagesize : 5
      },
      // 存储商品分类列表数据
      cateList : [],
      // 总数据条数
      total : 0,
      // 为 table 指定列的定义规则
      columns : [{
        label : '分类名称',
        prop : 'cat_name'
      },{
        // table 标签名称
        label : '是否有效',
        // 当前定义列的模板
        type : 'template',
        // 当前定义列的模板的名称
        template : 'isok'
      },{
        // table 标签名称
        label : '排序',
        // 当前定义列的模板
        type : 'template',
        // 当前定义列的模板的名称
        template : 'sort'
      },{
        // table 标签名称
        label : '操作',
        // 当前定义列的模板
        type : 'template',
        // 当前定义列的模板的名称
        template : 'operation'
      }],
      // 控制分类对话框显示隐藏
      addClassifyDialogVisible : false,
      // 添加分类的数据
      addClassifyData : {
        cat_name : '',
        // 分类父 ID  默认为 1 级父分类
        cat_pid : 0,
        // 分类层级  默认为 1 级分类
        cat_level : 0
      },
      // 分类验证规则
      addClassifyDataRules : {
        cat_name : [
          { required: true, message: '请填写分类名称', trigger: 'blur' }
        ]
      },
      // 存储 所有父级分类列表数据
      parentClassifyList : [],
      cascaderProps : {
        value : 'cat_id',
        label : 'cat_name',
        children : 'children',
        expandTrigger: 'hover',
        checkStrictly : true
      },
      selectedKeys : [],
      // 控制编辑分类对话框显示与隐藏
      classifyCateDialogVisible : false,
      // 用于存储当前编辑的用户信息
      ClassifyCateData : {}
    }
  },
  created() {
    this.getCateAllData()
  },  
  methods : {
    async getCateAllData() {
      // 获取商品分类列表数据
      const {data : res} = await this.$http.get('categories',{ params : this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败！')
      // 把数据列表破数据赋值给 data 中存储数据列表破数据的 cateList
      this.cateList = res.data.result
      // 把数据总条数赋值给 data 中存储数据总条数的 total
      this.total = res.data.total
    },
    // 监听，每页显示的数据条数发送改变时
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateAllData()
    },  
    // 当页码发生改变的时候触发
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateAllData()
    },
    // 添加分类
    addClassify() {
      // 先查询所有的父级分类
      this.getClassifyAll()
      // 再显示添加分类对话框
      this.addClassifyDialogVisible = true
    },
    // 获取所有的一级分类和二级分类
    async getClassifyAll() {
      const {data : res} = await this.$http.get('categories',{ params : {type : 2}})
      if (res.meta.status !== 200) return this.$message.error('获取分类列表数据失败！')
      this.parentClassifyList = res.data
    },
    handleChange() {
      console.log(this.selectedKeys);
      // 如果 this.selectedKeys 的length 大于 0 就证明选择了父级分类
      // 否则，就没有选择父级分类
      if (this.selectedKeys.length > 0) {
        // 获取数组当中的最后一个元素，这个元素，就是当前添加分类的父级分类
        this.addClassifyData.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值  如果选择了父级就是 1 如果选择了两个父级 那么等级就是 2
        this.addClassifyData.cat_level = this.selectedKeys.length
      } else {
        this.addClassify.cat_pid = 0
        this.addClassify.cat_level = 0
      }
    },
    addCate() {
      this.$refs.addClassifyDataRef.validate(async valid => {
        if (!valid) return
        const {data : res} = await this.$http.post('categories',this.addClassifyData)
        if (res.meta.status !== 201) return this.$message.error('分类列表创建失败！')
        this.getCateAllData()
        this.addClassifyDialogVisible = false
        this.$message.success('创建分类列表成功！')
      })
    },
    // 监听对话框关闭事件
    addCateDialog() {
      // 清空表单数据
      this.$refs.addClassifyDataRef.resetFields()
      // 清空下拉框选项数据
      this.selectedKeys = []
      // 将输入框表单数据清空
      this.addClassifyData.cat_pid = 0
      this.addClassifyData.cat_level = 0

    },
    // 监听删除按钮的点击
    async removeCate(id) {
      const isRemoveCate = await this.$confirm('此操作将永久删除该分类列表, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (isRemoveCate !== 'confirm') return this.$message.info('取消了本次删除请求！')
      const {data : res} = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('本次删除分类列表错误！')
      this.$message.success('分类列表删除成功！')
      this.getCateAllData()
    },
    // 监听编辑按钮的点击
    async classifyCate(cate) {
      const {data : res} = await this.$http.get('categories/' + cate.cat_id)
      if (res.meta.status !== 200) return this.$message.error('获取分类列表数据失败！')
      this.ClassifyCateData = res.data
      this.classifyCateDialogVisible = true
    },
    // 监听修改分类对话框关闭事件
    classifyCateOut() {
      // 将表单输入框，还原到最初
      this.$refs.ClassifyCateDataRef.resetFields()
    },
    // 提交修改
    async classifyCateConfirm() {
      const id = this.ClassifyCateData.cat_id
      const {data : res} = await this.$http.put(`categories/${id}`, this.ClassifyCateData)
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('修改分类列表失败！')
      this.$message.success('修改分类列表成功！')
      this.ClassifyCateData = {}
      this.getCateAllData()
      this.classifyCateDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    margin-bottom: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>