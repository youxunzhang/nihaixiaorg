# 中医经典内容目录

- `catalog.json`：可公开的书目、分册、篇名和古籍药名索引元数据。
- `review/`：待审核正文工作区。构建脚本不会复制这个目录。
- 正文只有同时满足 `sourceVerified`、`rightsCleared`、`complianceApproved` 且 `reviewStatus === "published"` 时才会生成公开页面。
- 不要在未取得合法底本、来源记录和内容审核结论前填写或发布古籍正文。
- 《伤寒论》的方药组成、用量、服法和《神农本草经》的功效、主治、剂量、禁忌等内容默认不公开。

