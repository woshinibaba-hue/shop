<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 顶部消息提示 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable='false' center></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息" icon="el-icon-info"></el-step>
        <el-step title="商品参数" icon="el-icon-setting"></el-step>
        <el-step title="商品属性" icon="el-icon-more"></el-step>
        <el-step title="商品图片" icon="el-icon-picture"></el-step>
        <el-step title="商品内容" icon="el-icon-s-comment"></el-step>
        <el-step title="完成" icon="el-icon-success"></el-step>
      </el-steps>
      <!-- tabs 标签页区域 -->
      <el-form label-position='top' :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px">
        <el-tabs :tab-position="'left'" v-model="activeIndex" 
        :before-leave='beforeLeave' @tab-click='activeTab'>
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称 :" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格 :" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量 :" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量 :" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item  label="商品分类 :">
              <el-cascader v-model="addGoodsForm.goods_cat" :options="goodsCateList" 
              :props="cateListProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in ManyCateData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="d"  v-for="(d,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in OnlyCateData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-form-item>
              <!-- active  图片上传地址   headers  为上传图片设置请求头信息-->
              <el-upload :headers='headersObj' :action="updateUrl" :on-preview="handlePreview"
               :on-remove="handleRemove" list-type="picture" :on-success='handleSuccess'>
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addGoods" @click="addGoods">添加商品内容</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="preViewVisoble" width="50%">
      <img :src="preViewUrl" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
// 导入 lodash 模块 用于深拷贝操作
import _ from 'lodash'

export default {
  data() {
    return {
      // 商品分类信息
      goodsCateList : [],
      activeIndex : '0',
      // 商品参数数据
      addGoodsForm : {
        goods_name : '',
        goods_price : 0,
        goods_weight : 0,
        goods_number : 0,
        // 商品分类所属的数组
        goods_cat : [],
        // 图片上传临时路径
        pics : [],
        // 商品详情
        goods_introduce : '',
        attrs : []
      },
      // 添加商品校验规则
      addGoodsFormRules : {
        goods_name : [
           { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price : [
           { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight : [
           { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number : [
           { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      cateListProps: {
        expandTrigger: 'hover',
        // label 表示看到的属性
        label : 'cat_name',
        // 表示中的属性
        value : 'cat_id',
        // 以什么属性进行嵌套关系
        children : 'children'
      },
      // 存储动态商品参数
      ManyCateData : [],
      // 存储静态商品参数
      OnlyCateData : [],
      // 图片上传路径
      updateUrl : 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的请求头信息   因为图片上传，没有使用axios 发送请求，
      // 所以 请求头的 token 没有设置到图片上传的网络请求头当中，所以需要收到进行设置
      headersObj : {
        Authorization : window.sessionStorage.getItem('token')
      },
      // 图片完整路径地址
      preViewUrl : '',
      // 图片预览框显示与隐藏
      preViewVisoble : false
    }
  },
  created() {
    this.getGoodsCateList()
  },
  methods : {
    async getGoodsCateList() {
      // 获取商品分类信息
      const {data : res} = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('商品分类信息获取失败！')
      this.goodsCateList = res.data
    },
    // 级联选择器选项发生变化时触发
    handleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 切换标签之前触发的钩子
    beforeLeave(activeName, oldActiveName) {
      // activeName, 即将切换的标签页
      // oldActiveName  即将离开的标签页
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab 被选中时触发
    async activeTab() {
      // console.log(this.activeIndex);
      if (this.activeIndex === '1') {
        // 发送请求
        const {data : res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params : {sel : 'many'}
        })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败！')
        // 循环返回的数组，数组里面的每一项是一个对象，然后判断 对象里面的数据是否为空
        // 不为空，就将该字符串转换为数组，在进行赋值操作
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        this.ManyCateData = res.data
        console.log(this.ManyCateData);
      } else if (this.activeIndex === '2') {
        // 发送请求
        const {data : res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params : {sel : 'only'}
        })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败！')
        // 循环返回的数组，数组里面的每一项是一个对象，然后判断 对象里面的数据是否为空
        // 不为空，就将该字符串转换为数组，在进行赋值操作
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        // })
        this.OnlyCateData = res.data
        console.log(this.OnlyCateData);
      }
    },
    // 图片预览功能  第一个行参就是 需要预览展示的图片信息
    handlePreview(file) {
      console.log(file);
      // 保存当前需要预览的图片完整地址
      this.preViewUrl = file.response.data.url
      this.preViewVisoble = true
    },
    // 移除图片功能    第一个形参就是删除的图片列表信息
    handleRemove(file) {
      console.log(file);
      // 1.获取要删除的图片的临时路径
      const removePath = file.response.data.tmp_path
      // 2. 从 pics数组中查找，要删除图片的索引号
      const removeIndex = this.addGoodsForm.pics.findIndex(item => item == removePath)
      // 3. 利用 splice 对图片信息进行删除
      this.addGoodsForm.pics.splice(removeIndex,1)
    },
    // 图片上传成功触发的钩子   第一个形参是，上传成功，服务器返回的结果
    handleSuccess(res) {
      console.log(res);
      const picsInfo = res.data.tmp_path
      // 将图片的临时路径，push 到  pics数组当中
      this.addGoodsForm.pics.push(picsInfo)
    },
    // 添加商品详情按钮被点击
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 因为由于，级联选择器 绑定的数据必须是 数组类型的，
        // 现在服务器又需要传递的是逗号分隔的字符串类型的数据，
        // 如果，直接使用 join 方法进行转换，此时就会直接报错
        // 那么现在就需要使用  深拷贝的方法 来完成
        // 需要使用 lodash 模块 下面的 cloneDeep 方法来完成深拷贝功能
        const formData = _.cloneDeep(this.addGoodsForm)
        formData.goods_cat = formData.goods_cat.join(',')
        // 处理静态属性
        this.OnlyCateData.forEach(item => {
          const formInfo = {
            attr_id : item.attr_id,
            attr_value : item.attr_vals
          }
          this.addGoodsForm.attrs.push(formInfo)
        })
        // 处理动态参数
        this.ManyCateData.forEach(item => {
          const formInfo = {
            attr_id : item.attr_id,
            attr_value : item.attr_vals.join(' ')
          }
          this.addGoodsForm.attrs.push(formInfo)
        })
        formData.attrs = this.addGoodsForm.attrs
        console.log(formData);

        // 发送请求，添加商品
        const {data : res} = await this.$http.post('goods', formData)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error('商品添加失败！')
        this.$message.success('商品添加成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed : {
    // 获取分类 id
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 20px;
  }
  .el-checkbox {
    margin: 0 10px 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .addGoods {
    margin-top: 15px;
  }
</style>