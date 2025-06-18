# WEBUI_BASE_URL 前端 localStorage 实现

## 功能概述

本实现为 Open WebUI 前端添加了自定义 base_url 功能，使其能够在 localStorage 中保存并读取，同时集成到用户设置系统中。

## 实现的功能

### 1. 用户设置集成
- ✅ 在 `Settings` 类型中添加了 `baseUrl` 字段
- ✅ 支持将 baseUrl 保存到用户设置数据库
- ✅ 支持从用户设置中读取 baseUrl

### 2. localStorage 同步
- ✅ baseUrl 变更时自动同步到 localStorage
- ✅ 应用启动时从 localStorage 读取 baseUrl
- ✅ 用户设置优先级高于 localStorage

### 3. 应用初始化
- ✅ 应用启动时从用户设置初始化 baseUrl
- ✅ 如果用户设置中有 baseUrl，会覆盖 localStorage 中的值
- ✅ 保持向后兼容性

### 4. 设置保存逻辑
- ✅ 设置保存时同步 baseUrl 到 baseUrl store
- ✅ 支持清空 baseUrl（重置为默认值）
- ✅ 验证 baseUrl 格式的有效性

## 修改的文件

### 1. `src/lib/stores/index.ts`
- 在 `Settings` 类型中添加了 `baseUrl?: string` 字段
- 导出了 `syncBaseUrlToSettings` 函数

### 2. `src/lib/stores/baseUrl.ts`
- 添加了 `setFromSettings` 方法，用于从用户设置设置 baseUrl
- 添加了 `initializeBaseUrlFromSettings` 函数
- 添加了 `syncBaseUrlToSettings` 函数（为将来的双向同步预留）

### 3. `src/routes/(app)/+layout.svelte`
- 在用户设置加载后调用 `initializeBaseUrlFromSettings`
- 确保 baseUrl 从用户设置正确初始化

### 4. `src/lib/components/chat/SettingsModal.svelte`
- 在 `saveSettings` 函数中添加了 baseUrl 同步逻辑
- 支持设置和清空 baseUrl

## 工作流程

### 应用启动时：
1. 应用加载用户设置
2. 如果用户设置中有 `baseUrl`，调用 `initializeBaseUrlFromSettings`
3. `baseUrl` store 更新，同时同步到 localStorage

### 用户修改设置时：
1. 用户在设置界面修改 baseUrl
2. 调用 `saveSettings` 函数
3. baseUrl 同步到 baseUrl store 和 localStorage
4. 用户设置保存到数据库

### 数据优先级：
1. 用户设置数据库（最高优先级）
2. localStorage
3. 默认值

## 测试

创建了 `test-baseurl-integration.html` 测试文件，包含以下测试：

1. **localStorage 保存/读取测试**
   - 测试 localStorage 的基本读写功能
   
2. **URL 验证测试**
   - 测试 baseUrl 格式验证功能
   
3. **用户设置集成测试**
   - 模拟从用户设置加载 baseUrl
   - 模拟保存 baseUrl 到用户设置
   
4. **baseUrl Store 测试**
   - 测试 store 的各种操作
   - 测试错误处理

## 使用方法

### 开发者使用：

```javascript
import { baseUrl, initializeBaseUrlFromSettings } from '$lib/stores';

// 从用户设置初始化
initializeBaseUrlFromSettings(userSettings);

// 监听 baseUrl 变化
baseUrl.subscribe((url) => {
    console.log('Base URL changed to:', url);
});

// 设置新的 baseUrl
baseUrl.set('http://localhost:3000');
```

### 用户使用：
1. 打开设置界面
2. 在 General 设置中找到 Base URL 选项
3. 输入自定义的 base URL
4. 保存设置

## 兼容性

- ✅ 向后兼容现有的 baseUrl 功能
- ✅ 不影响现有的 localStorage 逻辑
- ✅ 支持清空 baseUrl 重置为默认值
- ✅ 错误处理和验证

## 注意事项

1. **数据同步**：用户设置中的 baseUrl 会覆盖 localStorage 中的值
2. **验证**：所有 baseUrl 都会经过格式验证
3. **错误处理**：无效的 baseUrl 会被忽略并记录警告
4. **性能**：使用了 Svelte 的响应式系统，性能影响最小

## 后续改进建议

1. 添加 baseUrl 连接测试功能
2. 支持多个 baseUrl 配置文件
3. 添加 baseUrl 历史记录
4. 支持从环境变量读取默认 baseUrl
