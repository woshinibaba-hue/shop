<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert :closable='false' title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
      <el-row>
        选择商品分类:
          <el-cascader v-model="selectedKeys" :options="goodsCate" :props="cascaderProps"
           @change="cateHandleChange"></el-cascader>
      </el-row>
      <!-- tabs 页区域内容 -->
      <el-tabs v-model="activeName" @tab-click="handleParamsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled='isBtnShow' type="primary"  @click="addMany">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border>
            <el-table-column type="expand" label="展开" width="80px">
              <!-- 展开项 -->
              <template slot-scope="scope">
                <!-- 循环渲染出来的 tag 标签 -->
                <el-tag @close='removeTag(index,scope.row)'  closable v-for="(item,index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                <!-- input 输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="80px"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editBtn(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeBtn(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled='isBtnShow' type="primary"  @click="addOnly">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyData" border>
            <el-table-column type="expand" label="展开" width="80px">
              <!-- 展开项 -->
              <template slot-scope="scope">
                <!-- 循环渲染出来的 tag 标签 -->
                <el-tag @close='removeTag(index,scope.row)'  closable v-for="(item,index) in scope.row.attr_vals" :key="index">{{item}}</el-tag>
                <!-- input 输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="80px"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope"> 
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editBtn(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeBtn(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性和参数对话框 -->
    <el-dialog :title="'添加' + TitleText" :visible.sync="paramsDialogVisible" width="50%" @close='addDiaglogVisible'>
      <el-form :model="addData" :rules="addDataRules" ref="addDataRef" label-width="100px">
        <el-form-item :label="TitleText" prop="attr_name">
          <el-input v-model="addData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑 -->
    <el-dialog :title="'编辑' + TitleText" :visible.sync="editDialogVisible" width="50%" @close='editDiaglogVisible'>
      <el-form :model="editData" :rules="editDataRules" ref="editDataRef" label-width="100px">
        <el-form-item :label="TitleText" prop="attr_name">
          <el-input v-model="editData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用于存储商品分类数据
      goodsCate : [],
      // 存储选择的商品分类id
      selectedKeys : [],
      // props 相关配置
      cascaderProps : {
        expandTrigger: 'hover',
        label : 'cat_name',
        value : 'cat_id',
      },
      // 选中的 tabs 选项  参数是 tab-pane 的name属性
      activeName : 'many',
      // 静态参数
      onlyData : [],
      // 动态参数
      manyData : [],
      // 控制对话框显示隐藏
      paramsDialogVisible : false,
      // 添加数据的参数
      addData : {
        attr_name : ''
      },
      // 验证添加数据的规则
      addDataRules : {
        attr_name : [
          { required: true, message: '内容不能为空！', trigger: 'blur' }
        ]
      },
      // 控制编辑对话框的显示隐藏
      editDialogVisible : false,
      // 编辑存放数据
      editData : {},
      // 验证编辑数据的规则
      editDataRules : {
        attr_name : [
          { required: true, message: '内容不能为空！', trigger: 'blur' }
        ]
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods : {
    // 获取商品分类
    async getCateList() {
      const {data : res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('商品分类获取失败!')
      this.goodsCate = res.data
    },
    // 判断级联选择器的选中层次
    cateHandleChange() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyData = []
        this.onlyData = []
        return
      }
      this.getParamsData()
    },
    // 当 tabs 发生点击事件的时候触发
    handleParamsClick() {
      console.log(this.activeName);
      if (this.selectedKeys.length !== 3) return
      this.getParamsData()
    },
    // 获取选中项相关数据
    async getParamsData() {
      // 发生请求 
      const {data : res} = await this.$http.get(`categories/${this.getCateId}/attributes`,{params : {sel : this.activeName}})
      if (res.meta.status !== 200) return this.$message.error('参数获取失败！')

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入框与按钮之间的切换
        item.inputVisible = false
        // 输入框的数据
        item.inputValue = ''
      })
      if (this.activeName == 'only') {
        this.onlyData = res.data
      } else {
        this.manyData = res.data
      }
      console.log(res.data);
    },
    // 点击添加静态属性
    addOnly() {
      this.paramsDialogVisible = true
    },
    // 点击添加动态参数
    addMany() {
      this.paramsDialogVisible = true
    },
    addDiaglogVisible() {
      this.$refs.addDataRef.resetFields()
    },
    // 点击确定按钮提交数据
    addParams() {
      this.$refs.addDataRef.validate(async valid => {
        if (!valid) return 
        const {data : res} = await this.$http.post(`categories/${this.getCateId}/attributes`,{
          attr_name : this.addData.attr_name,
          attr_sel : this.activeName
        })

        if (res.meta.status !== 201) return this.$message.error('添加失败！')
        this.$message.success('添加成功！')
        this.getParamsData()
        this.paramsDialogVisible = false
      })
    },
    // 点击编辑按钮
    async editBtn(id) {
      // 发送请求
      const {data : res} = await this.$http.get(`categories/${this.getCateId}/attributes/${id}`,{
        params : {
          attr_sel : this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取分类参数失败！')
      this.editData = res.data
      this.editDialogVisible = true
    },
    // 监听 编辑对话框关闭事件
    editDiaglogVisible() {
      // 清空表单数据
      this.$refs.editDataRef.resetFields()
    },
    // 点击确认按钮时
    editParams() {
      this.$refs.editDataRef.validate(async valid => {
        if (!valid) return
        const {data : res} = await this.$http.put(`categories/${this.getCateId}/attributes/${this.editData.attr_id}`,{
          attr_name : this.editData.attr_name,
          attr_sel : this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮时 
    async removeBtn(id) {
      const isRemove = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isRemove !== 'confirm') return this.$message.info('用户取消了删除请求！')
      const {data : res} = await this.$http.delete(`categories/${this.getCateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 点击添加 tag 按钮时
    showInput(row) {
      row.inputVisible = true
      // $nextTick 作用 当页面元素被重新渲染之后，才会执行里面的回调函数
      // 因为 当按钮被点击的时候，文本框，还没有被渲染出来，如果直接获得焦点，此时就找不到该文本框，就会报错
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 文本框失去焦点和敲下回车触发
    handleInputConfirm(row) {
      // 当文本框内容去除空格，之后长度为 0 则，用户没有输入内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      const {data : res} = await this.$http.put(`categories/${this.getCateId}/attributes/${row.attr_id}`,{
        attr_name : row.attr_name,
        attr_sel : row.attr_sel,
        attr_vals : row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('参数更新失败！')
      this.$message.success('参数更新成功！')
    },
    // 点击删除 tag 标签
    removeTag(index,row) {
      row.attr_vals.splice(index,1)
      this.saveAttrVals(row)
    }
  },
  computed : {
    // 判断 添加按钮是否禁用
    isBtnShow() {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 获取分类id 
    getCateId() {
      // 当数组长度为3，证明选择了三级分类  将三级分类的id 返回出去
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      // 否则，返回 null
      return null
    },
    // 对话框提示文字
    TitleText() {
      if (this.activeName === 'only') return '静态属性'
      return '动态参数'
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    margin: 15px 0;
  }
  .el-tag {
    margin: 0 10px;
  }
  .input-new-tag {
    width: 150px;
  }
</style>