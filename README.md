# Flask-2048 游戏

注意：本项目全部由Claude 3.7 Sonnet制作，这是一个基于Flask框架实现的2048网页游戏，python环境使用Poetry进行构建和管理。

## 功能特点

- 经典2048游戏规则
- 响应式设计，适配不同设备
- 分数记录和排行榜
- 简洁直观的用户界面

## 安装说明

确保您已安装Python和Poetry，然后按照以下步骤进行安装：

```bash
# 克隆仓库
git clone https://github.com/kusutori/flask-2048.git
cd flask-2048

# 安装依赖
# 使用 Poetry
poetry install

# 启动应用
poetry run python app.py
```

应用将在 `http://localhost:5000` 运行。

## 如何游戏

- 使用方向键(↑ ↓ ← →)或滑动手势移动方块
- 相同数字的方块会合并
- 目标是创建一个值为2048的方块

## 技术栈

- 后端：Flask
- 前端：HTML, CSS, JavaScript

## 贡献指南

欢迎提交问题和拉取请求。对于重大更改，请先开issue讨论您想要更改的内容。

## 许可证

[MIT](LICENSE)