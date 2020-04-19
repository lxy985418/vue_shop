<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon>
      </el-alert>
<!--      选择商品分类-->
      <el-row class="cat_opt">
        <el-col>
          <span style="margin: 15px">选择商品分类</span>
<!--          选择商品分类次联选择框-->
          <el-cascader
            :options="parentCateList"
            :props="{expandTrigger: 'hover' , value: 'cat_id',  label: 'cat_name',  children: 'children'}"
            v-model="selectedKey"
            @change="handleChange"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--        添加动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="dialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
<!--                循环显示tag标签-->
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
<!--                输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

              </template>
            </el-table-column>
            <el-table-column type="index" width="50px" label="序号"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template  slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
<!--        添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="dialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--                循环显示tag标签-->
                <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!--                输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

              </template>
            </el-table-column>
            <el-table-column type="index" width="50px" label="序号"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template  slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="dialogVisible"
      @close="DialogClose">
      <!--    内容主题区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      @close="editDialogClose">
      <!--    内容主题区域-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef"
               label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editAttrName">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      parentCateList: [],
      selectedKey: '',
      // 被激活页签的名称
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      dialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入参数名称',
          trigger: 'blur'
        }]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      // 输入框显示控制
      inputVisible: false,
      inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.$message.success('获取商品分类成功')
      this.parentCateList = res.data
    },
    handleChange () {
      this.getParamData()
    },
    // 获取参数列表数据
    async getParamData () {
      // 如果不是三级分类
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类Id,和当前所处面板获取当前对应参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签点击处理函数
    handleTabClick () {
      this.getParamData()
    },
    DialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }

        this.$message.success('添加参数成功！')
        this.dialogVisible = false
        this.getParamData()
      })
    },
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('查询失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editAttrName () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败！')
        }
        this.$message.success('更新成功！')
        this.getParamData()
        this.editDialogVisible = false
      })
    },
    async removeParams (id) {
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
          `categories/${this.cateId}/attributes/${id}`)
        if (res.meta !== 200) {
          this.$message.error('删除' + this.titleText + '失败')
        }
        this.$message.success('删除' + this.titleText + '成功')
        this.getParamData()
      }
    },
    // 文本框失去焦点
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async saveAttrVals (row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  // 计算属性
  computed: {
    //  如果按钮需要被禁用，则返回true 否则返回false
    isBtnDisabled () {
      return this.selectedKey.length !== 3
    },
    // 选取当前ID
    cateId () {
      if (this.selectedKey.length === 3) {
        return this.selectedKey[2]
      }
      return null
    },
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
