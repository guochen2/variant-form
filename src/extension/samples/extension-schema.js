export const cardSchema = {
  type: 'card',
  category: 'container',
  icon: 'card',
  widgetList: [],
  options: {
    name: '',
    label: 'card',
    hidden: false,
    folded: false,
    showFold: true,
    cardWidth: '100%',
    shadow: 'never',
    customClass: '',
  }
}

export const alertSchema = {
  type: 'alert',
  icon: 'alert',
  formItemFlag: false,
  options: {
    name: '',
    title: 'Good things are coming...',
    type: 'info',
    description: '',
    closable: true,
    closeText: '',
    center: true,
    showIcon: false,
    effect: 'light',
    hidden: false,
    onClose: '',
    customClass: '',
  }
}


export const wangeditor5Schema = {
  type: 'wangeditor5',
  icon: 'rich-editor-field',
  formItemFlag: true,
  options: {
    name: '',
    label: '',
    placeholder: '请输入内容',
    labelWidth: null,
    labelHidden: false,
    contentHeight: '200px',
    disabled: false,
    hidden: false,
    required: false,
    height: 200,
    requiredHint: '',
    customRule: '',
    customRuleHint: '',
    uploadURL: '/api/file/up-file',
    //-------------------
    //-------------------
    onUploadSuccess: '',
  }
}
