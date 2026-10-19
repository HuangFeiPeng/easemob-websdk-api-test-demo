import {
  BASIC_PUSH_FIELDS,
  PUSH_VENDOR_SCHEMAS,
  type PushFieldSchema,
  type PushFormValues,
  type PushGeneratorInput,
  type PushVendorSchema,
  type ValidationIssue,
  type VendorId,
} from './schema';

export interface PushRequestBuildResult {
  requestBody: Record<string, any>;
  json: string;
  endpointPath: '/push/single' | null;
  errors: ValidationIssue[];
  warnings: string[];
}

interface ParsedSection {
  value: Record<string, any>;
  values: Record<string, unknown>;
}

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const addError = (
  errors: ValidationIssue[],
  vendor: VendorId | 'basic',
  field: PushFieldSchema,
  message: string,
) => {
  if (
    errors.some((error) => error.vendor === vendor && error.path === field.path)
  ) {
    return;
  }
  errors.push({ vendor, path: field.path, message });
};

const parseJson = (
  field: PushFieldSchema,
  raw: unknown,
  vendor: VendorId | 'basic',
  errors: ValidationIssue[],
) => {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      addError(errors, vendor, field, '请输入合法的 JSON');
      return undefined;
    }
  }
  const valid =
    field.type === 'json-object'
      ? typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      : Array.isArray(parsed);
  if (!valid) {
    addError(
      errors,
      vendor,
      field,
      field.type === 'json-object' ? '请输入 JSON 对象' : '请输入 JSON 数组',
    );
    return undefined;
  }
  return parsed;
};

const parseField = (
  field: PushFieldSchema,
  raw: unknown,
  vendor: VendorId | 'basic',
  errors: ValidationIssue[],
): unknown => {
  if (isBlank(raw)) return undefined;
  if (field.type === 'json-object' || field.type === 'json-array') {
    return parseJson(field, raw, vendor, errors);
  }
  if (field.type === 'integer' || field.type === 'number') {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      addError(errors, vendor, field, '请输入有效数字');
      return undefined;
    }
    if (field.type === 'integer' && !Number.isInteger(parsed)) {
      addError(errors, vendor, field, '请输入整数');
      return undefined;
    }
    return parsed;
  }
  if (field.type === 'boolean') {
    if (raw === true || raw === 'true') return true;
    if (raw === false || raw === 'false') return false;
    addError(errors, vendor, field, '请选择 true 或 false');
    return undefined;
  }
  if (field.type === 'string-list') {
    const items = Array.isArray(raw) ? raw : String(raw).split(/[\n,]/);
    const parsed = items.map((item) => String(item).trim()).filter(Boolean);
    return parsed.length ? parsed : undefined;
  }
  if (field.type === 'select' && field.options?.length) {
    const option = field.options.find(
      (candidate) => String(candidate.value) === String(raw),
    );
    if (!option) {
      addError(errors, vendor, field, '请选择有效的选项');
      return undefined;
    }
    return option.value;
  }
  return String(raw);
};

const validateField = (
  field: PushFieldSchema,
  value: unknown,
  values: Record<string, unknown>,
  vendor: VendorId | 'basic',
  errors: ValidationIssue[],
) => {
  if (field.required && value === undefined) {
    addError(errors, vendor, field, `请填写${field.label}`);
  }
  if (
    field.requiredWhen &&
    field.requiredWhen.equals.includes(
      values[field.requiredWhen.path] as string | number | boolean,
    ) &&
    value === undefined
  ) {
    addError(errors, vendor, field, `当前配置下请填写${field.label}`);
  }
  if (value === undefined) return;
  if (typeof value === 'number') {
    if (field.min !== undefined && value < field.min) {
      addError(errors, vendor, field, `不能小于 ${field.min}`);
    }
    if (field.max !== undefined && value > field.max) {
      addError(errors, vendor, field, `不能大于 ${field.max}`);
    }
  }
  if (field.maxLength !== undefined) {
    const length =
      typeof value === 'object' && value !== null
        ? JSON.stringify(value).length
        : String(value).length;
    if (length > field.maxLength) {
      addError(errors, vendor, field, `长度不能超过 ${field.maxLength} 字符`);
    }
  }
  if (field.maxItems !== undefined && Array.isArray(value)) {
    if (value.length > field.maxItems) {
      addError(errors, vendor, field, `最多支持 ${field.maxItems} 项`);
    }
  }
  if (
    field.maxKeys !== undefined &&
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > field.maxKeys
  ) {
    addError(errors, vendor, field, `最多支持 ${field.maxKeys} 个键`);
  }
};

