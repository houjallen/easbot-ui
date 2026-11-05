# File 文件上传

> 文件 / 图片上传组件族，包含 4 个职责分离的组件（`InputFile` / `InputImage` / `Dropzone` / `FileList`）与一组上传工具函数。

---

**导入**

```tsx
import { InputFile, InputImage, Dropzone, FileList, uploadFile, validateFile } from '@easbot/ui';
```

## 基础用法

`InputFile` 是入口组件，内置拖拽区 + 文件列表 + 上传流水线：

```tsx
import { useState } from 'react';
import { InputFile } from '@easbot/ui';
import type { FileInfo } from '@easbot/ui';

export default function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);

  return (
    <InputFile
      value={files}
      onChange={setFiles}
      multiple
      validation={{ accept: ['.pdf', '.docx'], maxSize: 10 * 1024 * 1024, maxCount: 5 }}
      onSuccess={(file) => console.log('上传成功', file.name)}
      onError={(file, error) => console.log('上传失败', file.name, error.message)}
    />
  );
}
```

`InputImage` 在此基础上强制图片类型、picture-card 列表，并内置大图预览弹窗：

```tsx
import { InputImage } from '@easbot/ui';

<InputImage multiple value={images} onChange={setImages} />;
```

单独使用底层组件：

```tsx
import { Dropzone, FileList } from '@easbot/ui';

<Dropzone
  enabled
  text="拖拽文件到此区域上传"
  hint="支持批量上传，单个文件不超过 50MB"
  accept=".pdf,.docx"
  multiple
  onDrop={(files) => console.log(files)}
/>;

<FileList files={fileInfos} onRemove={(f) => console.log('移除', f.name)} />;
```

## 四个组件的职责边界

| 组件         | 职责                                                                    | 不负责                                 |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------- |
| `InputFile`  | 上传流水线的**编排者** —— 选择 / 拖拽入口、校验、上传、状态维护         | 不渲染列表样式细节（交给 `FileList`）  |
| `InputImage` | `InputFile` 的**图片特化壳** —— 强制 `picture-card`、图片校验、预览弹窗 | 不实现裁剪（裁剪是 TODO 占位）         |
| `Dropzone`   | **拖拽 / 点击选文件的交互区**（含拖拽高亮态）                           | 不做校验、不上传、不维护文件列表       |
| `FileList`   | **文件列表的渲染器**（4 种列表样式 + 状态图标 + 操作按钮）              | 不做校验、不上传、不触发原生文件选择器 |

### `InputFile` 的三种展示模式

模式由 `dropzone.enabled` 与 `fileList.showUploadButton` **共同决定**（源码中的判定顺序）：

| 模式         | 判定条件                                                             | 渲染内容                                |
| ------------ | -------------------------------------------------------------------- | --------------------------------------- |
| **拖拽模式** | `dropzone.enabled === true`（**默认值**）                            | 拖拽区 + 文件列表（**不显示**追加按钮） |
| **追加模式** | `dropzone.enabled === false` 且 `fileList.showUploadButton === true` | 只有文件列表（含「+」追加按钮）         |
| **按钮模式** | `dropzone.enabled === false` 且 未开 `showUploadButton`              | 独立上传按钮 + 文件列表                 |

> 📌 默认 `dropzone = { enabled: true }`、默认 `fileList = { showList: true, listType: 'text' }` —— 因此**默认是拖拽模式**。

### `FileList` 的四种列表样式

由 `fileList.listType` 决定：

| listType         | 渲染形态                                                | 追加按钮形态              |
| ---------------- | ------------------------------------------------------- | ------------------------- |
| `'text'`         | 单行卡片：文件图标 + 名称 + 大小 + 状态 + 操作按钮      | 不渲染（`text` 无追加位） |
| `'picture'`      | 左侧 48×48 缩略图 + 右侧 `text` 样式信息                | 不渲染                    |
| `'picture-card'` | 120×120 方卡（1:1 比例）+ 遮罩状态层 + 右上角操作按钮组 | 120×120 虚线方卡          |
| `'tag'`          | `Badge` 标签流（按状态换配色），文件名超长截断          | `Badge` 内嵌 `+` 按钮     |

## 上传流水线

`InputFile` 的处理顺序（源码 `handleFileSelect`）：

```
选择文件 → 数量校验 → 逐个文件：类型/大小校验 → beforeUpload → 入列表
        → （autoUpload && upload）逐个上传
```

