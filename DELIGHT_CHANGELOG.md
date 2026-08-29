# Delight 改动明细（惊喜喜 ✨）

**验证**：`npx tsc --noEmit` → 退出码 0，零类型/编译错误。
**原则**：全部动效被 `globals.css` 文末 `prefers-reduced-motion` 规则归零；emoji 庆祝层 `aria-hidden`、不进 live region，读屏与 reduced-motion 用户均不受干扰。

## 新增文件
- `components/Celebration.tsx` —— 全局庆祝层。监听 `window` 事件 `lexiquest:celebrate`（detail: `{x,y,count,emojis}`），在坐标处迸发 emoji，1.6s 后自动回收。纯装饰、无障碍安全。

## 修改文件
### app/globals.css（微交互动效）
- `.btn` 加 `position:relative; overflow:hidden` + hover 光泽扫过、微抬；`.btn.primary:hover` 加 glow 阴影。
- `.opt.right` 弹一下确认；`.opt.wrong` 轻微抖动（答错给反馈不指责）。
- `.check.on` 勾选放大弹入。
- `.chip.flame:hover svg` 火苗摆动（连续打卡彩蛋感）。
- `.flip.open` 翻转揭示 pop。
- `.lvl-bar > i` 进度条流动微光；`.lvl.done .badge` 达成 pulse。
- `.toast` 弹入；`.hd .logo:hover` 轻跳。
- 新增 `.celebration-layer` / `.celebrate-emoji` 样式（floatup 动效，仅 transform/opacity）。

### app/page.tsx
- 导入并渲染 `<Celebration />`。
- Logo 变可聚焦彩蛋按钮（`role=button`/`tabIndex`/Enter·Space 触发），点击派发庆祝。
- `handleCompleteFormation` 完成时派发庆祝 + 文案升级为「组词大成！+N 分 🎉」。
- `handleToggleWord` 完成文案「学会一个 +N 分 ✨」。
- 单词空状态文案升级为鼓励式。

### components/WordCard.tsx
- 「看拆分」揭示时在该卡位置派发小庆祝（8 个 emoji）。

### components/FormationPractice.tsx
- 空状态文案「这个年龄段还没出题，换个挑战或明天再来～」。
- 答对「答对了，就是这个味 🎉」/ 答错「差一点点！再看看词根提示～」。

### components/ChallengePanel.tsx
- 连续打卡文案「连续 N 天，稳住别断签 🔥」。

## 可复用的触发方式
任意组件：
```ts
window.dispatchEvent(new CustomEvent("lexiquest:celebrate", {
  detail: { x: 200, y: 120, count: 16, emojis: ["🎉","🏆"] },
}));
```

## 后续可扩展（未做，避免破坏 a11y/聚焦）
- 闯关晋级时徽章处定向庆祝（需 ref 坐标）。
- 连续 7 天打卡专属徽章文案/彩蛋。
- Konami 彩虹模式**未采用**：会冲击已做好的对比度，违背 WCAG 底线。