const setDeep = (target: Record<string, any>, path: string, value: unknown) => {
  const parts = path.split('.');
  let current = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
      return;
    }
    if (!current[part] || typeof current[part] !== 'object') current[part] = {};
    current = current[part];
  });
};

const prune = (value: unknown): unknown => {
  if (isBlank(value)) return undefined;
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => [key, prune(child)] as const)
      .filter(([, child]) => child !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
};

const parseSection = (
  fields: PushFieldSchema[],
  input: PushFormValues,
  vendor: VendorId | 'basic',
  errors: ValidationIssue[],
): ParsedSection => {
  const values: Record<string, unknown> = {};
  const target: Record<string, any> = {};
  fields.forEach((field) => {
    const raw =
      input[field.path] === undefined ? field.defaultValue : input[field.path];
    const value = parseField(field, raw, vendor, errors);
    values[field.path] = value;
    validateField(field, value, values, vendor, errors);
    if (value !== undefined) setDeep(target, field.path, value);
  });
  return {
    value: (prune(target) as Record<string, any>) || {},
    values,
  };
};

const hasValue = (values: Record<string, unknown>, path: string) =>
  !isBlank(values[path]);

const validateVendorRules = (
  vendor: PushVendorSchema,
  section: ParsedSection,
  errors: ValidationIssue[],
  warnings: string[],
) => {
  const { values } = section;
  const field = (path: string) =>
    vendor.fields.find((item) => item.path === path);
  const requireField = (path: string, message: string) => {
    const schema = field(path);
    if (schema && !hasValue(values, path))
      addError(errors, vendor.key, schema, message);
  };

  if (vendor.key === 'oppo' && hasValue(values, 'notifyLevel')) {
    requireField('category', '使用 notifyLevel 时必须填写 category');
  }
  if (vendor.key === 'honor' || vendor.key === 'huawei') {
    const prefix =
      vendor.key === 'honor'
        ? 'androidConfig.androidNotification'
        : 'message.android.notification';
    if (
      values[`${prefix}.clickAction.type`] === 1 &&
      !hasValue(values, `${prefix}.clickAction.intent`) &&
      !hasValue(values, `${prefix}.clickAction.action`)
    ) {
      requireField(
        `${prefix}.clickAction.intent`,
        '打开自定义页面时，intent 和 action 至少填写一个',
      );
    }
  }
  if (
    vendor.key === 'harmonyOS' &&
    values.pushType !== undefined &&
    values.pushType !== 0 &&
    !hasValue(values, 'payload')
  ) {
    warnings.push('鸿蒙 pushType 非 0 时，通常需要按场景配置 payload。');
  }
  if (
    vendor.key === 'xiaomi' &&
    hasValue(values, 'templateId') &&
    !hasValue(values, 'channelId')
  ) {
    warnings.push(
      '小米私信模板通常需要同时配置 channelId，请结合平台模板联调确认。',
    );
  }
};

export const buildPushRequest = (
  input: PushGeneratorInput,
): PushRequestBuildResult => {
  const errors: ValidationIssue[] = [];
  const warnings: string[] = [];
  const basic = parseSection(
    BASIC_PUSH_FIELDS,
    input.basicValues,
    'basic',
    errors,
  );
  const pushMessage: Record<string, any> = { ...basic.value };

  input.selectedVendors.forEach((vendorId) => {
    const vendor = PUSH_VENDOR_SCHEMAS.find((item) => item.key === vendorId);
    if (!vendor) return;
    const section = parseSection(
      vendor.fields,
      input.vendorValues[vendorId] || {},
      vendorId,
      errors,
    );
    validateVendorRules(vendor, section, errors, warnings);
    if (Object.keys(section.value).length) {
      pushMessage[vendorId] = section.value;
    } else {
      warnings.push(`${vendor.label}未填写任何字段，已忽略空配置。`);
    }
  });

  const targets = input.targets.map((target) => target.trim()).filter(Boolean);
  if (input.outputMode === 'full') {
    if (!targets.length || targets.length > 100) {
      errors.push({
        vendor: 'basic',
        path: 'targets',
        message: '请输入 1–100 个目标用户 ID',
      });
    }
    if (
      !Number.isInteger(input.strategy) ||
      input.strategy < 0 ||
      input.strategy > 4
    ) {
      errors.push({
        vendor: 'basic',
        path: 'strategy',
        message: '请选择有效的推送策略',
      });
    }
  }

  const requestBody =
    input.outputMode === 'full'
      ? { targets, strategy: input.strategy, pushMessage }
      : pushMessage;

  return {
    requestBody,
    json: JSON.stringify(requestBody, null, 2),
    endpointPath: input.outputMode === 'full' ? '/push/single' : null,
    errors,
    warnings,
  };
};
