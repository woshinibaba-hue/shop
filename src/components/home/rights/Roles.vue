<template>
  <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-button type="primary" @click="addDialogRoleVisible = true">添加角色</el-button>

    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="RolesList" border stripe>
        <el-table-column type="expand" label="展开" width="80px">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" 
            :class="['dbbottom',index1 === 0 ? 'dbtop' : '','vcenter']">
              <!-- 用于渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close='removeRigths(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 用于渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row  v-for="(item2,index2) in item1.children" :key="item2.id" 
                :class="[index2 == 0 ? '' : 'dbtop','vcenter']">
                  <!-- 二级 -->
                  <el-col :span='6'>
                    <el-tag type="success" closable @close='removeRigths(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close='removeRigths(scope.row,item3.id)'>
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label='序号' width="80px"></el-table-column>
        <el-table-column label='角色名称' prop="roleName"></el-table-column>
        <el-table-column label='角色描述' prop="roleDesc"></el-table-column>
        <el-table-column label='操作'>
          <template slot-scope="scope">
            <el-button size='mini' type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
            <el-button size='mini' type="danger" icon="el-icon-delete" @click="removeRole(scope.row.id)">删除</el-button>
            <el-button size='mini' type="warning" icon="el-icon-setting" @click="roleAllocation(scope.row)">权限分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色弹出框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogRoleVisible" width="50%" @close='clearRole'>
      <!-- 内容主体区域 -->
      <el-form :model="addRoleForm" :rules="roleFormRules" ref="roleForm" label-width="80px">
        <el-form-item label=角色名称 prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label=角色描述 prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogRoleVisible" width="50%" @close='editRole'>
      <!-- 内容主体区域 -->
      <el-form :model="editRoleForm" :rules="roleFormRules" ref="editRedactForm" label-width="80px">
        <el-form-item label=角色名称 prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label=角色描述 prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="redactRoleForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog title="角色分配" :visible.sync="roleAllocationVisible" width="50%" @close='closePower'>
      <!-- 树形控件区域 -->
      <el-tree :data="PowerList" :props="PowerProps" ref="tree" show-checkbox default-expand-all node-key='id' :default-checked-keys='defKeys'></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleAllocationVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAllPower">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 用于存储角色列表数据
      RolesList : [],
      addDialogRoleVisible : false,
      // 用于存储添加角色的的输入数据
      addRoleForm : {
        roleName : '',
        roleDesc : ''
      },
      // 添加角色校验规则
      roleFormRules : {
        roleName : [
           { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc : [
           { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 存储 id 查询的角色信息
      editRoleForm : {
        roleName : '',
        roleDesc : '',
        id : ''
      },
      // 控制编辑角色对话框显隐
      editDialogRoleVisible : false,
      // 控制角色分配对话框显隐
      roleAllocationVisible : false,
      // 存储权限数据
      PowerList : [],
      // 配置权限的对应关系
      PowerProps : {
        label : 'authName',
        children : 'children'
      },
      // 选中权限的 id
      defKeys : [],
      // 即将要分配权限的角色 id
      roleId : '',
    }
  },
  created() {
    this.getRoleList()
  },
  methods : {
    async getRoleList() {
      let {data : res} = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('角色列表获取失败！')
      this.RolesList = res.data
    },
    clearRole() {
      // 清空表单内容
      this.$refs.roleForm.resetFields()
    },
    async addRole() {
      let isRole = await this.$refs.roleForm.validate();
      if (!isRole) return;
      let {data : res} = await this.$http.post('roles',this.addRoleForm)
      if (res.meta.status !== 201) return this.$message.error('角色添加失败！')
      this.addDialogRoleVisible = false
      this.$message.success('角色添加成功！')
      this.getRoleList()
    },
    async removeRole(id) {
      const removeRoleInfo = await this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (removeRoleInfo === 'cancel') return this.$message.info('已取消删除！')
      let {data : res} = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRoleList()
    },
    async editRole(id) {
      const {data : res} = await this.$http.get('roles/' + id)
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      this.editRoleForm.id = res.data.roleId
      this.editDialogRoleVisible = true
    },
    // 点击修改按钮发送请求
    async redactRoleForm() {
      // 表单预验证
      let isRole = await this.$refs.editRedactForm.validate();
      if (!isRole) return
      // 表单预验证通过，发送请求
      let {data : res} = await this.$http.put('roles/' + this.editRoleForm.id,{
        roleName : this.editRoleForm.roleName,
        roleDesc : this.editRoleForm.roleDesc
      })
      if (res.meta.status !== 200) {
        this.$message.error('修改用户信息失败!')
      }
      // 修改成功
      // 重新加载页面
      this.getRoleList()
      // 关闭对话框
      this.editDialogRoleVisible = false
      this.$message.success('用户信息修改成功!')
    },
    // 删除权限
    async removeRigths(role,rightId) {
      const confirmRemoveRigths = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmRemoveRigths !== 'confirm') return this.$message.info('取消了删除权限操作！')
      const {data : res} =  await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      this.$message.success('删除权限成功！')
      // 将服务器返回的最新权限数据，重新赋值给，角色权限的 children 属性
      role.children = res.data
    },
    // 角色分配
    async roleAllocation(role) {
      // 将当前点击的权限分配的角色 id 保存起来
      this.roleId = role.id
      let {data : res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.PowerList = res.data
      this.getThreePower(role,this.defKeys)
      this.roleAllocationVisible = true
    },
    // 点击确定按钮，发送请求，提交权限
    async addAllPower() {
      // 获取 选择节点的id使用 getCheckedKeys 方法
      // 获取 半选中节点 的id 使用 getHalfCheckedKeys 方法
      // 两个方法都是将 权限id组合成 数组进行返回
      const PowerArr = [...this.$refs.tree.getCheckedKeys(),...this.$refs.tree.getHalfCheckedKeys()]
      const PowerStr = PowerArr.join(',')
      let {data : res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids : PowerStr})
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')

      this.getRoleList()
      this.$message.success('分配权限成功！')
      this.roleAllocationVisible = false
    },
    // 定义递归函数，用于获取所有的三级权限
    getThreePower(role,arr) {
      // 当 角色不包含 children 属性时， 将它们的角色权限  id   push 到数组当中
      if (!role.children) {
        return arr.push(role.id)
      }
      // 包含 children 属性  利用递归函数，重新调用一次当前函数
      role.children.forEach(item => 
        this.getThreePower(item,arr)
      )
    },
    // 监听角色分配对话框关闭事件
    closePower() {
      // 当 对话框关闭时，清空，保存角色权限 id 的数组
      this.defKeys = []
    }
  }
}
</script>

<style lang="less" scoped>
  .el-button {
    margin-bottom: 8px;
  }
  .dbtop {
    border-top: 1px solid #eee;
  }
  .dbbottom {
    border-bottom: 1px solid #eee;
  }
  .el-tag {
    margin: 5px;
    cursor: pointer;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>