- **数量校验**：超出 `validation.maxCount` 时**不加入任何文件**，只触发 `onError`（传一个占位 `FileInfo`：`name` 为空字符串、`size` 为 0）。
- **单文件校验失败**：该文件**仍会进入列表**，但 `status` 置为 `'error'`、`error` 写入错误文案，并触发 `onError`。
- **`beforeUpload` 返回 `false`**：该文件**被丢弃**（不入列表、不触发 `onError`）；返回 `void` / `undefined` / `true` 均视为**放行**（常见于「只做副作用、不否决」的用法）；**抛错**则该文件入列表并标记为 `'error'`。
- **上传触发条件**：`autoUpload`（默认 `true`）**且**传入了 `upload` 配置。

### 上传配置（`UploadConfig`）

```tsx
<InputFile
  upload={{
    action: '/api/files/upload',
    name: 'file',
    data: (file) => ({ bizType: 'avatar' }),
    headers: { Authorization: 'Bearer xxx' },
  }}
  httpClient={defHttp}
/>
```

> ⚠️ **`UploadConfig` 中只有 `action` / `name` / `data` 真正生效**。源码 `uploadSingleFile` 只读取 `upload.action`（作为请求 `url`）、`upload.name`（字段名）、`upload.data`（附加表单数据）。`method` / `headers` / `withCredentials` / `timeout` 四个字段在当前实现中**未被使用**。

### `httpClient` 契约

`uploadFile(httpClient, file, config)` 通过 `httpClient.uploadFile(requestConfig, uploadParams)` 发起请求，因此注入的客户端必须提供该方法：

```tsx
type HttpClient = {
  uploadFile: (requestConfig: AxiosRequestConfig, uploadParams: UploadFileParams) => Promise<any>;
};
```

响应会被归一化为 `UploadResponse`：

| 字段       | 来源                                                     |
| ---------- | -------------------------------------------------------- |
| `success`  | `true`（请求成功）/ `false`（**未注入 `httpClient`**）   |
| `url`      | `response.data.url` ?? `response.url`                    |
| `thumbUrl` | `response.data.thumbUrl` ?? `response.thumbUrl`          |
| `data`     | `response.data`                                          |
| `message`  | `response.msg` ?? `response.message` ?? 内置「上传成功」 |

> ❗ **不传 `httpClient` 会标记为 `error`（不再假成功）**：
> `httpClient` 是**消费方注入的外部依赖**。未注入（或注入的客户端没有 `uploadFile` 方法）时，
> `uploadFile` 返回 `{ success: false, message: '未注入 HTTP 客户端，无法上传文件' }`，
> 组件走失败分支把该文件标记为 `status: 'error'` 并触发 `onError` ——
> **不会**出现「标记成功但 `url` 为 `undefined`」的情况。

> 📌 **失败时的文案来源**：内置文案表 `fileMessages.httpClientMissing`（zh-CN + en-US 双语）。
> 组件库不引入外部 i18n 库，语言由消费方通过 `locale` prop 注入。

## 属性

## 属性

继承自 `BaseUploadProps`。

| 属性           | 类型                                                                                                   | 默认值 | 说明                 |
| -------------- | ------------------------------------------------------------------------------------------------------ | ------ | -------------------- |
| `httpClient?`  | `{ uploadFile: (requestConfig: AxiosRequestConfig, uploadParams: UploadFileParams) => Promise<any>; }` | —      | 统一HTTP客户端实例   |
| `locale?`      | `string`                                                                                               | —      | 语言                 |
| `placeholder?` | `string`                                                                                               | —      | 占位符文本           |
| `buttonText?`  | `string`                                                                                               | —      | 上传按钮文本         |
| `name?`        | `string`                                                                                               | —      | 字段名（表单场景用） |

## 属性（InputImageProps）

继承自 `ImageUploadProps`。

| 属性           | 类型                           | 默认值 | 说明                                        |
| -------------- | ------------------------------ | ------ | ------------------------------------------- |
| `httpClient?`  | `InputFileProps['httpClient']` | —      | 统一HTTP客户端实例（与 InputFile 保持一致） |
| `name?`        | `string`                       | —      | 字段名（表单场景用）                        |
| `placeholder?` | `string`                       | —      | 占位符文本                                  |

## 属性（DropzoneProps）

继承自 `DropzoneConfig`。

