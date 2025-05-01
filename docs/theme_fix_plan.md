# Open WebUI 主题加载问题修复计划

**问题描述**:

在 `src/app.html` 中，页面加载时执行的 JavaScript 代码未能正确处理除了 `system`, `oled-dark`, `her`, `dark` 之外的其他主题，导致这些主题的样式在页面初始化时没有被正确应用。

**解决方案**:

修改 `src/app.html` 中的 JavaScript 代码，使其能够读取 `localStorage.theme` 中存储的任何主题名称，并将其设置为 `<html>` 元素的 `data-theme` 属性。同时，调整 meta theme color 和 splash image 的加载逻辑，使其与 `data-theme` 的设置保持一致。

**详细步骤**:

1.  **问题诊断**: 确认 `src/app.html` 中的 JavaScript 代码（第 40-108 行）只针对部分主题进行了显式处理，导致其他主题在页面加载时未能正确应用样式。
2.  **解决方案**: 修改 `src/app.html` 中的 JavaScript 代码，使其能够读取 `localStorage.theme` 中存储的任何主题名称，并将其设置为 `<html>` 元素的 `data-theme` 属性。同时，调整 meta theme color 和 splash image 的加载逻辑，使其与 `data-theme` 的设置保持一致。
3.  **详细步骤**:
    *   获取存储在 `localStorage.theme` 中的主题名称。
    *   获取 `<html>` 元素和 `<meta name="theme-color">` 标签。
    *   确定最终需要应用的主题名称（对于 `system` 主题，需要根据系统偏好判断是 `light` 还是 `dark`）。
    *   将 `<html>` 元素的 `data-theme` 属性设置为最终确定的主题名称。
    *   根据最终应用的主题名称，设置 `<meta name="theme-color">` 的 `content` 属性。我们将保留现有对 `system`, `oled-dark`, `light`, `her` 的特殊处理，并为其他主题设置一个默认的深色主题颜色（#171717）。
    *   保留 `oled-dark` 主题特有的 CSS 变量覆盖逻辑。
    *   移除原有的通过 `classList.add()` 添加主题类的逻辑。
    *   更新 `window.matchMedia` 监听器，使其在 `system` 主题下根据系统偏好变化正确更新 `data-theme` 和 meta theme color。
    *   更新 `setSplashImage` 函数，使其根据 `<html>` 元素的 `data-theme` 属性来判断是否为深色模式，从而选择加载 `splash-dark.png` 或 `splash.png`。

**计划总结**:

通过修改 `app.html` 中的初始化脚本，使其根据 `localStorage.theme` 的值统一设置 `<html>` 元素的 `data-theme` 属性，并相应地设置 meta theme color 和 splash image, 从而确保所有主题在页面加载时都能正确应用样式和相关行为。

**修改后的 JavaScript 代码片段**:
```javascript
// On page load or when changing themes, best to add inline in `head` to avoid FOUC
(() => {
    const htmlElement = document.documentElement;
    const metaThemeColorTag = document.querySelector('meta[name="theme-color"]');
    const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (!localStorage?.theme) {
        localStorage.theme = 'system';
    }

    let currentThemeName = localStorage.theme;
    let appliedThemeName = currentThemeName;
    let metaThemeColor = '#171717'; // Default dark color

    if (currentThemeName === 'system') {
        appliedThemeName = prefersDarkTheme ? 'dark' : 'light';
        metaThemeColor = prefersDarkTheme ? '#171717' : '#ffffff';
    } else if (currentThemeName === 'oled-dark') {
        // Keep specific CSS variable overrides for oled-dark if needed
        htmlElement.style.setProperty('--color-gray-800', '#101010');
        htmlElement.style.setProperty('--color-gray-850', '#050505');
        htmlElement.style.setProperty('--color-gray-900', '#000000');
        htmlElement.style.setProperty('--color-gray-950', '#000000');
        metaThemeColor = '#000000';
    } else if (currentThemeName === 'light') {
        metaThemeColor = '#ffffff';
    } else if (currentThemeName === 'her') {
        metaThemeColor = '#983724';
    }
    // For all other themes, appliedThemeName is the same as currentThemeName,
    // and metaThemeColor defaults to #171717 unless explicitly set above.

    htmlElement.setAttribute('data-theme', appliedThemeName);
    if (metaThemeColorTag) {
        metaThemeColorTag.setAttribute('content', metaThemeColor);
    }

    // Update listener for system theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
        if (localStorage.theme === 'system') {
            const newAppliedThemeName = e.matches ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newAppliedThemeName);
            if (metaThemeColorTag) {
                metaThemeColorTag.setAttribute('content', e.matches ? '#171717' : '#ffffff');
            }
            // setSplashImage(); // Re-run splash image logic on system theme change
        }
    });

    function setSplashImage() {
        const logo = document.getElementById('logo');
        const logoHer = document.getElementById('logo-her'); // Assuming logo-her exists
        const currentDataTheme = htmlElement.getAttribute('data-theme');

        // Define which themes are considered dark for splash image purposes
        const darkThemes = ['dark', 'oled-dark', 'her', 'blue-dark', 'green-dark', 'pink-dark', 'rosepine'];
        const isDarkMode = darkThemes.includes(currentDataTheme);

        if (logo) {
             if (isDarkMode) {
                const darkImage = new Image();
                darkImage.src = '/static/splash-dark.png';

                darkImage.onload = () => {
                    logo.src = '/static/splash-dark.png';
                    logo.style.filter = ''; // Ensure no inversion is applied if splash-dark.png exists
                };

                darkImage.onerror = () => {
                    logo.style.filter = 'invert(1)'; // Invert image if splash-dark.png is missing
                };
            } else {
                 // For light themes, use the default splash.png
                 logo.src = '/static/splash.png';
                 logo.style.filter = '';
            }
        }

        // Handle logo-her visibility based on theme, similar to existing CSS
        if (logoHer) {
             if (currentDataTheme === 'her') {
                 logoHer.style.display = 'block';
                 logoHer.style.filter = 'invert(1)'; // Keep inversion for her logo
                 if (logo) logo.style.display = 'none'; // Hide default logo if her logo is shown
             } else {
                 logoHer.style.display = 'none';
                  if (logo) logo.style.display = 'block'; // Show default logo if her logo is hidden
             }
        }
    }

    // Runs after classes are assigned (now data-theme is set)
    window.onload = setSplashImage;
})();
```