<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="primary" @click="logout" plain>退出</el-button>
    </el-header>
    <!-- 主体部分 -->
    <el-container>
      <!-- 左侧导航 -->
      <el-aside :width="toggleWidth">

        <div class="toggle-unfold" @click="toggleCollapse">|||</div>

        <!-- 菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" :collapse-transition='false' 
        active-text-color="#6b9eff" unique-opened :collapse='isCollapse' router
        :default-active='active'>

          <!-- 一级菜单 -->
          <el-submenu :index="'/' + item.path" v-for="item in menusList" :key="item.id"> 
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="incoList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" 
            :key="subItem.id" @click="activePath('/' + subItem.path)">
            <!-- 二级菜单 模板区域-->
              <template slot="title">
                <i class="el-icon-star-on"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>

        </el-menu>

      </el-aside>

      <!-- 内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>

  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 存放菜单数据
      menusList : [],
      incoList : {
        '125' : 'iconfont icon-users',
        '103' : 'iconfont icon-lock_fill',
        '101' : 'iconfont icon-shangpin',
        '102' : 'iconfont icon-danju',
        '145' : 'iconfont icon-baobiao',
      },
      // 判断是否折叠
      isCollapse : false,
      active : ''
    }
  },
  methods : {
    // 退出登录功能
    logout() {
      // 清空 token 
      window.sessionStorage.clear()
      // 将页面跳转到登录页
      this.$router.push('/login')
    },
    // 发送请求
    async getMenlist() {
      // 利用解构赋值 将服务器返回的data 对象 解构出来，并且重新命名为 res
      const {data : res} = await this.$http.get('menus')
      // 因为 data 也是一个数组，所以可以直接赋值给
      this.menusList = res.data
    },
      // 折叠展开菜单栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    activePath(path) {
      window.sessionStorage.setItem('activePath', path)
      this.active = path
    }
  },
  computed : {
    toggleWidth() {
      return !this.isCollapse ? '200px' : '64px'
    }
  },
  // created 生命周期钩子函数 是 组件创建完成之后调用
  created() {
    this.getMenlist()
    this.active = window.sessionStorage.getItem('activePath')
  },
}
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
  }
  .el-header{
    background-color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    padding-left: 0;
    div{
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    transition: all .3s;
    .el-menu {
      border-right:none ;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-unfold {
    text-align: center;
    letter-spacing: 0.2em;
    line-height: 20px;
    cursor: pointer;
    color: #fff;
    background-color: #495065;
  }
</style>