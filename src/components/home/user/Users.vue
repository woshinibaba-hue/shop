<template>
  <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片区域 -->
      <el-card>
        <!-- 搜索用户和添加用户模板区域 -->
          <el-row>
            <el-col :span="8">
              <el-input placeholder="请输入姓名" v-model="UserInfo.query" clearable @clear='getUserList'>
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4" class="addUser">
              <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
            </el-col>
          </el-row>
          <!-- 用户列表区域 -->
          <el-table :data="UserList" style="width: 100%" stripe border>
            <el-table-column type="index" label="序号" width="174"></el-table-column>
            <el-table-column prop="username" label="姓名" width="180"></el-table-column>
            <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
            <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
            <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
            <el-table-column label="状态" width="180">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.mg_state" inactive-color="#ff4949" @change="UserState(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-tooltip content="修改用户" placement="top" :enterable='false'>
                  <el-button type="primary" icon="el-icon-edit" size=mini @click="redactClict(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip content="删除用户" placement="top" :enterable='false'>
                  <el-button type="danger" icon="el-icon-delete" size=mini @click="removeUser(scope.row.id)"></el-button>
                </el-tooltip>
                <el-tooltip content="分配角色" placement="top" :enterable='false'>
                  <el-button type="warning" icon="el-icon-s-tools" size=mini @click="setRole(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page= UserInfo.pagenum
            :page-sizes="[1, 2, 5, 10]"
            :page-size= UserInfo.pagesize
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>

          <!-- 用户添加弹窗 -->
          <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close='clearForm'>
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="70px">
              <el-form-item label=用户名 prop="username">
                <el-input v-model="addForm.username"></el-input>
              </el-form-item>
              <el-form-item label=密码 prop="password">
                <el-input v-model="addForm.password"></el-input>
              </el-form-item>
              <el-form-item label=邮箱 prop="email">
                <el-input v-model="addForm.email"></el-input>
              </el-form-item>
              <el-form-item label=电话 prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
              </el-form-item>
            </el-form>
            <!-- 按钮区域 -->
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addUser">添 加</el-button>
            </span>
          </el-dialog>

          <!-- 用户修改弹窗 -->
          <el-dialog
            title="用户编辑" :visible.sync="redactDialogVisible" width="50%" @close='clearRedactForm'>
            <!-- 内容主体区域 -->
            <el-form :model="redactUser" :rules="userFormRules" ref="redactForm" label-width="70px">
              <el-form-item label=用户名>
                <el-input v-model="redactUser.username" disabled></el-input>
              </el-form-item>
              <el-form-item label=邮箱 prop="email">
                <el-input v-model="redactUser.email"></el-input>
              </el-form-item>
              <el-form-item label=电话 prop="mobile">
                <el-input v-model="redactUser.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="redactDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="redactUserForm">修 改</el-button>
            </span>
          </el-dialog>

          <!-- 分配角色对话框 -->
          <el-dialog title="分配角色" :visible.sync="setRoledialogVisible" width="50%" @close='setRoleDialog'>
            <div><p>当前用户 ：{{userInfo.username}}</p></div>
            <div><p>当前角色 ：{{userInfo.role_name}}</p></div>
            <div>分配新角色 : 
              <el-select v-model="roleId" placeholder="请选择">
                <el-option v-for="item in roleAll" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="setRoledialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="setRoleConfirm">确 定</el-button>
            </span>
          </el-dialog>
      </el-card>
  </div>
</template>

