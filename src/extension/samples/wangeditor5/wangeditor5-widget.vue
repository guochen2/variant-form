<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <div style="width:100%;z-index:100;position: relative;">
      <div style="border: 1px solid #ccc">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />
        <Editor
          style="min-height: 200px; overflow-y: hidden;"
          v-model="fieldModel"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
          @onChange="onchange"
        />
      </div>
    </div>
  </form-item-wrapper>
</template>

<script>
  import FormItemWrapper from '@/components/form-designer/form-widget/field-widget/form-item-wrapper'
  import emitter from '@/utils/emitter'
  import i18n from "@/utils/i18n"
  import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin"
  import '@wangeditor/editor/dist/css/style.css' // 引入 css
  // import {  shallowRef } from 'vue'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

import { Loading as ElLoading,Message as ElMessage } from 'element-ui'

  export default {
    name: "wangeditor5-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    mixins: [emitter, fieldMixin, i18n],
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: 'wangeditor5'
      },
    },
    components: {
      Editor, Toolbar,FormItemWrapper
    },
    data(){
      return{
        	editor: null,
          rules: [],
          fieldModel:'',
          editorRef:null,
          toolbarConfig:{},
          editorConfig:{   MENU_CONF: {} },
          mode: 'default',
      }
    },
    created() {
      const that=this
      
      this.editorConfig.placeholder= this.field.options.placeholder
      this.editorConfig.MENU_CONF['uploadImage'] = {
          server: that.field.options.uploadURL?that.field.options.uploadURL:'/api/file/up-file',
          customInsert(res, insertFn) {
            ElLoading.service({ fullscreen: true }).close();
            if (that.field.options.onUploadSuccess) {
              let mountFunc = new Function('result','type', that.field.options.onUploadSuccess)
              res= mountFunc.call(that, res,'img')
            }
            else if(Object.getPrototypeOf(res) === Object.prototype&&res.FilePath){
              res=res.FilePath
            }
           insertFn(res, '', '')
          },
            onBeforeUpload: function(xhr) {
              ElLoading.service({ fullscreen: true })
            },
            onSuccess: function(xhr) {
                ElLoading.service({ fullscreen: true }).close();
            },
            onFailed: function(xhr, editor, resData) {               
                ElLoading.service({ fullscreen: true }).close();
                ElMessage.error('上传失败')
            },
            onError: function(xhr, editor, resData) {
                ElLoading.service({ fullscreen: true }).close();
                ElMessage.error('上传失败')
            }
      }
      this.editorConfig.MENU_CONF['uploadVideo'] = {
        server: that.field.options.uploadURL?that.field.options.uploadURL:'/api/file/up-file',
        customInsert(res, insertFn) {  // TS 语法
          ElLoading.service({ fullscreen: true }).close();
            if (that.field.options.onUploadSuccess) {
              let mountFunc = new Function('result','type', that.field.options.onUploadSuccess)
              res= mountFunc.call(that, res,'video')
            }
            else if(Object.getPrototypeOf(res) === Object.prototype&&res.FilePath){
              res=res.FilePath
            }
            insertFn(res, null)
        },
        onBeforeUpload: function(xhr) {              
          ElLoading.service({ fullscreen: true })
        },
        onSuccess: function(xhr) {
            ElLoading.service({ fullscreen: true }).close();
        },
        onFailed: function(xhr, editor, resData) {               
            ElLoading.service({ fullscreen: true }).close();
            ElMessage.error('上传失败')
        },
        onError: function(xhr, editor, resData) {
            ElLoading.service({ fullscreen: true }).close();
        }
      }
      this.initFieldModel()
      this.registerToRefList()
      this.initEventHandler()
      this.buildFieldRules()

      this.handleOnCreated()
    },
    beforeUnmount() {
      this.unregisterFromRefList()
      const editor = this.editorRef
      if (editor == null) return
      editor.destroy()
      this.unregisterFromRefList()
    },
    mounted(){
      this.initWangeditor()
      // this.handleOnMounted()
    },
		watch:{
      // fieldModel:function(nval){
      //   this.valueHtml=nval;
      // },
      field:{
        handler:function(val){
          // this.editor.config.height = val.options.height; //设置高度无效          
			    if(val.options.disabled){
            this.editorRef.disable() 
          }else{
            this.editorRef.enable()
          }
        },
         deep:true
      }
    },
    methods: {
      handelCloseCustomEvent() {
        if (this.field.options.onClose) {
          let changeFn = new Function(this.field.options.onClose)
          changeFn.call(this)
        }
      },
      initWangeditor(){
          // const that=this
          // this.editorRef = shallowRef()
         
          
      
      // {
      // this.editor = new wangeditor(`#${this.field.id+this.designState}`);
		  // this.editor.config.zIndex = 1;
			// this.editor.config.placeholder = this.field.options.placeholder;
			// this.editor.config.uploadImgShowBase64 = true;
			// this.editor.config.showLinkImg = false;
      // this.editor.config.height = this.field.options.height;
      // this.editor.config.uploadVideoServer = this.field.options.uploadURL?this.field.options.uploadURL:'/api/file/up-file'
      // this.editor.config.uploadImgServer = this.field.options.uploadURL?this.field.options.uploadURL:'/api/file/up-file'
      // this.editor.config.uploadAttrServer = this.field.options.uploadURL?this.field.options.uploadURL:'/api/file/up-file'
      // this.editor.config.uploadVideoHooks = {
      //       customInsert: function(insertVideoFn, result) {
      //          ElLoading.service({ fullscreen: true }).close();
      //           if (!!that.field.options.onUploadSuccess) {
      //             let mountFunc = new Function('result','type', that.field.options.onUploadSuccess)
      //             result= mountFunc.call(that, result,'video')
      //           }
      //           insertVideoFn(result)
      //       }, 
      //       before: function(xhr) {              
      //         ElLoading.service({ fullscreen: true })
      //       },
      //       // 视频上传并返回了结果，视频插入已成功
      //       success: function(xhr) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 视频上传并返回了结果，但视频插入时出错了
      //       fail: function(xhr, editor, resData) {               
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频出错，一般为 http 请求的错误
      //       error: function(xhr, editor, resData) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频超时
      //       timeout: function(xhr) {
      //         ElLoading.service({ fullscreen: true }).close();
      //       }
      //   }
      // this.editor.config.uploadImgHooks  = {
      //       customInsert: function(insertImgFn, result) {
      //          ElLoading.service({ fullscreen: true }).close();
      //           if (!!that.field.options.onUploadSuccess) {
      //             let mountFunc = new Function('result','type', that.field.options.onUploadSuccess)
      //             result= mountFunc.call(that, result,'img')
      //           }
      //           insertImgFn(result)
      //       }, 
      //       before: function(xhr) {
      //          ElLoading.service({ fullscreen: true })
      //       },
      //       // 视频上传并返回了结果，视频插入已成功
      //       success: function(xhr) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 视频上传并返回了结果，但视频插入时出错了
      //       fail: function(xhr, editor, resData) {               
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频出错，一般为 http 请求的错误
      //       error: function(xhr, editor, resData) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频超时
      //       timeout: function(xhr) {
      //         ElLoading.service({ fullscreen: true }).close();
      //       }
      //   }
        
      // this.editor.config.uploadAttrHooks = {
      //       customInsert: function (insertAttrFn, result, editor) {
      //          ElLoading.service({ fullscreen: true }).close();
      //            if (!!that.field.options.onUploadSuccess) {
      //             let mountFunc = new Function('result','type', that.field.options.onUploadSuccess)
      //             result= mountFunc.call(that, result,'attr')
      //           }
      //           insertAttrFn(editor, result)
      //       }, 
      //       before: function(xhr) {              
      //        ElLoading.service({ fullscreen: true })
      //       },
      //       // 视频上传并返回了结果，视频插入已成功
      //       success: function(xhr) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 视频上传并返回了结果，但视频插入时出错了
      //       fail: function(xhr, editor, resData) {               
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频出错，一般为 http 请求的错误
      //       error: function(xhr, editor, resData) {
      //          ElLoading.service({ fullscreen: true }).close();
      //       },
      //       // 上传视频超时
      //       timeout: function(xhr) {
      //         ElLoading.service({ fullscreen: true }).close();
      //       }
      //   }
			// this.onWangeditorChange();
			// this.editor.create();
			// this.editor.txt.html(this.fieldModel);
			// this.field.options.disabled ? this.editor.disable() : this.editor.enable();
      // fileMenu(this.editor, document.getElementById(`${this.field.id+this.designState}`))
      // }
      },
      onchange(editor){
          const that=this
          const html=editor.getHtml()
              that.$emit('update:fieldModel', html);
              this.syncUpdateFormModel(html)
         
        },
      handleCreated(editor){
        this.editorRef = Object.seal(editor) 
        if(this.field.options.disabled){
        this.editorRef.disable() 
      }else{
        this.editorRef.enable()
      } 
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
 