<template>
<div>
<!--  面包屑导航区域-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
<!--  卡片视图区域-->
  <el-card class="box-card">
    <el-row :gutter="40">
      <el-col :span="5">
          <el-input placeholder="请输入内容"
          v-model="queryInfo.query" clearable
                    @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="searchUserList"></el-button>
          </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <div>
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" >
          <template slot-scope="scope">
<!--            新版为slot-->
            <el-switch
              v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
<!--              scope.row为当前行的数据-->
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit"
                      @click="showEditDialog(scope.row.id)" size="mini"></el-button>
            <!--            删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!--            分配角色按钮-->
            <el-tooltip  effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
<!--   current-page当前展示第几页 -->
  </el-card>
<!--添加用户对话框-->
  <el-dialog
    title="添加用户"
    :visible.sync="addDialogVisible"
    width="50%" @close="addDialogClose">
<!--    内容主题区域-->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
             label-width="70px" >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码"  prop="password">
        <el-input  v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
         <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
  </el-dialog>
<!--  修改用户数据对话框-->
  <el-dialog
    title="修改用户"
    :visible.sync="editDialogVisible"
    width="50%">
    <el-form :model="editForm" :rules="addFormRules" ref="editFormRef"
             label-width="70px" >
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
  </el-dialog>
  <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%"  @close="closeSetRole">
    <div>
      <p>当前用户:{{userInfo.username}}</p>
      <p>当前角色:{{userInfo.role_name}}</p>
      <p>分配角色:
        <el-select v-model="setRoleId" placeholder="请选择角色">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setUserRole">确 定</el-button>
  </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data () { // 验证邮箱 rules 验证规则 value 验证值 cb 回调函数
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入正确的邮箱地址'))
    }
    // 验证手机号
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
    //  获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        //  当前每页显示多少条数据
        pagesize: 5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      //  控制对话框的显示隐藏
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [{
          required: true,
          message: '请输入用户名称',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          min: 3,
          max: 10,
          message: '用户名长度在3到10长度之间',
          trigger: 'blur'
        }
        ],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          min: 6,
          max: 15,
          message: '密码长度在6到15长度之间',
          trigger: 'blur'
        }
        ],
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          validator: checkEmail,
          min: 6,
          max: 10,
          trigger: 'blur'
        }
        ],
        mobile: [{
          required: true,
          message: '请输入手机号码',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          validator: checkMobile,
          // 不能加括号
          trigger: 'blur'
        }
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: [],
        email: [],
        mobile: []
      },
      setRoleDialogVisible: false,
      userInfo: [],
      rolesList: [],
      setRoleId: []
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败!')
      this.userList = res.data.users
      this.total = res.data.total
    //  console.log(res)
    },
    handleSizeChange (newsize) {
    // 监听pagesize改变
    //   console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange (newpage) {
    // 监听页码值改变
    //   console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      const { data: ref } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (ref.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功!')
    },
    async searchUserList () {
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    // 监听form表单关闭后重置信息
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      //  也可以通过监听addDialogVisible
      //  if (!this.addDialogVisible) this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //  console.log(valid)
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta !== 201) {
          this.$message.error('添加失败')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加对话框
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 展示
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户数据失败')
      this.editForm = res.data
      this.editDialogVisible = true
      this.addDialogVisible = false
    },
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //  console.log(valid)
        const { data: res } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        if (res.meta !== 201) {
          this.$message.error('修改失败')
        }
        this.$message.success('修改用户成功')
        // 隐藏添加对话框
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 根据ID删除用户
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta !== 201) {
          this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      }
    },
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 展示对话框之前获取所有角色
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) this.$message.error('获取角色列表失败')
      this.$message.success('获取角色列表成功')
      this.rolesList = res.data
      // 展示分配角色对话框
      this.setRoleDialogVisible = true
    },
    async setUserRole () {
      if (!this.setRoleId) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,
        { rid: this.setRoleId })
      if (res.meta.status !== 200) this.$message.error('修改用户角色失败')
      this.$message.success('修改用户角色成功')
      this.setRoleDialogVisible = false
      this.getUserList()
    },
    closeSetRole () {
      this.setRoleId = ''
      this.userInfo = []
    }
  }
}
</script>

<style lang="less" scoped>

</style>
