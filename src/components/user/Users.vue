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
          <template slot-scope="">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
<!--            修改按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
<!--            删除按钮-->
            <el-tooltip  effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
<!--            分配角色按钮-->
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
<!--对话框-->
  <el-dialog
    title="提示"
    :visible.sync="addDialogVisible"
    width="50%">
<!--    内容主题区域-->
    <span>这是一段信息</span>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
  </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data () {
    return {
    //  获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        //  当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false
    //  控制对话框的显示隐藏
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
      console.log(res)
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
