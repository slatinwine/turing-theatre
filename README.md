# 图灵剧场 · Turing Theatre

这段话，是人写的还是 AI 写的？上台便知 —— 一个"人机鉴别"互动剧场。

- **闯关**：随机抽一段 200 字内的文字，三选一（人写的 / AI 写的 / 说不准），答完立即揭盅，看本段骗过率
- **出题**：把你觉得有迷惑性的一段话献演上舞台，如实标记来源（人写 / 哪个模型），每天限 5 段
- **榜单**：最难分辨 Top 10、各来源平均骗过率榜——谁最能以假乱真，一目了然
- 开场自带 10 段保留剧目：4 段公版经典（鲁迅 / 朱自清 / 沈复）+ 6 段 AI 现场生成
- 防作弊：设备指纹，每段首次判定为准（不可改答案）；来源标记可被观众举报，误标 3 次自动下架

## 运行模式

| 模式 | 说明 |
|---|---|
| 云端模式 | 配置 `index.html` 中 `PUBLIC_CONFIG` 后，数据存 WorkBuddy 云数据库（PostgreSQL），全网共享剧目单与榜单 |
| 本机模式 | 云端探测失败或未配置时自动回退，数据存本浏览器 localStorage，自娱自乐 |

单文件应用（`index.html`），无构建步骤；云 SDK 同源托管（`workbuddy-cloud-sdk.js`），加载失败自动回退 CDN。

## 数据表（云端模式）

- `passages`：剧目单（id, text, is_ai, source_label, author_hash, reports, created_at）
- `guesses`：判定记录（passage_id, guesser_hash, guess, decisive, correct, created_at）

RLS：人人可读、匿名可写、客户端无删除权。

## 本地开发

```bash
node smoke-test.js   # 数据层冒烟测试（无需浏览器）
```

## 联系我

<div align="center">
  <img src="qrcode.jpg" width="180" alt="公众号二维码">&nbsp;&nbsp;&nbsp;
  <img src="xhs-qr.jpg" width="180" alt="小红书二维码">
  <p>
    <b>扫码关注公众号</b>：知识地下城 · 更多 AI 游戏与更新<br>
    <b>小红书 · 酒里加盐</b>（小红书号 6100441379）：酒馆会往酒里加盐，让顾客越喝越渴
  </p>
</div>
