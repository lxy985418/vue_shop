<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
<!--    弹出消息框-->
    <el-alert
      title="消息提示的文案" type="info" show-icon centmer :closable="false">
    </el-alert>
<!--    步骤条 activeIndex - 0 将字符转换为数字-->
<!--    字符串+任何都是字符串  - /  % 都可以隐式转换number类型-->
    <el-steps  :space="200" :active="activeIndex - 0" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!--      tags标签栏-->
    <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" label-position="top">
    <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabCliked">
      <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label-width="100px"   label="父级分类" prop="goods_cat">
            <!--          options指定选择源对象 props指定配置对象-->
            <!--          新版将语法更改 属性需要在props中用数组实现-->
            <el-cascader
              :options="cateList"
              :props="{ expandTrigger: 'hover' , value: 'cat_id',  label: 'cat_name',  children: 'children'}"
              v-model="addForm.goods_cat"
              @change="handleChange"
              clearable>
            </el-cascader>
          </el-form-item>
          <el-alert
            title="注意: 只允许为第三级分类设置相关参数!"
            type="warning"
            show-icon>
          </el-alert>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="1">
        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
          <!-- 复选框组 -->
          <el-checkbox-group v-model="item.attr_vals">
            <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" name="2">
        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
         <el-input v-model="item.attr_vals"></el-input>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品图片" name="3">
<!--        action上传的地址-->
        <el-upload
          :action="upload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :headers="headerObj"
          list-type="picture" :on-success="handleSuccess">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="4">
<!--        富文本编辑器组件-->
        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
        <el-button type="primary" @click="add" class="btnAdd">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
    </el-form>
  </el-card>
  <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="30%">
    <img :src="previewPath" alt="" class="previewImg">
  </el-dialog>
</div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    var checkNum = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regNum = /^[0-9]\d*$/
      if (regNum.test(value)) {
        return cb()
      }

      cb(new Error('请输入正确商品数量'))
    }
    var checkWeight = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regWeight = /^([1-9]\d*(\.\d*[1-9])?)$/
      if (regWeight.test(value)) {
        return cb()
      }

      cb(new Error('请输入正确商品重量'))
    }
    var checkPrice = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regPrice = /^([1-9]\d*(\.\d*[1-9])?)$/
      if (regPrice.test(value)) {
        return cb()
      }

      cb(new Error('请输入正确商品价格'))
    }
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        //  商品详情
        goods_introduce: '',
        attrs: []
      },
      addRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          },
          {
            validator: checkPrice,
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          },
          {
            validator: checkWeight
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          },
          {
            validator: checkNum
          }
        ],
        goods_cat: [{
          required: true,
          message: '请输入商品分类'
        }]
      },
      cateList: [],
      manyTableData: [],
      onlyTableData: [],
      upload: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization:
          window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' &&
      this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabCliked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！')
        }
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
      const filePath = file.response.data.tem_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的时间
    handleSuccess (response) {
    //  拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //  将图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        console.log(res.meta.status)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>