<script>
export default {
  data() {
      // 手机号验证规则 
     const checkMobile = (rule,val,callback) => {
       const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/
       if (regMobile.test(val)) {
        //  合法手机号
         return callback()
       }
      //  不合法手机号
      callback(new Error('请输入合法的手机号!'))
     }

    //  邮箱验证规则
    const checkEmail = (rule,val,callback) => {
      const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (regEmail.test(val)) return callback()
      // 不合法邮箱地址
      callback(new Error('请输入合法邮箱地址'))
    }

    return {
      UserInfo : {
        query : '',
        // 当前页数
        pagenum : 1,
        // 每页显示的数据条数
        pagesize : 2
      },
      UserList : [],
      // 总数据条数
      total : 0,
      // 控制对话框显示与隐藏
      dialogVisible : false,
      // 添加数据
      addForm : {
        username : '',
        password : '',
        mobile : '',
        email : ''
      },
      addFormRules : {
        username : [
         { required: true, message: '请输入用户名', trigger: 'blur' },
         { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password : [
         { required: true, message: '请输入密码', trigger: 'blur' },
         { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        mobile : [
         { required: true, message: '请输入电话', trigger: 'blur' },
         {validator: checkMobile, trigger: 'blur'}
        ],
        email : [
         { required: true, message: '请输入邮箱', trigger: 'blur' },
         {validator: checkEmail, trigger: 'blur'}
        ],
      },
      // 控制用户修改对话框显示与隐藏
      redactDialogVisible : false,
      // 用于保存 id 查询的用户数据
      redactUser : {},
      // 编辑用户校验规则
      userFormRules : {
        email : [
           { required: true, message: '请输入邮箱地址', trigger: 'blur' },
           {validator: checkEmail, trigger: 'blur'}
        ],
        mobile : [
           { required: true, message: '请输入手机号', trigger: 'blur' },
           {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 控制分配角色对话框显隐
      setRoledialogVisible : false,
      // 即将需要分配角色的信息
      userInfo : {},
      // 存储所有角色信息
      roleAll : [],
      // 用于存储选中的角色 id
      roleId : ''
    }
  },
  created() {
    this.getUserList()
  },
  methods : {
    async getUserList() {
      let {data : res} = await this.$http.get('users',{params : this.UserInfo});
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败!')
      this.UserList = res.data.users
      this.total = res.data.total
    },
    // 监听 page-sizes 选择每页显示的数据条数，下拉框，发生改变时，触发  形参是 选择每页显示的数据条数
    handleSizeChange(newSize) {
      // 将更改之后的值重新赋值给data里面的 UserInfo
      this.UserInfo.pagesize = newSize
      // 再次向服务器端发送请求
      this.getUserList();
    },
    // 监听 点击的页码值，触发   形参是，点击的页码值
    handleCurrentChange(newPage) {
      this.UserInfo.pagenum = newPage
      this.getUserList();
    },
    // 修改用户状态信息
    async UserState(param) {
      console.log(param);
      let {mg_state : state,id} = param
      // console.log(state);
      const {data : res} = await this.$http.put(`users/${id}/state/${state}`)
      console.log(res);
      if (res.meta.status !== 200) {
        this.UserList.mg_state = !state
        return this.$message.error('用户状态修改失败!')
      }
      this.$message.success('用户状态修改成功!')
    },
    // 监听表单关闭事件
    clearForm() {
      // 清空表单内容
      this.$refs.addForm.resetFields()
    },
    async addUser() {
      let isForm = await this.$refs.addForm.validate();
      // 校验通过，发送请求
      if (isForm) {
        let {data : res} = await this.$http.post('users',this.addForm)

        if (res.meta.status == 201) {
          this.$message.success('用户添加成功!')
          this.getUserList()
          // 添加成功，关闭对话框
          this.dialogVisible = false
          return;
        }
        return this.$message.error('用户添加失败!')
      }
    },
    // 编辑用户操作
    async redactClict(id) {
      this.redactDialogVisible = true
      // 根据id查询用户数据
      let {data : res} = await this.$http.get('users/' + id)
      this.redactUser = res.data
    },
    // 监听编辑对话框关闭
    clearRedactForm() {
      this.$refs.redactForm.resetFields()
    },
    // 点击修改按钮发送请求
    async redactUserForm() {
      // 表单预验证
      let isUser = await this.$refs.redactForm.validate();
      if (!isUser) return 
      // 表单预验证通过，发送请求
      let {data : res} = await this.$http.put('users/' + this.redactUser.id,{
        email : this.redactUser.email,
        mobile : this.redactUser.mobile
      })
      if (res.meta.status !== 200) {
        this.$message.error('修改用户信息失败!')
      }
      // 修改成功
      // 重新加载页面
      this.getUserList()
      // 关闭对话框
      this.redactDialogVisible = false
      this.$message.success('用户信息修改成功!')
    },
    // 删除用户
    async removeUser(id) {
      let removeUserInfo = await this.$confirm('此操作将永久删除该用户数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      // 当点击的确定按钮，会返回  confirm
      // 当点击的取消按钮，会返回  cancel
      if (removeUserInfo !== 'confirm') return this.$message.info('取消了删除！')
      // 点击确定按钮  发送请求
      let {data : res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户数据失败！')
      this.getUserList()
      this.$message.success('删除用户数据成功！')
    },
    // 分配角色
    async setRole(role) {
      // 将当前需要分配角色的信息保存起来
      this.userInfo = role
      // 获取所有角色信息
      const {data : res} = await this.$http.get('roles')
      this.roleAll = res.data
      this.setRoledialogVisible = true
    },
    // 保存分配的角色
    async setRoleConfirm() {
      const {data : res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid : this.roleId
      })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoledialogVisible = false
    },
    // 监听角色分配的对话框关闭事件
    setRoleDialog() {
      this.userInfo = {}
      this.roleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
  .addUser {
    margin-left: 20px;
  }
</style>