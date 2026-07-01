# 刚刚，Claude Sonnet 5 发布，国内直接使用！

**摘要：** Anthropic 刚刚发布 Claude Sonnet 5。它是目前 Agent 能力最强的 Sonnet 模型，在编程、推理、工具调用和知识工作上全面升级，性能直逼旗舰 Claude Opus 4.8。本文整理 Sonnet 5 的核心亮点、价格信息、安全表现，以及国内直接使用入口。

Claude 国内直接使用：

https://maynorai.jichiyun.sbs/buy/10

![Claude Sonnet 5 发布截图](https://upload.maynor1024.live/file/1782866354926_image-20260701083908094.png)

![Claude Sonnet 5 模型信息](https://upload.maynor1024.live/file/1782866168961_image-20260701083559278.png)

![Claude Sonnet 5 能力更新](https://upload.maynor1024.live/file/1782866346744_image-20260701083858028.png)

![Claude 国内直接使用入口](https://upload.maynor1024.live/file/1782869981816_image-20260701084239313.png)

---

## 🚀 Sonnet 5 这次强在哪？

Claude Sonnet 5，代号 Fennec。

这是 Anthropic 迄今为止 Agent 能力最强的 Sonnet 模型。它可以自主规划任务，调用浏览器和终端工具，在复杂代码、知识工作、资料分析和多步骤 Agent 流程里连续推进。

相比上一代 Sonnet 4.6，Sonnet 5 在推理、工具使用、编程和知识工作任务中都有明显提升。

划重点：

- SWE-bench Pro 得分 63.2%，超过 GPT-5.5 的 58.6%，接近 Opus 4.8 的 69.2%。
- Humanity's Last Exam 带工具得分 57.4%，距离 Opus 4.8 只差 0.5 个百分点。
- 标准价为每百万 token 输入 3 美元、输出 15 美元，只有 Opus 4.8 的六成。
- 浏览器注入攻击成功率只有 0.93%，安全表现非常突出。

![Claude Sonnet 5 数据截图](https://upload.maynor1024.live/file/1782866184301_image-20260701083613843.png)

![Claude Sonnet 5 模型对比](https://upload.maynor1024.live/file/1782866203864_image-20260701083633499.png)

---

## 🏆 全线逼近 Opus 4.8

![全线逼平 Opus 4.8](https://mmbiz.qpic.cn/sz_mmbiz_png/UicQ7HgWiaUb3uEdSPKrwGNmZEOaaGyzVvZ8dTtE9jU1rFsda3llYbCZpmWfiazUYjWBLTGvlPpXucH8Q0lEUJN3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=6)

Sonnet 系列一直是很多开发者最熟悉的 Claude 模型。从 Sonnet 3.5 开始，它就率先在写代码、用工具、跑 Agent 任务上展现出很强的执行力。

但过去一段时间，最强能力主要集中在 Opus 这条旗舰线上。Sonnet 5 的意义，就是把这部分能力重新下放到更高频、更有性价比的模型层。

在传统强项编程领域，Sonnet 5 在 SWE-bench Pro 上拿到 63.2%。前代 Sonnet 4.6 是 58.1%，Opus 4.8 是 69.2%。

Terminal-Bench 2.1 上，Sonnet 5 达到 80.4%，比 Sonnet 4.6 的 67.0% 大幅提升，距离 Opus 4.8 的 82.7% 也很近。

在 Humanity's Last Exam 上，Sonnet 5 带工具得分 57.4%，Opus 4.8 是 57.9%，只差 0.5 个百分点。

电脑操控能力方面，Sonnet 5 在 OSWorld-Verified 上拿到 81.2%，同样超过 GPT-5.5 的 78.7%，接近 Opus 4.8 的 83.4%。

![Claude Sonnet 5 实战成绩](https://upload.maynor1024.live/file/1782866213137_image-20260701083643774.png)

![Claude Sonnet 5 Benchmark 1](https://upload.maynor1024.live/file/1782866222474_image-20260701083654895.png)

![Claude Sonnet 5 Benchmark 2](https://upload.maynor1024.live/file/1782866228371_image-20260701083702244.png)

一句话总结：

**Sonnet 5 已经不是“便宜一点、弱一点”的中端模型，而是用 Sonnet 的价格，买到接近 Opus 的执行力。**

---

## 💰 价格是这次真正的杀招

![2 美元限时促销](https://mmbiz.qpic.cn/sz_mmbiz_png/UicQ7HgWiaUb3uEdSPKrwGNmZEOaaGyzVvZ8dTtE9jU1rFsda3llYbCZpmWfiazUYjWBLTGvlPpXucH8Q0lEUJN3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=10)

API 定价方面，Sonnet 5 首发限时价：

- 输入：2 美元 / 百万 tokens
- 输出：10 美元 / 百万 tokens

限时优惠到 2026 年 8 月 31 日。

之后恢复标准价：

- 输入：3 美元 / 百万 tokens
- 输出：15 美元 / 百万 tokens

相比 Opus 4.8 的 5 美元输入、25 美元输出，Sonnet 5 即使恢复原价，也依然便宜一大截。

这对多 Agent 工作流尤其关键。同样预算，以前可能只能跑一个 Opus 级 Agent；现在可以拆成多个 Sonnet 5 并行执行：一个读代码，一个查资料，一个写测试，一个做总结。

不过也要注意：Sonnet 5 换了新的 tokenizer，同样一段文本，token 数可能变成原来的 1.0 到 1.35 倍。长上下文、超大代码库、多轮 Agent 调用，仍然建议关注实际账单。

---

## 🛡️ 安全表现同样亮眼

![反杀全家族旗舰](https://mmbiz.qpic.cn/sz_mmbiz_png/UicQ7HgWiaUb3uEdSPKrwGNmZEOaaGyzVvZ8dTtE9jU1rFsda3llYbCZpmWfiazUYjWBLTGvlPpXucH8Q0lEUJN3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=12)

Sonnet 5 另一个容易被低估的点，是安全和防护能力。

提示注入攻击成功率只有 0.19%，和 Opus 4.8 持平。浏览器注入防御上，攻击成功率只有 0.93%，开启防护措施后可以降到 0%。

恶意代码注入方面，Sonnet 4.6 的攻击成功率曾高达 45.26%，Sonnet 5 降到 0.29%，改善幅度非常明显。

对开发者来说，这意味着它不仅能写业务代码，也更适合放进真实 Agent 工具链里执行复杂任务。

---

## 🎯 不争皇冠，专打高频场景

![不争皇冠，专砍腰部](https://mmbiz.qpic.cn/sz_mmbiz_png/UicQ7HgWiaUb3uEdSPKrwGNmZEOaaGyzVvZ8dTtE9jU1rFsda3llYbCZpmWfiazUYjWBLTGvlPpXucH8Q0lEUJN3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=16)

Sonnet 5 的定位非常精准。

它不一定要抢“最强模型”的皇冠，真正要吃下的是开发者和企业每天最常用的那一层：

- 日常编码
- 修 Bug
- 补测试
- 读项目
- 自动化办公
- 资料检索
- 知识整理
- 浏览器操作
- 终端执行
- 多 Agent 协作

这些任务不一定每次都需要最贵的旗舰模型，但它们需要稳定、便宜、能连续干活。

这正是 Sonnet 5 最强的地方。

![开发者钱包，今晚先投了票](https://mmbiz.qpic.cn/sz_mmbiz_png/UicQ7HgWiaUb3uEdSPKrwGNmZEOaaGyzVvZ8dTtE9jU1rFsda3llYbCZpmWfiazUYjWBLTGvlPpXucH8Q0lEUJN3Q/640?wx_fmt=png&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1#imgIndex=17)

---

## 🇨🇳 国内直接使用 Claude Sonnet 5

Claude 国内直接使用：

https://maynorai.jichiyun.sbs/buy/10

![Claude 国内直接使用二维码](https://upload.maynor1024.live/file/1782869981348_image-20260701083756690.png)

如果你之前觉得 Opus 太贵、普通模型又不够稳，那 Sonnet 5 很可能就是接下来最值得长期使用的 Claude。

它不是最贵的那个，但对大多数开发者和 AI 重度用户来说，它可能是最顺手、最划算、最适合天天用的那个。
