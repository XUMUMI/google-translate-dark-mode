# Google Translate Dark Mode

<a id="top"></a>

**Language:** [中文](#zh) | [English](#en)

![Google Translate dark mode screenshot](docs/images/google-translate-dark-mode.png)

<a id="zh"></a>

## 中文

[English](#en) | [回到顶部](#top)

给 Google 翻译添加深色模式和主题切换按钮。

安装后，Google Translate 页面右上角会多出一个主题按钮。点击按钮可以在浅色、深色、跟随系统之间切换。

### 脚本效果

- 把 Google Translate 主页面切换为深色界面。
- 支持浅色、深色、跟随系统三种模式。
- 记住上次选择，下次打开 Google Translate 会自动使用同一主题。
- 覆盖翻译输入框、翻译结果、语言选择、历史记录、收藏、词典详情等常见区域。
- 覆盖 Google Apps 面板和账号弹层中的部分浅色区域。
- 不需要额外权限，脚本声明为 `@grant none`。

### 安装方式

#### 1. 安装脚本管理器

先在浏览器里安装一个 userscript 管理器：

- Chrome / Edge：Tampermonkey 或 Violentmonkey
- Safari：Userscripts

#### 2. 添加脚本

打开本项目里的 `google-translate-dark-mode.user.js`，把脚本内容复制到脚本管理器中新建脚本里，然后保存并启用。

如果你是在 GitHub 上查看这个项目，也可以打开脚本文件的 Raw 页面，让脚本管理器自动识别安装。

#### 3. 打开 Google 翻译

访问：

https://translate.google.com/

页面右上角出现主题按钮后，说明脚本已经生效。

### 使用方式

点击右上角主题按钮切换模式：

- 太阳图标：浅色模式
- 月亮图标：深色模式
- 半圆图标：跟随系统

推荐日常使用“跟随系统”。如果你只想一直使用深色界面，切换到月亮图标即可。

### 适用范围

脚本主要适用于 Google Translate 网页版，包括：

- `translate.google.com`
- 常见地区域名，例如 `translate.google.com.hk`
- Google Translate 页面中打开的 Google Apps 面板和账号弹层

Google 页面经常更新，如果某些区域突然恢复浅色，通常是页面结构变了，需要更新脚本适配。

### 常见问题

**安装后没效果怎么办？**

先确认脚本管理器中脚本是启用状态，然后刷新 Google Translate 页面。如果还是没效果，检查当前页面地址是否是 `translate.google.com` 或对应地区域名。

**主题选择会同步到其他浏览器吗？**

不会。主题选择保存在当前浏览器本地。

**脚本会读取我的翻译内容吗？**

脚本不使用网络请求权限，也没有 userscript 特权 API。它主要做页面样式调整和主题状态保存。

### 许可证

当前脚本头部声明为 `GPL-3.0`。如果重新发布或修改发布，请保留原作者和许可证信息。

<a id="en"></a>

## English

[中文](#zh) | [Back to top](#top)

Add a dark mode and theme toggle button to Google Translate.

After installation, a theme button appears in the top-right area of Google Translate. Click it to switch between light, dark, and system theme modes.

### What It Does

- Turns the Google Translate web page into a dark interface.
- Supports light, dark, and system theme modes.
- Remembers your last selected mode and applies it the next time you open Google Translate.
- Covers common areas such as the translation input, translation result, language selector, history, saved items, and dictionary details.
- Also improves some light surfaces inside the Google Apps panel and account popover.
- Does not require extra userscript permissions. The script uses `@grant none`.

### Installation

#### 1. Install a userscript manager

Install a userscript manager in your browser:

- Chrome / Edge: Tampermonkey or Violentmonkey
- Safari: Userscripts

#### 2. Add the script

Open `google-translate-dark-mode.user.js`, copy its content into a new script in your userscript manager, then save and enable it.

If you are viewing this project on GitHub, you can also open the script file's Raw page and let your userscript manager detect the installation.

#### 3. Open Google Translate

Visit:

https://translate.google.com/

When the theme button appears in the top-right area, the script is working.

### Usage

Click the theme button in the top-right area to switch modes:

- Sun icon: light mode
- Moon icon: dark mode
- Half-circle icon: system mode

System mode is recommended for daily use. If you always want a dark interface, switch to the moon icon.

### Supported Pages

The script is mainly designed for the Google Translate web app, including:

- `translate.google.com`
- Common regional domains, such as `translate.google.com.hk`
- Google Apps panels and account popovers opened from Google Translate

Google updates its pages frequently. If an area suddenly turns light again, the page structure probably changed and the script may need an update.

### FAQ

**The script does not work after installation. What should I do?**

Make sure the script is enabled in your userscript manager, then refresh Google Translate. If it still does not work, check that the current page is `translate.google.com` or a supported regional Google Translate domain.

**Will my theme choice sync across browsers?**

No. The theme choice is stored locally in the current browser.

**Does the script read my translation content?**

The script does not use network-request permissions or privileged userscript APIs. It mainly adjusts page styles and saves the selected theme mode locally.

### License

The current userscript metadata declares `GPL-3.0`. If you redistribute or publish modified versions, keep the original author and license information.
