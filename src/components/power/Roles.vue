<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row :gutter="40">
          <el-col :span="4">
            <el-button type="primary"  @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>
        <el-table :data="rolesList" border stripe>
          <el-table-column type="expand">
          <template slot-scope="scope">
<!--            一行为24列-->
            <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']" :span="5" v-for="(item1,i1) in scope.row.children" :key="item1.id">
<!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable
                @close="removeRights(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              渲染二级三级权限-->
              <el-col :span="19">
                <el-row :class="['bdbottom',i2 === 0 ? 'bdtop' : '','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
<!--                  二级权限-->
                  <el-col :span="6">
                    <el-tag type="success" closable
                    @close="removeRights(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
<!--                  三级权限-->
                  <el-col :span="18">
                    <el-tag type="danger" v-for="item3 in item2.children" :key="item3.id"
                            closable @close="removeRights(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
          </el-table-column>
          <el-table-column type="index" label="序号" width="50"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" prop="level">
            <template slot-scope="scope">
              <!--            修改按钮-->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
              <!--            删除按钮-->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
              <!--            分配角色按钮-->
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
<!--      添加角色弹出框-->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible" @close="addDialogClose">
        <!--    内容主题区域-->
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleRef"
                 label-width="70px" >
          <el-form-item label-width="100px" label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label-width="100px"  label="角色描述" prop="roleDesc">
            <el-input  v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
      </el-dialog>
<!--      添加权限页面-->
      <el-dialog
        title="分配权限"
        :visible.sync="addRightDialogVisible" width="50%"
        @close="closeRightDialog">
        <!--    内容主题区域 树形控件-->
        <el-tree :data="rightsList" :props="treePop"
                 show-checkbox node-key="id" default-expand-all
                 :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
<!--        修改角色-->
      </el-dialog>
      <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        @close="editDialogClose">
        <!--    内容主题区域-->
        <el-form :model="editRole" :rules="addRoleFormRules" ref="editRoleRef"
                 label-width="70px" >
          <el-form-item label-width="100px" label="角色名称" prop="roleName">
            <el-input v-model="editRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label-width="100px"  label="角色描述" prop="roleDesc">
            <el-input  v-model="editRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rolesList: [],
      addDialogVisible: false,
      addRightDialogVisible: false,
      rightsList: [],
      // 默认选中的key值
      defKeys: [],
      // 当前选中的角色ID
      roleId: '',
      //  控制对话框的显示隐藏
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 树形控件的属性绑定对象
      treePop: {
        label: 'authName',
        children: 'children'
      },
      addRoleFormRules: {
        roleName: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'blur'
        },
        //    失去焦点时触发
        {
          min: 2,
          max: 10,
          message: '角色名称长度在3到10长度之间',
          trigger: 'blur'
        }
        ],
        roleDesc: [{
          max: 25,
          message: '用户名描述不能超过25',
          trigger: 'blur'
        }]
      },
      editDialogVisible: false,
      editRole: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) this.$message.error('获取角色列表失败')
      this.$message.success('获取角色列表成功')
      this.rolesList = res.data
    },
    addDialogClose () {
      this.$refs.addRoleRef.resetFields()
      //  也可以通过监听addDialogVisible
      //  if (!this.addDialogVisible) this.$refs.addFormRef.resetFields()
    },
    addRole () {
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return
        //  console.log(valid)
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta !== 201) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏添加对话框
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    async removeRole (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta !== 201) {
          this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getRolesList()
      }
    },
    async removeRights (role, rightId) {
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
          `roles/${role.id}/rights/${rightId}`)
        if (res.meta !== 201) {
          this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        // 删除完后data会返回更新过后的数据
        role.children = res.data
      }
    },
    async showRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.$message.success('获取权限列表成功')
      this.rightsList = res.data
      // 递归获取三级权限的id
      this.getLeafKeys(role, this.defKeys)
      this.addRightDialogVisible = true
    },
    // 通过递归的形式 获取角色下所有三级角色id 并保存 rights是role的children
    getLeafKeys (node, arr) {
      // 如果当前node不包含children属性 使三级权限直接return
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    closeRightDialog () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.addRightDialogVisible = false
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取失败，请稍后再试')
      this.editRole = res.data
      this.editDialogVisible = true
    },
    editRoleInfo () {
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return
        // console.log(valid)
        const { data: res } = await this.$http.put('roles/' + this.editRole.roleId, this.editRole)
        if (res.meta !== 200) {
          this.$message.error('修改失败')
        }
        this.$message.success('修改用户成功')
        // 隐藏添加对话框
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    editDialogClose () {
      this.$refs.editRoleRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
