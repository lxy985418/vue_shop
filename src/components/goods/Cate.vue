<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品导航</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="40">
        <el-col :span="4">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
<!--      expand-type展开行 selection-type复选框 border纵向分割线-->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="序号" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: deepskyblue;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="danger" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEidtDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row,scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
<!--    弹出商品分类框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateVisible"  @close="addDialogClose">
      <!--    内容主题区域-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef"
               label-width="100px">
        <el-form-item label-width="100px" label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label-width="100px"   label="父级分类">
<!--          options指定选择源对象 props指定配置对象-->
<!--          新版将语法更改 属性需要在props中用数组实现-->
          <el-cascader
            :options="parentCateList"
            :props="{ checkStrictly:true, expandTrigger: 'hover' , value: 'cat_id',  label: 'cat_name',  children: 'children'}"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
<!--    修改商品分类-->
    <el-dialog
      title="修改商品分类"
      :visible.sync="editDialogVisible"
      @close="editDialogClose">
      <!--    内容主题区域-->
      <el-form :model="editCate" :rules="addCateFormRules" ref="editCateRef"
               label-width="70px" >
        <el-form-item label-width="120px" label="商品分类名称" prop="cat_name">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      addCateVisible: false,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        // 默认添加一级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [{
          // 标记必填项
          required: true,
          message: '请输入商品类型名称',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          min: 2,
          max: 10,
          message: '商品分类名称长度在2到10长度之间',
          trigger: 'blur'
        }]
      },
      parentCateList: [],
      // 选中的父级ID数组
      selectedKeys: [],
      editDialogVisible: false,
      editCate: {
        cat_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.$message.success('获取商品分类成功')
      // 商品数据
      this.cateList = res.data.result
      // 商品数据总条数
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    addDialogClose () {
      this.$refs.addCateFormRef.resetFields()
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    parentCateChanged () {
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateVisible = false
      })
    },
    async showEidtDialog (id) {
      console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取失败，请稍后再试')
      this.editCate = res.data
      this.editDialogVisible = true
    },
    editCateInfo () {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return
        // console.log(valid)
        const { data: res } = await this.$http.put('categories/' + this.editCate.cat_id, this.editCate)
        if (res.meta !== 200) {
          this.$message.error('修改失败')
        }
        this.$message.success('修改商品分类成功')
        // 隐藏添加对话框
        this.editDialogVisible = false
        this.getCateList()
      })
    },
    editDialogClose () {
      this.$refs.editCateRef.resetFields()
    },
    async removeCate (cote, id) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //  如果用户点击删除返回值为字符串confirm
      //  如果用户点击取消返回值为字符串cancel
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(
          'categories/' + id)
        if (res.meta !== 200) {
          this.$message.error('删除商品分类失败')
        }
        this.$message.success('删除商品分类成功')
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