| 属性        | 类型                      | 默认值 | 说明           |
| ----------- | ------------------------- | ------ | -------------- |
| `disabled?` | `boolean`                 | —      | 是否禁用       |
| `onDrop?`   | `(files: File[]) => void` | —      | 文件拖拽回调   |
| `onUpload?` | `() => void`              | —      | 点击上传回调   |
| `accept?`   | `string`                  | —      | 接受的文件类型 |
| `multiple?` | `boolean`                 | —      | 是否多选       |

## 属性（FileListProps）

继承自 `FileListConfig`。

| 属性          | 类型                       | 默认值 | 说明               |
| ------------- | -------------------------- | ------ | ------------------ |
| `files`       | `FileInfo[]`               | —      | 文件列表           |
| `onRemove?`   | `(file: FileInfo) => void` | —      | 删除文件回调       |
| `onPreview?`  | `(file: FileInfo) => void` | —      | 预览文件回调       |
| `onDownload?` | `(file: FileInfo) => void` | —      | 下载文件回调       |
| `onUpload?`   | `() => void`               | —      | 追加上传回调       |
| `disabled?`   | `boolean`                  | —      | 是否禁用           |
| `isMaxFiles?` | `boolean`                  | —      | 是否达到最大文件数 |

`InputFileProps` 继承 `BaseUploadProps`；`InputImageProps` 继承 `ImageUploadProps`（`Omit<BaseUploadProps, 'fileList'>`）；`DropzoneProps` 继承 `DropzoneConfig`；`FileListProps` 继承 `FileListConfig`。

本表只列组件自有属性；此外 `IconButton` 等底层按钮还透传各自的原生属性。

> ⚠️ **`DropzoneProps` / `FileListProps` 未从包根导出**（源码中它们是**未 `export` 的局部 interface**）。需要这两个类型时请在消费方自行声明，或直接使用 `DropzoneConfig` / `FileListConfig`（这两个已导出）。

### 配置对象字段

