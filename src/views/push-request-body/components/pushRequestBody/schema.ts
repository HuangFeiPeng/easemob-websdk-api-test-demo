export type VendorId =
  | 'easemob'
  | 'apns'
  | 'fcm'
  | 'fcmV1'
  | 'xiaomi'
  | 'vivo'
  | 'oppo'
  | 'meizu'
  | 'huawei'
  | 'honor'
  | 'harmonyOS';

export type PushFieldType =
  | 'text'
  | 'textarea'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'select'
  | 'string-list'
  | 'json-object'
  | 'json-array';

export type PushOptionValue = string | number | boolean;

export interface PushSelectOption {
  label: string;
  value: PushOptionValue;
}

export interface RequiredWhen {
  path: string;
  equals: PushOptionValue[];
}

export interface PushFieldSchema {
  path: string;
  label: string;
  type: PushFieldType;
  help?: string;
  group?: string;
  placeholder?: string;
  options?: PushSelectOption[];
  min?: number;
  max?: number;
  maxLength?: number;
  maxItems?: number;
  maxKeys?: number;
  required?: boolean;
  requiredWhen?: RequiredWhen;
  source?: 'official' | 'attachment';
  advanced?: boolean;
  defaultValue?: unknown;
}

export interface PushVendorSchema {
  key: VendorId;
  label: string;
  description: string;
  fields: PushFieldSchema[];
}

export type PushFormValues = Record<string, unknown>;
export type PushOutputMode = 'full' | 'pushMessage';

export interface PushGeneratorInput {
  outputMode: PushOutputMode;
  targets: string[];
  strategy: number;
  basicValues: PushFormValues;
  selectedVendors: VendorId[];
  vendorValues: Partial<Record<VendorId, PushFormValues>>;
}

export interface ValidationIssue {
  vendor?: VendorId | 'basic';
  path: string;
  message: string;
}

type FieldExtras = Partial<
  Omit<PushFieldSchema, 'path' | 'label' | 'type' | 'advanced'>
>;

const field = (
  path: string,
  label: string,
  type: PushFieldType = 'text',
  extras: FieldExtras = {},
): PushFieldSchema => ({
  path,
  label,
  type,
  advanced: true,
  ...extras,
});

const common = (
  path: string,
  label: string,
  type: PushFieldType = 'text',
  extras: FieldExtras = {},
): PushFieldSchema => ({
  ...field(path, label, type, extras),
  advanced: false,
});

const options = (values: PushOptionValue[]): PushSelectOption[] =>
  values.map((value) => ({ label: String(value), value }));

export const BASIC_PUSH_FIELDS: PushFieldSchema[] = [
  common('title', '通知标题', 'text', {
    help: '通知栏展示的标题，最多 32 个字符。',
    defaultValue: '环信推送服务',
    required: true,
    maxLength: 32,
  }),
  common('content', '通知内容', 'textarea', {
    help: '通知栏展示的内容，最多 100 个字符。',
    defaultValue: '你好，欢迎使用环信推送服务',
    required: true,
    maxLength: 100,
  }),
  field('subTitle', '通知副标题', 'text', {
    help: '主要用于 iOS，最多 10 个字符。',
    maxLength: 10,
  }),
  field('ext', '自定义扩展', 'json-object', {
    help: '自定义 key-value，最多 10 个键，整体不超过 1024 字符。',
    placeholder: '{"key1":"value1"}',
    maxKeys: 10,
    maxLength: 1024,
  }),
  field('config.clickAction.url', '点击后打开 URL', 'text', {
    group: '点击与角标',
    placeholder: 'https://www.easemob.com',
  }),
  field('config.clickAction.action', '点击后打开指定页面 Action', 'text', {
    group: '点击与角标',
  }),
  field('config.clickAction.activity', '点击后打开 Activity', 'text', {
    group: '点击与角标',
  }),
  field('config.badge.addNum', '角标累加值', 'integer', {
    group: '点击与角标',
  }),
  field('config.badge.setNum', '角标设置值', 'integer', {
    group: '点击与角标',
  }),
  field('config.badge.activity', '角标入口 Activity', 'text', {
    group: '点击与角标',
    help: '华为角标需要配置应用入口类。',
  }),
];

