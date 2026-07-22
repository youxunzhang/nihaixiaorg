# 中医书库内容目录

本站继续输出纯静态 HTML，`content` 目录保存可批量扩展的 MDX 内容源：

- `books/`：每本书一份文件
- `authors/`：每位医家一份文件
- `topics/`：每个专题一份文件

书籍 `slug` 同时用于详情页、相关推荐和 `data/affiliate-links.js` 的购买链接配置。新增内容时应保留 `title`、`description`、`category`、`author`、`published`、`updated` 等 SEO 字段。

医籍原文、现代整理本与出版社信息可能存在版本差异，录入时应核对来源；涉及在世作者或现代出版物时，不在 MDX 中复制受版权保护的正文。
