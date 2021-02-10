<template>
  <div class="login_content">
    <div class="login_box">
      <div class="login_avatar">
        <img src="../../assets/logo.png" alt="">
      </div>
      <el-form class="login_form" :model='LoginForm' :rules="LoginFormRules" ref="LoginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="LoginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="LoginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-row class="btns">
          <el-button type="primary" @click="Login">登录</el-button>
          <el-button type="info" @click="LoginClear">重置</el-button>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      LoginForm : {
        username : 'admin',
        password : '123456'
      },
      // 验证表单合法性
      LoginFormRules : {
        username : [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password : [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods : {
    // 清空表单内容
    LoginClear() {
      // console.log(this);
      this.$refs.LoginFormRef.resetFields();
    },
    // 对表单进行提交
    Login() {
      this.$refs.LoginFormRef.validate(async valid => {
        // console.log(valid);
        // 发送网络请求
        if (!valid) return;
        // 通过解构赋值，将里面的data对象解构出来，这个data对象就是服务器返回的结果
        const {data} = await this.$http.post('login',this.LoginForm)
        if (data.meta.status !== 200) return this.$message.error('账号或密码错误!');
          this.$message.success('登录成功!')
          // 1. 将登录成功之后的 token 保存到客户端的 sessionStorage 当中   
          //  这个 token 是为了验证用户是否登录成功，登录成功才可以去访问其他的 apl
          window.sessionStorage.setItem('token',data.data.token)
          // 2. 登录成功之后，跳转到 /home 页面
          this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped lang="less">
  .login_content{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
  .login_avatar {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, .1);
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 20px;
  }
  .btns {
    text-align: center;
    margin-bottom: 20px;
  }
</style>