export const PUSH_VENDOR_SCHEMAS: PushVendorSchema[] = [
  {
    key: 'easemob',
    label: '环信通道',
    description: '环信自有推送通道的通知展示、点击和角标配置。',
    fields: [
      common('title', '覆盖通知标题'),
      common('content', '覆盖通知内容', 'textarea'),
      common('needNotification', '弹出通知', 'boolean', {
        help: 'false 表示透传消息。',
      }),
      common('operation.type', '点击动作类型', 'select', {
        group: '点击操作',
        options: options([0, 1, 2]),
        help: '0 启动应用；1 打开 URL；2 打开指定页面。',
      }),
      common('operation.openUrl', '点击后打开 URL', 'text', {
        group: '点击操作',
        requiredWhen: { path: 'operation.type', equals: [1] },
      }),
      common('operation.openAction', '指定页面 Action', 'text', {
        group: '点击操作',
        requiredWhen: { path: 'operation.type', equals: [2] },
      }),
      common('channelId', '通知渠道 ID', 'text', {
        group: 'Android 渠道',
        placeholder: 'chat',
      }),
      field('subTitle', '覆盖通知副标题'),
      field('iconUrl', '通知图标 URL', 'text', {
        placeholder: 'https://example.com/icon.png',
      }),
      field('badge.setNum', '角标设置值', 'integer', { group: '角标' }),
      field('badge.addNum', '角标累加值', 'integer', { group: '角标' }),
      field('badge.activity', '角标入口 Activity', 'text', { group: '角标' }),
      field('channelName', '通知渠道名称', 'text', {
        group: 'Android 渠道',
        placeholder: '消息',
      }),
      field('channelLevel', '通知渠道级别', 'select', {
        group: 'Android 渠道',
        options: options([0, 3, 4]),
      }),
      field('autoCancel', '点击后自动关闭通知', 'select', {
        group: 'Android 渠道',
        options: options([0, 1]),
      }),
      field('expiresTime', '过期时间戳（毫秒）', 'integer', {
        help: 'Unix 毫秒时间戳，请勿直接沿用历史示例值。',
      }),
      field('sound', '声音提醒', 'select', { options: options([0, 1]) }),
      field('vibrate', '振动提醒', 'select', { options: options([0, 1]) }),
      field('style', '展示样式', 'select', {
        group: '富文本',
        options: options([0, 1, 2]),
        help: '0 普通；1 大文本；2 大图片。',
      }),
      field('bigTxt', '大文本内容', 'textarea', {
        group: '富文本',
        requiredWhen: { path: 'style', equals: [1] },
      }),
      field('bigPicture', '大图片 URL', 'text', {
        group: '富文本',
        requiredWhen: { path: 'style', equals: [2] },
      }),
      field('id', '通知 ID', 'integer', {
        help: '相同 ID 的新通知会覆盖旧通知。',
      }),
    ],
  },
  {
    key: 'apns',
    label: 'APNs',
    description: 'Apple 推送通知服务，包括普通通知和实时活动。',
    fields: [
      common('title', '覆盖通知标题'),
      common('content', '覆盖通知内容', 'textarea'),
      common('badge', '应用角标', 'integer'),
      common('sound', '通知铃声', 'text', {
        placeholder: 'default 或 test.caf',
        help: '自定义铃声需放在 App 的 /Library/Sounds 目录。',
      }),
      field('invalidationTime', '推送过期时间间隔（毫秒）', 'integer'),
      field('priority', '推送优先级', 'select', { options: options([5, 10]) }),
      field('pushType', '推送展示类型', 'select', {
        options: options(['background', 'alert']),
      }),
      field('collapseId', '通知折叠 ID'),
      field('apnsId', 'APNs 通知唯一标识'),
      field('mutableContent', '开启通知扩展', 'boolean'),
      field('contentAvailable', '后台更新通知', 'boolean'),
      field('categoryName', '通知类别'),
      field('threadId', '通知分组 ID'),
      field('subTitle', '覆盖通知副标题'),
      field('titleLocKey', '标题本地化键', 'text', { group: '本地化' }),
      field('titleLocArgs', '标题本地化参数', 'string-list', {
        group: '本地化',
      }),
      field('subTitleLocKey', '副标题本地化键', 'text', { group: '本地化' }),
      field('subTitleLocArgs', '副标题本地化参数', 'string-list', {
        group: '本地化',
      }),
      field('bodyLocKey', '正文本地化键', 'text', { group: '本地化' }),
      field('bodyLocArgs', '正文本地化参数', 'string-list', {
        group: '本地化',
      }),
      field('ext', 'APNs 自定义扩展', 'json-object', {
        placeholder: '{"key1":"value1"}',
      }),
      field('launchImage', '启动图像文件名'),
      field('interruptionLevel', '中断等级', 'select', {
        group: '实时活动与展示',
        options: options(['ACTIVE', 'CRITICAL', 'PASSIVE', 'TIME_SENSITIVE']),
      }),
      field('liveActivityEvent', '实时活动事件', 'select', {
        group: '实时活动与展示',
        options: options(['START', 'UPDATE', 'END']),
      }),
      field('timestamp', '实时活动时间戳（秒）', 'integer', {
        group: '实时活动与展示',
      }),
      field('dismissalDate', '实时活动解除时间戳（秒）', 'integer', {
        group: '实时活动与展示',
      }),
      field('staleDate', '实时活动过期时间戳（秒）', 'integer', {
        group: '实时活动与展示',
      }),
      field('attributesType', '实时活动动态数据类型', 'text', {
        group: '实时活动与展示',
      }),
      field('attributes', '实时活动动态数据', 'json-object', {
        group: '实时活动与展示',
      }),
      field('contentState', '实时活动内容状态', 'json-object', {
        group: '实时活动与展示',
      }),
    ],
  },
  {
    key: 'fcm',
    label: 'FCM（Legacy）',
    description: 'Firebase Cloud Messaging Legacy 配置。',
    fields: [
      common('priority', '消息优先级', 'select', {
        options: options(['normal', 'high']),
      }),
      common('timeToLive', '离线保留时长（秒）', 'text', {
        placeholder: '86400',
      }),
      common('notification.title', 'Android 通知标题', 'text', {
        group: 'Android 通知',
      }),
      common('notification.body', 'Android 通知内容', 'textarea', {
        group: 'Android 通知',
      }),
      common('notification.androidChannelId', 'Android 通知渠道 ID', 'text', {
        group: 'Android 通知',
      }),
      common('notification.clickAction', '通知点击 Action', 'text', {
        group: 'Android 通知',
      }),
      field('condition', '消息目标条件表达式'),
      field('collapseKey', '消息折叠键'),
      field('dryRun', '测试消息（不实际下发）', 'boolean'),
      field('restrictedPackageName', '接收应用包名'),
      field('data', '自定义数据', 'json-object', {
        placeholder: '{"key1":"value1"}',
      }),
      field('notification.icon', '通知图标', 'text', { group: 'Android 通知' }),
      field('notification.sound', '通知铃声', 'text', {
        group: 'Android 通知',
      }),
      field('notification.tag', '通知替换标识', 'text', {
        group: 'Android 通知',
      }),
      field('notification.color', '通知图标颜色', 'text', {
        group: 'Android 通知',
        placeholder: '#00AEEF',
      }),
      field('notification.titleLocKey', '标题本地化键', 'text', {
        group: '本地化',
      }),
      field('notification.titleLocArgs', '标题本地化参数', 'string-list', {
        group: '本地化',
      }),
      field('notification.bodyLocKey', '正文本地化键', 'text', {
        group: '本地化',
      }),
      field('notification.bodyLocArgs', '正文本地化参数', 'string-list', {
        group: '本地化',
      }),
    ],
  },
  {
    key: 'fcmV1',
    label: 'FCM V1',
    description:
      'Firebase Cloud Messaging V1，可分别配置 Android、Web 和 APNs。',
    fields: [
      common('type', '推送通知类型', 'select', {
        options: options(['BOTH', 'DATA', 'NOTIFICATION']),
      }),
      common('notification.title', '通知标题', 'text', { group: '通用通知' }),
      common('notification.body', '通知内容', 'textarea', {
        group: '通用通知',
      }),
      common('androidConfig.priority', 'Android 优先级', 'select', {
        group: 'Android 配置',
        options: options(['NORMAL', 'HIGH']),
      }),
      common('androidConfig.ttl', 'Android 离线保留时长', 'text', {
        group: 'Android 配置',
        placeholder: '86400s',
      }),
      common(
        'androidConfig.androidNotification.channelId',
        'Android 渠道 ID',
        'text',
        {
          group: 'Android 配置',
        },
      ),
      common(
        'androidConfig.androidNotification.clickAction',
        'Android 点击 Action',
        'text',
        {
          group: 'Android 配置',
        },
      ),
      field('data', '自定义数据', 'json-object'),
      field('notification.image', '通知图片 URL', 'text', {
        group: '通用通知',
      }),
      field('androidConfig.collapseKey', 'Android 折叠键', 'text', {
        group: 'Android 配置',
      }),
      field('androidConfig.directBootOk', '允许直接启动模式投递', 'boolean', {
        group: 'Android 配置',
      }),
      field(
        'androidConfig.androidNotification.title',
        '覆盖 Android 标题',
        'text',
        {
          group: 'Android 配置',
        },
      ),
      field(
        'androidConfig.androidNotification.body',
        '覆盖 Android 内容',
        'textarea',
        {
          group: 'Android 配置',
        },
      ),
      field('androidConfig.androidNotification.icon', 'Android 图标', 'text', {
        group: 'Android 配置',
      }),
      field(
        'androidConfig.androidNotification.color',
        'Android 图标颜色',
        'text',
        {
          group: 'Android 配置',
          placeholder: '#00AEEF',
        },
      ),
      field('androidConfig.androidNotification.sound', 'Android 铃声', 'text', {
        group: 'Android 配置',
      }),
      field(
        'androidConfig.androidNotification.tag',
        'Android 替换标识',
        'text',
        {
          group: 'Android 配置',
        },
      ),
      field(
        'androidConfig.androidNotification.image',
        'Android 图片 URL',
        'text',
        {
          group: 'Android 配置',
        },
      ),
      field(
        'androidConfig.androidNotification.bodyLocKey',
        '正文本地化键',
        'text',
        {
          group: 'Android 本地化',
        },
      ),
      field(
        'androidConfig.androidNotification.bodyLocArgs',
        '正文本地化参数',
        'string-list',
        {
          group: 'Android 本地化',
        },
      ),
      field(
        'androidConfig.androidNotification.titleLocKey',
        '标题本地化键',
        'text',
        {
          group: 'Android 本地化',
        },
      ),
      field(
        'androidConfig.androidNotification.titleLocArgs',
        '标题本地化参数',
        'string-list',
        {
          group: 'Android 本地化',
        },
      ),
      field('webPushConfig.headers', 'Web Push Headers', 'json-object', {
        group: 'Web 配置',
      }),
      field('webPushConfig.notification.title', 'Web 通知标题', 'text', {
        group: 'Web 配置',
      }),
      field('webPushConfig.notification.body', 'Web 通知内容', 'textarea', {
        group: 'Web 配置',
      }),
      field('webPushConfig.notification.image', 'Web 通知图片 URL', 'text', {
        group: 'Web 配置',
      }),
      field('apnsConfig.headers', 'APNs Headers', 'json-object', {
        group: 'APNs 配置',
        placeholder: '{"apns-push-type":"alert","apns-priority":"10"}',
      }),
      field('apnsConfig.payload', 'APNs Payload', 'json-object', {
        group: 'APNs 配置',
        placeholder: '{"aps":{"alert":{"title":"标题","body":"内容"}}}',
      }),
      field('options', '自定义推送选项', 'json-object'),
      field('condition', '推送条件表达式'),
    ],
  },
  {
    key: 'xiaomi',
    label: '小米',
    description: '小米通道、私信模板、点击跳转和回调配置。',
    fields: [
      common('title', '通知标题', 'text', { maxLength: 50 }),
      common('description', '通知内容', 'textarea', { maxLength: 128 }),
      common('channelId', '通知渠道 ID', 'text', {
        help: '填写小米推送平台申请的渠道 ID，不要保留 {{xiaomi_channel_id}} 占位符。',
        placeholder: '填写小米平台申请的 channel id',
      }),
      common('templateId', '私信模板 ID', 'text', {
        source: 'attachment',
        help: '附件补充字段，需按你的小米模板和环信联调结果确认。',
      }),
      common('templateParam', '私信模板参数', 'json-object', {
        source: 'attachment',
        placeholder: '{"keywords1":"k1"}',
        help: '附件补充字段，参数名和个数需与小米平台模板一致。',
      }),
      common('notifyEffect', '通知点击行为', 'select', {
        group: '点击跳转',
        options: options(['1', '2', '3']),
        help: '1 启动应用；2 打开 Activity；3 打开网页。',
      }),
      common('intentUri', 'Activity Intent URI', 'text', {
        group: '点击跳转',
        requiredWhen: { path: 'notifyEffect', equals: ['2'] },
        placeholder: 'intent:#Intent;action=xxxx;end',
      }),
      common('webUri', '点击后打开网页', 'text', {
        group: '点击跳转',
        requiredWhen: { path: 'notifyEffect', equals: ['3'] },
        placeholder: 'https://www.easemob.com',
      }),
      field('restrictedPackageNames', '接收应用包名'),
      field('passThrough', '消息类型', 'select', {
        options: options([0, 1]),
        help: '0 通知栏消息；1 透传消息。',
      }),
      field('payload', '通知自定义内容', 'json-object'),
      field('notifyType', '通知方式', 'select', {
        options: options([-1, 1, 2, 4]),
      }),
      field('timeToLive', '离线保留时长（毫秒）', 'integer'),
      field('timeToSend', '定时发送时间戳（毫秒）', 'integer'),
      field('notifyId', '通知覆盖 ID', 'integer'),
      field('sound', '自定义铃声 URI', 'text', {
        placeholder: 'android.resource://包名/raw/shaking',
      }),
      field('ticker', '状态栏滚动文本'),
      field('notifyForeground', '前台通知开关', 'select', {
        options: options(['0', '1']),
      }),
      field('flowControl', '平缓发送控制', 'integer'),
      field('jobkey', '消息聚合键'),
      field('callbackUrl', '回调地址', 'text', { group: '回调' }),
      field('callbackParam', '回调参数', 'text', { group: '回调' }),
      field('callbackType', '回调类型', 'select', {
        group: '回调',
        options: options([1, 2, 3, 16, 32, 64, 128, 1024]),
      }),
      field('locale', '可接收语言范围', 'text', { group: '目标过滤' }),
      field('localeNotIn', '排除语言范围', 'text', { group: '目标过滤' }),
      field('model', '可接收机型范围', 'text', { group: '目标过滤' }),
      field('modelNotIn', '排除机型范围', 'text', { group: '目标过滤' }),
      field('appVersion', '可接收 App 版本', 'text', { group: '目标过滤' }),
      field('appVersionNotIn', '排除 App 版本', 'text', { group: '目标过滤' }),
      field('connpt', '指定网络环境', 'text', {
        group: '目标过滤',
        placeholder: 'wifi',
      }),
      field('onlySendOnce', '仅在线时发送一次', 'select', {
        options: options(['0', '1']),
      }),
    ],
  },
  {
    key: 'vivo',
    label: 'vivo',
    description: 'vivo 消息分类、点击跳转和回调配置。',
    fields: [
      common('title', '通知标题', 'text', { maxLength: 40 }),
      common('content', '通知内容', 'textarea', { maxLength: 100 }),
      common('classification', '消息类型', 'select', {
        options: options([0, 1]),
        help: '0 运营消息；1 系统消息。与 category 同时使用时需保持对应。',
      }),
      common('category', '二级分类', 'text', {
        placeholder: 'IM',
        help: '请填写 vivo 二级分类标准中的大写值。',
      }),
      common('skipType', '点击跳转类型', 'select', {
        group: '点击跳转',
        options: options([1, 2, 3, 4]),
      }),
      common('skipContent', '跳转内容', 'text', {
        group: '点击跳转',
        help: '打开链接时填 URL；打开 App 内页时按 intent 格式填写。',
      }),
      field('notifyType', '通知方式', 'select', {
        options: options([1, 2, 3, 4]),
      }),
      field('timeToLive', '消息保留时长（秒）', 'integer'),
      field('networkType', '网络方式', 'select', { options: options([-1, 1]) }),
      field('clientCustomMap', '客户端自定义键值对', 'json-object'),
      field('requestId', '用户请求唯一标识', 'text', { maxLength: 64 }),
      field('pushMode', '推送模式', 'select', { options: options([0, 1]) }),
      field('extra.callback', '回调 URL', 'text', {
        group: '回调',
        maxLength: 128,
      }),
      field('extra.callbackParam', '回调参数', 'text', {
        group: '回调',
        maxLength: 64,
      }),
      field('notifyId', '通知覆盖 ID', 'integer', {
        min: 1,
        max: 2147483647,
      }),
      field('profileId', '终端登录用户标识', 'text', { maxLength: 64 }),
      field('sendOnline', '仅在线直推', 'boolean'),
    ],
  },
  {
    key: 'oppo',
    label: 'OPPO',
    description: 'OPPO 渠道、消息分类和点击动作配置。',
    fields: [
      common('title', '通知标题', 'text', { maxLength: 32 }),
      common('content', '通知内容', 'textarea', { maxLength: 200 }),
      common('channelId', '通知渠道 ID', 'text', {
        placeholder: '填写 OPPO 平台申请的 channel id',
        help: '不要保留 {{oppo_channel_id}} 占位符。',
      }),
      common('category', '通道类别', 'text', {
        help: '使用 notifyLevel 时必须填写。',
      }),
      common('notifyLevel', '通知提醒等级', 'select', {
        options: options(['1', '2', '16']),
      }),
      common('clickActionType', '点击动作类型', 'select', {
        group: '点击动作',
        options: options([0, 1, 2, 4, 5]),
        help: '0 启动应用；1/4 打开应用内页；2 打开网页；5 Intent scheme URL。',
      }),
      common('clickActionActivity', '应用内页 Activity', 'text', {
        group: '点击动作',
        requiredWhen: { path: 'clickActionType', equals: [1, 4] },
        maxLength: 500,
      }),
      common('clickActionUrl', '网页或 Intent scheme URL', 'text', {
        group: '点击动作',
        requiredWhen: { path: 'clickActionType', equals: [2, 5] },
        maxLength: 500,
      }),
      field('subTitle', '通知副标题'),
      field('appMessageId', '应用消息去重 ID'),
      field('style', '通知栏样式', 'select', { options: options([1, 2, 3]) }),
      field('actionParameters', '点击动作参数', 'json-object', {
        group: '点击动作',
      }),
      field('offLine', '进入离线消息', 'boolean'),
      field('offLineTtl', '离线保存时长（秒）', 'integer'),
      field('timeZone', '时区', 'text', { placeholder: 'GMT+08:00' }),
      field('callBackUrl', '回调地址', 'text', { group: '回调' }),
      field('callBackParameter', '回调参数', 'text', { group: '回调' }),
      field('showTtl', '限时展示（秒）', 'integer'),
      field('notifyId', '通知覆盖 ID', 'integer'),
    ],
  },
  {
    key: 'meizu',
    label: '魅族',
    description: '魅族消息分类、展开文本和点击动作配置。',
    fields: [
      common('title', '通知标题', 'text', { maxLength: 32 }),
      common('content', '通知内容', 'textarea', { maxLength: 100 }),
      common('noticeMsgType', '消息分类', 'select', {
        options: options([0, 1]),
        help: '0 公信消息；1 私信消息。',
      }),
      common('clickType', '点击动作', 'select', {
        group: '点击动作',
        options: options([0, 1, 2, 3]),
      }),
      common('url', 'H5 页面地址', 'text', {
        group: '点击动作',
        requiredWhen: { path: 'clickType', equals: [2] },
      }),
      common('activity', '应用页面 Activity', 'text', {
        group: '点击动作',
        requiredWhen: { path: 'clickType', equals: [1] },
      }),
      common('customAttribute', '客户端自定义内容', 'text', {
        group: '点击动作',
        requiredWhen: { path: 'clickType', equals: [3] },
      }),
      field('noticeExpandType', '展开方式', 'select', {
        group: '展开内容',
        options: options([0, 1]),
      }),
      field('noticeExpandContent', '展开文本内容', 'textarea', {
        group: '展开内容',
        requiredWhen: { path: 'noticeExpandType', equals: [1] },
      }),
      field('parameters', '点击动作参数', 'json-object', { group: '点击动作' }),
      field('isOffLine', '进入离线消息', 'boolean'),
      field('validTime', '有效时长（小时）', 'integer'),
      field('isSuspend', '通知栏悬浮显示', 'boolean'),
      field('isClearNoticeBar', '允许清除通知栏', 'boolean'),
      field('isFixDisplay', '定时展示', 'boolean', { group: '定时展示' }),
      field('fixStartDisplayDate', '定时展示开始时间', 'text', {
        group: '定时展示',
        help: '按厂商要求的日期字符串格式填写。',
      }),
      field('fixEndDisplayDate', '定时展示结束时间', 'text', {
        group: '定时展示',
      }),
      field('vibrate', '振动提醒', 'boolean'),
      field('lights', '闪光提醒', 'boolean'),
      field('sound', '声音提醒', 'boolean'),
      field('notifyKey', '通知分组合并键'),
      field('callback', '回调 URL', 'text', { group: '回调', maxLength: 128 }),
      field('callbackParam', '回调参数', 'text', {
        group: '回调',
        maxLength: 64,
      }),
      field('callbackType', '回执类型', 'select', {
        group: '回调',
        options: options(['1', '2', '3']),
      }),
    ],
  },
  {
    key: 'huawei',
    label: '华为',
    description: '华为 Push Kit 消息、Android 通知、点击行为和角标配置。',
    fields: [
      common('message.notification.title', '通知标题', 'text', {
        group: '通用通知',
      }),
      common('message.notification.body', '通知内容', 'textarea', {
        group: '通用通知',
      }),
      common('message.android.category', '消息分类', 'text', {
        group: 'Android 配置',
        placeholder: 'IM',
      }),
      common('message.android.targetUserType', '推送用户类型', 'select', {
        group: 'Android 配置',
        options: options([0, 1]),
        help: '1 为测试消息，仅供测试推送收发使用。',
      }),
      common('message.android.receiptId', '回执 ID', 'text', {
        group: 'Android 配置',
      }),
      common('message.android.notification.channelId', '通知渠道 ID', 'text', {
        group: 'Android 通知',
      }),
      common(
        'message.android.notification.importance',
        '通知消息分类',
        'select',
        {
          group: 'Android 通知',
          options: options(['LOW', 'NORMAL']),
        },
      ),
      common(
        'message.android.notification.clickAction.type',
        '点击行为类型',
        'select',
        {
          group: '点击行为',
          options: options([1, 2, 3]),
          help: '1 自定义页面；2 打开 URL；3 打开应用。',
        },
      ),
      common(
        'message.android.notification.clickAction.intent',
        '页面 Intent',
        'text',
        {
          group: '点击行为',
        },
      ),
      common(
        'message.android.notification.clickAction.url',
        '点击后打开 URL',
        'text',
        {
          group: '点击行为',
          requiredWhen: {
            path: 'message.android.notification.clickAction.type',
            equals: [2],
          },
        },
      ),
      common(
        'message.android.notification.clickAction.action',
        '页面 Action',
        'text',
        {
          group: '点击行为',
        },
      ),
      common('message.android.notification.style', '通知栏样式', 'select', {
        group: '富文本',
        options: options([0, 1, 3]),
      }),
      common(
        'message.android.notification.inboxContent',
        'Inbox 多行内容',
        'string-list',
        {
          group: '富文本',
          requiredWhen: {
            path: 'message.android.notification.style',
            equals: [3],
          },
          maxItems: 5,
        },
      ),
      field('validateOnly', '仅校验（不实际下发）', 'boolean'),
      field('message.data', '自定义消息负载', 'json-object'),
      field('message.notification.image', '通知右侧图片 URL', 'text', {
        group: '通用通知',
      }),
      field('message.android.collapseKey', '离线消息折叠键', 'integer', {
        group: 'Android 配置',
      }),
      field('message.android.urgency', '透传消息投递优先级', 'text', {
        group: 'Android 配置',
      }),
      field('message.android.ttl', '消息缓存时间', 'text', {
        group: 'Android 配置',
        placeholder: '86400s',
      }),
      field('message.android.biTag', '批量任务消息标识', 'text', {
        group: 'Android 配置',
      }),
      field('message.android.fastAppTargetType', '快应用模式', 'select', {
        group: 'Android 配置',
        options: options([1, 2]),
      }),
      field('message.android.data', '覆盖自定义消息负载', 'textarea', {
        group: 'Android 配置',
      }),
      field('message.android.notification.title', '覆盖 Android 标题', 'text', {
        group: 'Android 通知',
      }),
      field(
        'message.android.notification.body',
        '覆盖 Android 内容',
        'textarea',
        {
          group: 'Android 通知',
        },
      ),
      field('message.android.notification.icon', '左侧小图标', 'text', {
        group: 'Android 通知',
      }),
      field('message.android.notification.color', '按钮颜色', 'text', {
        group: 'Android 通知',
      }),
      field('message.android.notification.sound', '自定义铃声', 'text', {
        group: 'Android 通知',
      }),
      field(
        'message.android.notification.defaultSound',
        '使用默认铃声',
        'boolean',
        {
          group: 'Android 通知',
        },
      ),
      field('message.android.notification.tag', '通知替换标签', 'text', {
        group: 'Android 通知',
      }),
      field('message.android.notification.bodyLocKey', '正文本地化键', 'text', {
        group: '本地化',
      }),
      field(
        'message.android.notification.bodyLocArgs',
        '正文本地化参数',
        'string-list',
        {
          group: '本地化',
        },
      ),
      field(
        'message.android.notification.titleLocKey',
        '标题本地化键',
        'text',
        {
          group: '本地化',
        },
      ),
      field(
        'message.android.notification.titleLocArgs',
        '标题本地化参数',
        'string-list',
        {
          group: '本地化',
        },
      ),
      field(
        'message.android.notification.multiLangKey',
        '多语言参数',
        'json-array',
        {
          group: '本地化',
        },
      ),
      field(
        'message.android.notification.notifySummary',
        '通知简要描述',
        'text',
        {
          group: 'Android 通知',
        },
      ),
      field('message.android.notification.image', 'Android 图片 URL', 'text', {
        group: 'Android 通知',
      }),
      field('message.android.notification.bigTitle', '大文本标题', 'text', {
        group: '富文本',
      }),
      field('message.android.notification.bigBody', '大文本内容', 'textarea', {
        group: '富文本',
      }),
      field(
        'message.android.notification.autoClear',
        '自动清除时长（毫秒）',
        'integer',
        {
          group: 'Android 通知',
        },
      ),
      field('message.android.notification.notifyId', '通知覆盖 ID', 'integer', {
        group: 'Android 通知',
      }),
      field('message.android.notification.group', '通知分组', 'text', {
        group: 'Android 通知',
      }),
      field(
        'message.android.notification.badge.addNum',
        '角标累加值',
        'integer',
        {
          group: '角标',
          min: 1,
          max: 99,
        },
      ),
      field(
        'message.android.notification.badge.badgeClass',
        '入口 Activity 类',
        'text',
        {
          group: '角标',
        },
      ),
      field(
        'message.android.notification.badge.setNum',
        '角标设置值',
        'integer',
        {
          group: '角标',
          min: 0,
          max: 99,
        },
      ),
      field(
        'message.android.notification.autoCancel',
        '点击后取消通知',
        'boolean',
        {
          group: 'Android 通知',
        },
      ),
      field('message.android.notification.when', '通知排序时间', 'text', {
        group: 'Android 通知',
      }),
      field(
        'message.android.notification.useDefaultVibrate',
        '使用默认振动',
        'boolean',
        {
          group: '提醒方式',
        },
      ),
      field(
        'message.android.notification.useDefaultLight',
        '使用默认呼吸灯',
        'boolean',
        {
          group: '提醒方式',
        },
      ),
      field(
        'message.android.notification.vibrateConfig',
        '自定义振动模式',
        'textarea',
        {
          group: '提醒方式',
        },
      ),
      field('message.android.notification.visibility', '锁屏可见性', 'select', {
        group: '提醒方式',
        options: options([
          'VISIBILITY_UNSPECIFIED',
          'PUBLIC',
          'SECRET',
          'PRIVATE',
        ]),
      }),
      field(
        'message.android.notification.lightSettings.color.alpha',
        '呼吸灯 Alpha',
        'number',
        {
          group: '呼吸灯',
          min: 0,
          max: 1,
        },
      ),
      field(
        'message.android.notification.lightSettings.color.red',
        '呼吸灯 Red',
        'number',
        {
          group: '呼吸灯',
          min: 0,
          max: 1,
        },
      ),
      field(
        'message.android.notification.lightSettings.color.green',
        '呼吸灯 Green',
        'number',
        {
          group: '呼吸灯',
          min: 0,
          max: 1,
        },
      ),
      field(
        'message.android.notification.lightSettings.color.blue',
        '呼吸灯 Blue',
        'number',
        {
          group: '呼吸灯',
          min: 0,
          max: 1,
        },
      ),
      field(
        'message.android.notification.lightSettings.lightOnDuration',
        '呼吸灯点亮间隔',
        'text',
        {
          group: '呼吸灯',
        },
      ),
      field(
        'message.android.notification.lightSettings.lightOffDuration',
        '呼吸灯熄灭间隔',
        'text',
        {
          group: '呼吸灯',
        },
      ),
      field(
        'message.android.notification.foregroundShow',
        '前台显示通知',
        'boolean',
        {
          group: 'Android 通知',
        },
      ),
      field(
        'message.android.notification.buttons',
        '通知动作按钮',
        'json-array',
        {
          group: '动作按钮',
          maxItems: 3,
          placeholder: '[{"name":"打开应用","actionType":0}]',
        },
      ),
      field('review', '第三方审核结果', 'json-object'),
    ],
  },
  {
    key: 'honor',
    label: '荣耀',
    description: '荣耀 Android 通知、点击行为、样式和角标配置。',
    fields: [
      common('androidConfig.androidNotification.title', '通知标题'),
      common('androidConfig.androidNotification.body', '通知内容', 'textarea'),
      common(
        'androidConfig.androidNotification.importance',
        '通知消息分类',
        'select',
        {
          options: options(['LOW', 'NORMAL']),
        },
      ),
      common(
        'androidConfig.androidNotification.clickAction.type',
        '点击行为类型',
        'select',
        {
          group: '点击行为',
          options: options([1, 2, 3]),
        },
      ),
      common(
        'androidConfig.androidNotification.clickAction.intent',
        '页面 Intent',
        'text',
        {
          group: '点击行为',
        },
      ),
      common(
        'androidConfig.androidNotification.clickAction.url',
        '点击后打开 URL',
        'text',
        {
          group: '点击行为',
          requiredWhen: {
            path: 'androidConfig.androidNotification.clickAction.type',
            equals: [2],
          },
        },
      ),
      common(
        'androidConfig.androidNotification.clickAction.action',
        '页面 Action',
        'text',
        {
          group: '点击行为',
        },
      ),
      common(
        'androidConfig.androidNotification.style',
        '通知栏样式',
        'select',
        {
          group: '富文本',
          options: options([0, 1]),
        },
      ),
      common(
        'androidConfig.androidNotification.bigTitle',
        '大文本标题',
        'text',
        {
          group: '富文本',
          requiredWhen: {
            path: 'androidConfig.androidNotification.style',
            equals: [1],
          },
        },
      ),
      common(
        'androidConfig.androidNotification.bigBody',
        '大文本内容',
        'textarea',
        {
          group: '富文本',
          requiredWhen: {
            path: 'androidConfig.androidNotification.style',
            equals: [1],
          },
        },
      ),
      field('data', '自定义消息负载', 'json-object'),
      field('androidConfig.ttl', '消息缓存时间（秒）', 'text', {
        group: 'Android 配置',
      }),
      field('androidConfig.biTag', '批量任务消息标识', 'text', {
        group: 'Android 配置',
      }),
      field('androidConfig.data', '覆盖自定义消息负载', 'textarea', {
        group: 'Android 配置',
      }),
      field(
        'androidConfig.androidNotification.image',
        '通知右侧图片 URL',
        'text',
      ),
      field('androidConfig.androidNotification.when', '通知到达时间', 'text'),
      field(
        'androidConfig.androidNotification.buttons',
        '通知动作按钮',
        'json-array',
        {
          group: '动作按钮',
          maxItems: 3,
          placeholder: '[{"name":"打开应用","actionType":0}]',
        },
      ),
      field(
        'androidConfig.androidNotification.badgeNotification.addNum',
        '角标累加值',
        'integer',
        {
          group: '角标',
          min: 1,
          max: 99,
        },
      ),
      field(
        'androidConfig.androidNotification.badgeNotification.badgeClass',
        '入口 Activity 类',
        'text',
        {
          group: '角标',
        },
      ),
      field(
        'androidConfig.androidNotification.badgeNotification.setNum',
        '角标设置值',
        'integer',
        {
          group: '角标',
          min: 0,
          max: 99,
        },
      ),
      field(
        'androidConfig.androidNotification.notifyId',
        '通知覆盖 ID',
        'integer',
      ),
    ],
  },
  {
    key: 'harmonyOS',
    label: '鸿蒙',
    description: '鸿蒙 Push Kit 通知、场景化消息和点击行为配置。',
    fields: [
      common('pushType', '推送消息类型', 'select', {
        options: options([0, 1, 2, 6, 7, 10]),
        help: '非 0 类型需按场景配置 payload。',
      }),
      common('isTestMessage', '测试消息', 'boolean'),
      common('receiptId', '回执 ID'),
      common('category', '消息分类', 'text', { placeholder: 'IM' }),
      common('title', '通知标题'),
      common('body', '通知内容', 'textarea'),
      common('style', '通知样式', 'select', {
        group: '富文本',
        options: options([0, 1, 3]),
      }),
      common('bigTitle', '大文本标题', 'text', {
        group: '富文本',
        requiredWhen: { path: 'style', equals: [1] },
      }),
      common('bigBody', '大文本内容', 'textarea', {
        group: '富文本',
        requiredWhen: { path: 'style', equals: [1] },
      }),
      common('inboxContent', '多行文本内容', 'string-list', {
        group: '富文本',
        requiredWhen: { path: 'style', equals: [3] },
        maxItems: 3,
      }),
      common('actionType', '点击行为', 'select', {
        group: '点击行为',
        options: options([0, 1]),
      }),
      common('action', '页面 Action', 'text', { group: '点击行为' }),
      common('uri', '页面 URI', 'text', { group: '点击行为' }),
      common('payload', '场景化消息 Payload', 'json-object', {
        help: 'pushType 非 0 时使用，结构需匹配对应场景化消息。',
      }),
      field('image', '通知右侧图片 URL', 'text', {
        help: '必须使用 HTTPS 协议。',
      }),
      field('notifyId', '通知覆盖 ID', 'integer'),
      field('addNum', '角标累加值', 'integer', { group: '角标' }),
      field('setNum', '角标设置值（优先于累加值）', 'integer', {
        group: '角标',
      }),
      field('data', '自定义扩展参数', 'json-object'),
    ],
  },
];