| 配置对象         | 关键字段                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UploadConfig`   | `action`（必填，上传地址）/ `name`（字段名）/ `data`（对象或函数）/ `method` / `headers` / `withCredentials` / `timeout`                           |
| `FileValidation` | `accept`（扩展名或 MIME 数组）/ `maxSize`（字节）/ `minSize`（字节）/ `maxCount`（数量）                                                           |
| `DropzoneConfig` | `enabled`（是否拖拽模式）/ `text` / `hint` / `children`（自定义内容）/ `className`                                                                 |
| `FileListConfig` | `showList` / `listType` / `showRemove` / `showDownload` / `showPreview` / `showUploadButton` / `uploadButtonText` / `listClassName` / `itemRender` |
| `CropConfig`     | `enabled` / `aspectRatio` / `quality` / `format`（`jpeg` \| `png` \| `webp`）/ `cropperProps`                                                      |

> `ImageUploadProps.fileList` 的类型是 `ImageFileListConfig` —— 它把 `listType` 收窄为**只能是 `'picture-card'`**。但 **`ImageFileListConfig` 未从包根导出**（`src/ui/file/index.ts` 未 re-export 它）。

### `FileInfo` 与 `FileStatus`

| 字段        | 类型                  | 说明                                                                |
| ----------- | --------------------- | ------------------------------------------------------------------- |
| `id`        | `string`              | 唯一标识（`generateId()` 生成）                                     |
| `file?`     | `File`                | 原始文件对象                                                        |
| `name`      | `string`              | 文件名                                                              |
| `size`      | `number`              | 字节数                                                              |
| `type`      | `string`              | MIME 类型                                                           |
| `url?`      | `string`              | 上传成功后的地址                                                    |
| `thumbUrl?` | `string`              | 缩略图地址                                                          |
| `status`    | `FileStatus`          | `'pending'` / `'uploading'` / `'success'` / `'error'` / `'removed'` |
| `progress?` | `number`              | 上传进度 0-100                                                      |
| `error?`    | `string`              | 错误信息                                                            |
| `extra?`    | `Record<string, any>` | 上传响应的 `data`                                                   |

## 工具函数

```tsx
import {
  generateId,
  formatFileSize,
  validateFile,
  fileToFileInfo,
  isImageFile,
  getFilePreviewUrl,
  uploadFile,
} from '@easbot/ui';
```

| 函数                            | 说明                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `generateId()`                  | 生成 `file_<时间戳>_<随机串>` 形式的唯一 ID                                  |
| `formatFileSize(bytes)`         | 字节数 → `'1.5 MB'` 形式的可读字符串（单位 `B` / `KB` / `MB` / `GB` / `TB`） |
| `validateFile(file, rules)`     | 按 `FileValidation` 校验，返回**错误文案**或 `null`（通过时返回 `null`）     |
| `fileToFileInfo(file)`          | `File` → `FileInfo`（`status: 'pending'` / `progress: 0`）                   |
| `isImageFile(file)`             | 判断是否为图片（`File` 看 `file.type`，`FileInfo` 看 `file?.type ?? type`）  |
| `getFilePreviewUrl(file)`       | `URL.createObjectURL(file)`，**调用方需自行 `revoke`**                       |
| `uploadFile(client, file, cfg)` | 通过 `httpClient.uploadFile` 上传单个文件，返回 `Promise<UploadResponse>`    |

`validateFile` 的类型匹配规则：

- 以 `.` 开头 → **扩展名匹配**（`file.name` 后缀，忽略大小写），如 `'.pdf'`。
- 含 `/` → **MIME 匹配**（把 `*` 替换为 `.*` 后正则匹配 `file.type`），如 `'image/*'`。
- 其余写法一律**不匹配**（既不是扩展名也不是 MIME）。

> ⚠️ `utils.ts` 中还有 `getRemoteFilePreviewUrl` / `revokeFilePreviewUrl` / `uploadMultipleFiles` 三个函数，但**未从包根导出**。

## 无障碍

- `InputFile` / `InputImage` 内部使用一个**视觉隐藏**的原生 `<input type="file">`（`className="hidden"`）承接选择行为 —— 它带 `name` / `accept` / `multiple` / `disabled` 原生属性，但**没有关联的 `<label>`**；如需无障碍名称，请在消费方自行用 `<label>` 包裹或补充 `aria-label`。
- `Dropzone` 的容器是 `<div role="button" tabindex="0">`：**支持键盘**（`Enter` / `Space` 触发上传点击）、点击与拖拽。`enabled === false` 或 `disabled` 时会移除 `role` / `tabIndex` 并标记 `aria-disabled="true"`，同时**点击 / 键盘 / 拖放三条路径均不触发回调**（三条路径的拦截条件一致）。拖拽区内的 `<input type="file">` 是 `hidden` 且 `disabled` 跟随组件状态。
- `Dropzone` 拖拽悬停时渲染的「释放文件开始上传」覆盖层是纯视觉提示（`<div>` + 图标 + 文本），不注入 `aria-live`。
- `FileList` 的操作按钮是原生 `<button type="button">`，天然键盘可达：
  - `text` 样式下预览 / 下载 / 删除是三个独立按钮，均带 `aria-label`（内置文案：`预览` / `下载文件` / `移除`）。
  - `picture-card` 样式下的三个操作按钮是 `IconButton`，同样带 `aria-label`（与 `text` 样式一致的内置文案）。
  - `tag` 样式下点击整个 `Badge` 会触发下载（仅当 `status === 'success'` 且有 `url`），删除按钮会 `stopPropagation` 避免误触下载。
- `FileList` 的状态图标（`Loader2` / `CheckCircle` / `AlertCircle`）是纯装饰，**无文本替代**；但 `text` 样式下会同时显示进度百分比或错误文案。
- `InputImage` 的预览弹窗使用 `Dialog`（Radix primitives），具备焦点陷阱、`Escape` 关闭与关闭后的焦点回收。

## 注意事项

- **默认是拖拽模式，不是按钮模式**：想用「选择文件」按钮需显式传 `dropzone={{ enabled: false }}`。
- ⚠️ **`dropzone={{}}` 会退回按钮模式**：`dropzone = { enabled: true }` 是**默认参数**（仅在 prop 为 `undefined` 时生效）。一旦传入 `dropzone={{ text: '...' }}`，`enabled` 变成 `undefined` → `isDragMode` 为假 → 组件认为「不是拖拽模式」。想保留拖拽区又改文案，必须显式写 `dropzone={{ enabled: true, text: '...' }}`。
- **追加模式需要显式打开**：`fileList.showUploadButton` 默认为 `undefined`（false），因此默认配置下**没有「+」追加入口**。
- **`InputImage` 为 `fileList` 填了默认值，但默认值可以被覆盖**：`InputImage` 内部按「内置默认 → 消费方 `fileList`」的顺序展开，因此 `listType` 只是**默认**为 `'picture-card'`（类型上被 `ImageFileListConfig` 收窄为只能是该值），消费方显式传的 `fileList` 依然生效。
- **`InputImage` 把 `dropzone.enabled` 默认设为 `false`**：展开顺序是 `{ enabled: false, children, ...props.dropzone }` —— 消费方传 `dropzone={{ enabled: true }}` **可以覆盖回来**，但那样 `dropzoneChildren`（那段「点击或拖拽图片到此区域上传」）才会真正渲染出来。
- **`InputImage` 默认只接受图片**：默认 `validation = { accept: ['image/*'], maxSize: 5MB }`，并在 `beforeUpload` 里**再次校验** `isImageFile`，非图片抛「只能上传图片文件」。
- **裁剪功能是占位实现**：`crop.enabled` 会渲染裁剪弹窗，但确认按钮只 `console.debug('裁剪文件:', croppedFile)`（源码标注 `TODO: 实现裁剪逻辑`），**不会真正裁剪**。而且 `handleCrop` **没有挂到任何元素上** —— 裁剪弹窗在当前实现下**无法被打开**。
- **`preview` 属性被接受但未使用**：`ImageUploadProps.preview` 在 `InputImage` 中被解构出来却没有参与渲染（预览走内部 state），传了没有效果。
- **`InputImage` 的 `dropzoneChildren` 实际不会渲染**：追加 / 按钮模式下 `Dropzone` 整体不渲染，那段「点击或拖拽图片到此区域上传」的内容只在 `dropzone.enabled === true` 时才会出现。
- **`FileList` 的图片缩略图会泄漏 Object URL**：`picture` 与 `picture-card` 样式下每次渲染都调用 `URL.createObjectURL(file.file)` 且**从不 `revoke`** —— 长时间停留的页面会持续占用内存。
- **`FileList` 在 `showList === false` 时返回 `null`**；且「无文件且不显示上传按钮」时也返回 `null`（列表区域整体消失）。
- **`itemRender` 完全接管单项渲染**：提供后 `text` / `tag` / `picture-card` 三种内置单项渲染**全部被替换**，调用方需自行处理删除 / 预览 / 下载按钮（通过第三个参数 `actions` 拿到回调）。
- **`onRemove` 可以否决删除**：返回 `false` 或抛错都会**中止**移除；返回 `true` / `undefined` 才真正移除。
- **`onDownload` 有默认行为**：未传时若文件有 `url`，组件会**动态创建 `<a download>` 并触发点击**（打开新窗口）。传了 `onDownload` 则完全接管。
- **状态是受控 + 内部双轨**：`value` 变化会通过 `useEffect` 同步进内部 `files`；组件同时在 `onChange` 中回传新列表 —— 典型用法是 `value={files} onChange={setFiles}`。
- **`maxCount` 判定用的是「已有 + 新增」**：不是「已有数量」，因此一次多选超限会**整批被拒**（不是截断到上限）。
- **`FileList` 的 `listClassName`** 只作用在 `text` / `tag` / `picture-card` 的外层容器；`picture` 样式下会同时被套用到**每个条目**上。
- **`className` 合并到根容器末位**，自定义类名优先级最高。
- **组件库不消费任何主题 CSS 变量**（`src/ui/file/` 下无 `var(--*)` 引用），配色全部走 Tailwind 语义类。

## 导出

### 组件

| 导出名             | 说明 |
| ------------------ | ---- |
| `BaseUploadProps`  |      |
| `CropConfig`       |      |
| `Dropzone`         |      |
| `DropzoneConfig`   |      |
| `FileInfo`         |      |
| `FileList`         |      |
| `FileListConfig`   |      |
| `FileStatus`       |      |
| `FileValidation`   |      |
| `ImageUploadProps` |      |
| `InputFile`        |      |
| `InputImage`       |      |
| `UploadConfig`     |      |
| `UploadResponse`   |      |

### 类型与工具函数

| 导出名              | 说明 |
| ------------------- | ---- |
| `fileToFileInfo`    |      |
| `formatFileSize`    |      |
| `generateId`        |      |
| `getFilePreviewUrl` |      |
| `isImageFile`       |      |
| `uploadFile`        |      |
| `validateFile`      |      |
